const AWS = require('aws-sdk');
const sql = require('mssql');

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();


const S3_BUCKET_NAME = 'imagenes-talanquera-inteligente';
let isPersonChek = false;
let isCarChek = false;
let errorMessage = '';
let imageBuffer = null;
let detectedPlateText = null;

const sqlConfig = {
  user: 'admin',
  password: 'Skelett337626',
  server: 'dbtalanquerainteligente.cnwq4qec0kw3.us-east-2.rds.amazonaws.com',
  database: 'Talanquera_Inteligente',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

module.exports.handler = async (event) => {
  try {
    console.log('Evento recibido:', event);
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    const { 
      dpiVisita, nombreVisita, dpiResidente, 
      clusterDestino, numViviendaDestino, metodoIngreso, 
      datoBiometrico, numIngresos } = JSON.parse(event.body);

    console.log("Parametros recibidos: ", { 
      dpiVisita, nombreVisita, dpiResidente, 
      clusterDestino, numViviendaDestino, metodoIngreso, 
      datoBiometrico, numIngresos });

    if (!dpiVisita || !dpiResidente || !clusterDestino || !numViviendaDestino || !metodoIngreso || !numIngresos) {
      throw new Error('Faltan campos obligatorios');
    }

    const searchHomeQuery = 'SELECT * FROM vivienda WHERE numCasa = @numHome AND cluster = @cluster';
    request.input('numHome', sql.Int, numViviendaDestino);
    request.input('cluster', sql.VarChar, clusterDestino);
    const homeResult = await request.query(searchHomeQuery);

    const searchResidentQuery = 'SELECT * FROM residentes WHERE dpi = @searchDPIResidente';
    request.input('searchDPIResidente', sql.VarChar, dpiResidente);
    const residentResult = await request.query(searchResidentQuery);

    const searchVisitaQuery = 'SELECT * FROM visitas WHERE dpiVisita = @dpiVisita';
    request.input('dpiVisita', sql.VarChar, dpiVisita);
    const visitaResult = await request.query(searchVisitaQuery);

    if (homeResult.recordset.length === 0) {
      throw new Error('Cluster o vivienda no existente');
    }
    if (residentResult.recordset.length === 0 || residentResult.recordset[0].estado === 0) {
      throw new Error('DPI de residente no se encuentra registrado en la base de datos.');
    }
    if(residentResult.recordset[0].idVivienda !== homeResult.recordset[0].idVivienda){
      throw new Error('Direccion destino no coincide con la direccion del Residente.');
    }

    await analyzeImageFromBytes(datoBiometrico);

    console.log('Tipo de ingreso: ', metodoIngreso);
    
    if (metodoIngreso === 'Peatonal') {

      if (!isPersonChek) {
        throw new Error('No se dectecto una persona.');
      }

      const s3Params = {
        Bucket: S3_BUCKET_NAME,
        Key: `Fotos_Visitas/${dpiVisita}.jpg`,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
      };

      const uploadResult = await s3.upload(s3Params).promise();
      console.log('Subida a S3 exitosa:', uploadResult.Location);
      
      request.input('idViviendaDestino', sql.Int, homeResult.recordset[0].idVivienda);
      request.input('image', sql.VarChar, uploadResult.Location);
      request.input('dpiResidente', sql.VarChar, residentResult.recordset[0].dpi);
      request.input('numIngresos', sql.Int, numIngresos);
      
      if (visitaResult.recordset.length > 0) {
        await request.query(`
          UPDATE visitas 
          SET estado = 1, datoBiometrico = @image, dpiResidente = @dpiResidente, 
              metodoIngreso = 'Peatonal', matriculaVehiculo = 'No vehiculo', numIngresos = @numIngresos, idViviendaDestino = @idViviendaDestino
          WHERE dpiVisita = @dpiVisita
        `);
      } else {
        request.input('nombreVisita', sql.VarChar, nombreVisita);
        await request.query(`
          INSERT INTO visitas (dpiVisita, nombreVisita, idViviendaDestino, dpiResidente, metodoIngreso, datoBiometrico, matriculaVehiculo, numIngresos, estado)
          VALUES (@dpiVisita, @nombreVisita, @idViviendaDestino, @dpiResidente, 'Peatonal', @image, 'No vehiculo', @numIngresos, 1)
        `);
      }

      const rekognitionParams = {
        CollectionId: 'Faces',
        Image: { S3Object: { Bucket: S3_BUCKET_NAME, Name: `Fotos_Visitas/${dpiVisita}.jpg` } },
        ExternalImageId: `Nombre:${nombreVisita.replace(/\s+/g, '-')}_DPI:${dpiVisita.replace(/\s+/g, '-')}`,
      };
      await rekognition.indexFaces(rekognitionParams).promise();
      
    } else if (metodoIngreso === 'Vehicular') {
      if (!isCarChek) {
        throw new Error('No se detecto un vehiculo, intente de nuevo.');
      }


      const detectedText = detectedPlateText;
      console.log("Placa detectada:", detectedText);

      const s3Params = {
        Bucket: S3_BUCKET_NAME,
        Key: `Fotos_MatriculasVisitas/${dpiVisita}.jpg`,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
      };
      const uploadResult = await s3.upload(s3Params).promise();
      console.log('Subida a S3 exitosa:', uploadResult.Location);

      request.input('image', sql.VarChar, uploadResult.Location);
      request.input('matriculaVehiculo', sql.VarChar, detectedText);
      request.input('idViviendaDestino', sql.Int, homeResult.recordset[0].idVivienda);
      request.input('dpiResidente', sql.VarChar, residentResult.recordset[0].dpi);
      request.input('numIngresos', sql.Int, numIngresos);

      if (visitaResult.recordset.length > 0) {
        await request.query(`
          UPDATE visitas 
          SET estado = 1, datoBiometrico = @image, dpiResidente = @dpiResidente, 
              metodoIngreso = 'Vehicular', matriculaVehiculo = @matriculaVehiculo, numIngresos = @numIngresos, idViviendaDestino = @idViviendaDestino
          WHERE dpiVisita = @dpiVisita
        `);
      } else {
        await request.query(`
          INSERT INTO visitas (dpiVisita, idViviendaDestino, dpiResidente, metodoIngreso, datoBiometrico, matriculaVehiculo, numIngresos, estado)
          VALUES (@dpiVisita, @idViviendaDestino, @dpiResidente, 'Vehicular', @image, @matriculaVehiculo, @numIngresos, 1)
        `);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Visita registrada correctamente' }),
    };
  } catch (error) {
    console.error('Error en Lambda:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message, error: error.message }),
    };
  }
};


const analyzeImageFromBytes = async (image) => {
  try {
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const detectLabelsParams = {
      Image: { Bytes: buffer },
      MaxLabels: 10,
      MinConfidence: 90,
    };
    const labelsResponse = await rekognition.detectLabels(detectLabelsParams).promise();

    isPerson = labelsResponse.Labels.some(label =>
      ['Person', 'Human'].includes(label.Name)
    );

    const detectTextParams = {
      Image: { Bytes: buffer },
    };

    const rekognitionData = await rekognition.detectText(detectTextParams).promise();
    console.log("Textos detectados:", rekognitionData.TextDetections);

    const placaPattern = /^[PACM]{1}\s?\d{3}[A-Z]{3}$/;
    const placasDetectadas = rekognitionData.TextDetections
      .map(detection => detection.DetectedText)
      .filter(text => placaPattern.test(text));

    isText = placasDetectadas.length > 0;

    console.log('Es una persona? ', isPerson);
    console.log('Es un carro? ', isText);

    if(!isText && !isPerson){
      errorMessage = 'No se reconocio a una persona o vehiculo.';
      console.log('No se reconocio a una persona o vehiculo.');
      throw new Error('No se reconocio a una persona o vehiculo.');
    }

    isPersonChek = isPerson;
    isCarChek = isText;
    imageBuffer = buffer;
    detectedPlateText = placasDetectadas[0];
  } catch (error) {
    throw new Error('No se reconocio a una persona o vehiculo.');
  }
};