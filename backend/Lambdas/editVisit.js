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
    const { dpiVisita, nombreVisita, idViviendaDestino, 
      dpiResidente, metodoIngreso, datoBiometrico, 
      numIngresos, clusterDestino, numViviendaDestino,
      oldNameVisit, oldMetodoIngreso } = JSON.parse(event.body);

    if(!dpiVisita || !nombreVisita || !idViviendaDestino || !dpiResidente || !metodoIngreso || !numIngresos) throw new Error('Falta parametros para realizar la operacion.');

    pool = await sql.connect(sqlConfig);
    const request = pool.request();

    request.input('numHome', sql.Int, numViviendaDestino);
    request.input('cluster', sql.VarChar, clusterDestino);
    request.input('dpiResidente', sql.VarChar, dpiResidente);
    const searchHomeQuery = `
      SELECT V.idVivienda FROM vivienda V INNER JOIN residentes R ON V.idVivienda = R.idVivienda 
      WHERE numCasa = @numHome AND cluster = @cluster AND R.dpi = @dpiResidente`;
    const homeResult = await request.query(searchHomeQuery);

    if (homeResult.recordset.length === 0) {
      errorMessage = 'El DPI del residente no coincide con la direccion de casa.';
      throw new Error('El DPI del residente no coincide con la direccion de casa.');
    }

    if (datoBiometrico != 'No Foto') {
      await analyzeImageFromBytes(datoBiometrico);
      if ( (metodoIngreso === 'Peatonal' && !isPersonChek) || (metodoIngreso === 'Vehicular' && !isCarChek) ) {
        errorMessage = 'La imagen no concuerda con el metodo de ingreso seleccionado.';
        throw new Error('La imagen no concuerda con el metodo de ingreso seleccionado.');        
      }
    } else if( !(datoBiometrico === 'No Foto' && oldMetodoIngreso === metodoIngreso) ) {
      errorMessage = 'La imagen no concuerda con el metodo de ingreso seleccionado.';
      throw new Error('La imagen no concuerda con el metodo de ingreso seleccionado.');
    }
    
    if(metodoIngreso === 'Peatonal'){
      console.log('Peatonal: ', datoBiometrico != null);
      if (datoBiometrico != 'No Foto' && isPersonChek) {

        const s3Params = {
          Bucket: S3_BUCKET_NAME,
          Key: `Fotos_Visitas/${dpiVisita}.jpg`,
          Body: imageBuffer,
          ContentType: 'image/jpeg',
        };
    
        // Subir imagen a S3
        const uploadResult = await s3.upload(s3Params).promise();
        console.log('Subida a S3 exitosa:', uploadResult.Location);

        request.input('dpiVisita', sql.VarChar, dpiVisita);
        request.input('idViviendaDestino', sql.Int, homeResult.recordset[0].idVivienda);
        request.input('image', sql.VarChar, uploadResult.Location);
        request.input('tipoIngreso', sql.VarChar, metodoIngreso);
        request.input('numIngresos', sql.Int, numIngresos);
        request.input('nombreVisita', sql.VarChar, nombreVisita);
        
        await request.query(`
          UPDATE visitas SET 
            nombreVisita = @nombreVisita,
            idViviendaDestino = @idViviendaDestino,
            dpiResidente = @dpiResidente,
            metodoIngreso = @tipoIngreso,
            datoBiometrico = @image,
            matriculaVehiculo = 'No vehiculo',
            numIngresos = @numIngresos
          WHERE dpiVisita = @dpiVisita; `);

        const rekognitionParams = {
          CollectionId: 'Faces',
          Image: { S3Object: { Bucket: S3_BUCKET_NAME, Name: `Fotos_Visitas/${dpiVisita}.jpg` } },
          ExternalImageId: `Nombre:${nombreVisita.replace(/\s+/g, '-')}_DPI:${dpiVisita.replace(/\s+/g, '-')}`,
        };
        await rekognition.indexFaces(rekognitionParams).promise();
        
      } else {
        request.input('dpiVisita', sql.VarChar, dpiVisita);
        request.input('idViviendaDestino', sql.Int, homeResult.recordset[0].idVivienda);
        request.input('tipoIngreso', sql.VarChar, metodoIngreso);
        request.input('numIngresos', sql.Int, numIngresos);
        request.input('nombreVisita', sql.VarChar, nombreVisita);
        
        await request.query(`
          UPDATE visitas SET 
            nombreVisita = @nombreVisita,
            idViviendaDestino = @idViviendaDestino,
            dpiResidente = @dpiResidente,
            metodoIngreso = @tipoIngreso,
            matriculaVehiculo = 'No vehiculo',
            numIngresos = @numIngresos
          WHERE dpiVisita = @dpiVisita; `);
      }
    } else if (metodoIngreso === 'Vehicular'){
      if (datoBiometrico != 'No Foto' && isCarChek) {

        deleteFaceFromCollection(oldNameVisit, dpiVisita);

        const s3Params = {
          Bucket: S3_BUCKET_NAME,
          Key: `Fotos_MatriculasVisitas/${dpiVisita}.jpg`,
          Body: imageBuffer,
          ContentType: 'image/jpeg',
        };
        
        // Subir imagen de la matrícula a S3
        const uploadResult = await s3.upload(s3Params).promise();
        console.log('Subida a S3 exitosa:', uploadResult.Location);

        request.input('dpiVisita', sql.VarChar, dpiVisita);
        request.input('idViviendaDestino', sql.Int, homeResult.recordset[0].idVivienda);
        request.input('image', sql.VarChar, uploadResult.Location);
        request.input('matriculaVehiculo', sql.VarChar, detectedPlateText);
        request.input('tipoIngreso', sql.VarChar, metodoIngreso);
        request.input('numIngresos', sql.Int, numIngresos);
        request.input('nombreVisita', sql.VarChar, nombreVisita);
        
        await request.query(`
          UPDATE visitas SET 
            nombreVisita = @nombreVisita,
            idViviendaDestino = @idViviendaDestino,
            dpiResidente = @dpiResidente,
            metodoIngreso = @tipoIngreso,
            datoBiometrico = @image,
            matriculaVehiculo = @matriculaVehiculo,
            numIngresos = @numIngresos
          WHERE dpiVisita = @dpiVisita; `);        
      } else {
        request.input('dpiVisita', sql.VarChar, dpiVisita);
        request.input('idViviendaDestino', sql.Int, homeResult.recordset[0].idVivienda);
        request.input('tipoIngreso', sql.VarChar, metodoIngreso);
        request.input('numIngresos', sql.Int, numIngresos);
        request.input('nombreVisita', sql.VarChar, nombreVisita);
        
        await request.query(`
          UPDATE visitas SET 
            nombreVisita = @nombreVisita,
            idViviendaDestino = @idViviendaDestino,
            dpiResidente = @dpiResidente,
            metodoIngreso = @tipoIngreso,
            numIngresos = @numIngresos
          WHERE dpiVisita = @dpiVisita; `);   
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Visitante editado correctamente.',
      }),
    };     
  } catch (error) {
    console.error('Error al editar visitante:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: errorMessage,
        error: error.message
      }),
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

    // Verificar si "Person" o "Human" está en las etiquetas detectadas
    isPerson = labelsResponse.Labels.some(label =>
      ['Person', 'Human'].includes(label.Name)
    );

    // Paso 2: Detectar texto
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


const deleteFaceFromCollection = async (nombreVisita, dpiVisita) => {
  const externalImageId = `Nombre:${nombreVisita.replace(/\s+/g, '-')}_DPI:${dpiVisita.replace(/\s+/g, '-')}`;

  try {
    const listFacesParams = {
      CollectionId: 'Faces',
    };
    const listResponse = await rekognition.listFaces(listFacesParams).promise();

    const faceToDelete = listResponse.Faces.find(face => face.ExternalImageId === externalImageId);

    if (faceToDelete) {
      const deleteParams = {
        CollectionId: 'Faces',
        FaceIds: [faceToDelete.FaceId],
      };
      await rekognition.deleteFaces(deleteParams).promise();
      console.log('Imagen eliminada correctamente.');
    } else {
      console.log('No se encontró la cara con el ExternalImageId proporcionado.');
    }
  } catch (error) {
    console.error('Error al eliminar la cara:', error);
  }
};