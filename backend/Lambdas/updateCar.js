const AWS = require('aws-sdk');
const sql = require('mssql');

// Inicializar los servicios de AWS
const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

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

const S3_BUCKET_NAME = 'imagenes-talanquera-inteligente';
let isPersonChek = false;
let isCarChek = false;
let errorMessage = '';
let imageBuffer = null;
let detectedPlateText = null;

module.exports.handler = async (event) => {
  try {
    const { DPI, matricula, modelo, color, credencialesVehiculo } = JSON.parse(event.body);

    const pool = await sql.connect(sqlConfig);
    const request = pool.request();
    request.input('matricula', sql.VarChar, matricula);

    if (credencialesVehiculo === 'No Foto') {
      request.input('color', sql.VarChar, color);
      request.input('modelo', sql.VarChar, modelo);
      await request.query(`
        UPDATE automovil
        SET color = @color,
            modelo = @modelo
        WHERE matricula = @matricula;
      `);
    } else {
      const dbResult = await request.query('SELECT credencialesVehiculo FROM automovil WHERE matricula = @matricula');
      if (dbResult.recordset.length === 0) {
        throw new Error('Matrícula no encontrada en la base de datos.');
      }

      await analyzeImageFromBytes(credencialesVehiculo);
      console.log(detectedPlateText);
      
      if(!isCarChek){
        throw new Error('No se detectaron credenciales del vehiculo, intente de nuevo con otra foto.');
      }
      if (detectedPlateText !== matricula) {
        throw new Error('La imagen no ha sido actualizada porque la placa detectada no coincide.');
      }        

      const s3Params = {
        Bucket: 'imagenes-talanquera-inteligente',
        Key: `Fotos_Matriculas/${DPI} - ${matricula}.jpg`,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
      };
      const uploadResult = await s3.upload(s3Params).promise();
  
      request.input('image', sql.VarChar, uploadResult.Location);
      request.input('color', sql.VarChar, color);
      request.input('modelo', sql.VarChar, modelo);
      await request.query(`
        UPDATE automovil
        SET color = @color,
            credencialesVehiculo = @image,
            modelo = @modelo
        WHERE matricula = @matricula;
      `);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Datos actualizados exitosamente.',
      }),
    };

  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message,
        error: error.message,
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
