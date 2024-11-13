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

// Configuración de conexión a MSSQL
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

const analyzeImageFromBytes = async (image) => {
  console.log('Comenzando con el escaneo de imagen');
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

    console.log('Es una persona? ', isPerson);

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
    console.log('Texto escaneado: ', placasDetectadas);
    console.log('Es un carro? ', isText);

    if(!isText && !isPerson){
      errorMessage = 'No se reconocio a una persona o vehiculo.';
      console.log(errorMessage);
      throw new Error(errorMessage);
    }

    isPersonChek = isPerson;
    isCarChek = isText;
    imageBuffer = buffer;
    detectedPlateText = placasDetectadas[0];
  } catch (error) {
    errorMessage = 'Error en el reconocimiento de imagen';
    throw new Error(errorMessage);
  }
};

module.exports.handler = async (event) => {
  try {
    console.log('Evento recibido:', event);

    const { name, DPI, phone, numHome, cluster, image, contra } = JSON.parse(event.body);

    await analyzeImageFromBytes(image);
    console.log(isPersonChek);

    if(!isPersonChek){
      errorMessage = 'La fotografia no corresponde a una persona.';
      throw new Error(errorMessage);
    }

    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    const homeResult = await request
      .input('numHome', sql.Int, numHome)
      .input('cluster', sql.VarChar, cluster)
    .query('SELECT * FROM vivienda WHERE numCasa = @numHome AND cluster = @cluster');

    const residentResult = await request
      .input('dpi', sql.VarChar, DPI)
    .query('SELECT * FROM residentes WHERE dpi = @dpi');

    if (homeResult.recordset.length === 0) {
      errorMessage = 'Cluster o vivienda no existente';
      throw new Error(errorMessage);
    }
    if (residentResult.recordset.length > 0 && residentResult.recordset[0].estado === 1) {
      errorMessage = 'Ya existe un residente con ese DPI';
      throw new Error(errorMessage);
    }

    const s3Params = {
      Bucket: S3_BUCKET_NAME,
      Key: `Fotos_Residentes/${DPI}.jpg`,
      Body: imageBuffer,
      ContentType: 'image/jpeg',
    };
    const uploadResult = await s3.upload(s3Params).promise();
    console.log('Subida a S3 exitosa:', uploadResult.Location);

    if (residentResult.recordset.length > 0) {
      await request
        .input('image', sql.VarChar, uploadResult.Location)
      .query('UPDATE residentes SET estado = 1, datoBiometrico = @image WHERE dpi = @DPI');

      await request
        .input('contra', sql.VarChar, contra)
      .query('UPDATE usuarios SET contra = @contra WHERE userDPI = @dpi');
    } else {
      await request
        .input('name', sql.VarChar, name)
        .input('phone', sql.VarChar, phone)
        .input('image', sql.VarChar, uploadResult.Location)
        .input('idVivienda', sql.Int, homeResult.recordset[0].idVivienda)
      .query(
        `INSERT INTO residentes (dpi, nombre, numTelefono, datoBiometrico, idVivienda, estado) 
        VALUES (@dpi, @name, @phone, @image, @idVivienda, 1)`);

      await request
        .input('contra', sql.VarChar, contra)
      .query(`INSERT INTO usuarios (userDPI, contra, rol) VALUES (@dpi, @contra, 'residente')`);
    }


    // Indexar la cara en Rekognition
    const rekognitionParams = {
      CollectionId: 'Faces',
      Image: { S3Object: { Bucket: S3_BUCKET_NAME, Name: `Fotos_Residentes/${DPI}.jpg` } },
      ExternalImageId: `Nombre:${name.replace(/\s+/g, '-')}_DPI:${DPI.replace(/\s+/g, '-')}`,
    };
    await rekognition.indexFaces(rekognitionParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Residente registrado correctamente', location: uploadResult.Location }),
    };
  } catch (error) {
    console.error('Error en Lambda:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: errorMessage, 
        error: error.message 
      }),
    };
  }
};