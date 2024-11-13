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

module.exports.handler = async (event) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    console.log('Evento recibido:', event);

    // Validar el cuerpo de la solicitud
    const { DPI, matricula, modelo, color } = JSON.parse(event.body);
    console.log('Parámetros validados:', { DPI, matricula, modelo, color });

    // Convertir la imagen de base64 a buffer
    const base64Data = matricula.replace(/^data:image\/jpeg;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Detectar texto en la imagen utilizando Rekognition
    const paramsMatricula = {
      Image: {
        Bytes: buffer,
      },
    };

    const rekognitionData = await rekognition.detectText(paramsMatricula).promise();
    console.log("Textos detectados:", rekognitionData.TextDetections);

    // Filtrar los textos que cumplan con el formato de placas de Guatemala
    const placaPattern = /^[PACUMTCR]{1}\s?\d{3}[A-Z]{3}$/;
    const placasDetectadas = rekognitionData.TextDetections
      .map(detection => detection.DetectedText)
      .filter(text => placaPattern.test(text));

    if (placasDetectadas.length === 0) {
      throw new Error('No se detectaron placas válidas en la imagen.');
    }

    const detectedText = placasDetectadas[0];
    console.log("Placa detectada:", detectedText);

    // Buscar residente en la base de datos
    request.input('DPI', sql.VarChar, DPI);
    console.log('Consultando residente en la base de datos...');
    const searchResidente = 'SELECT * FROM residentes WHERE dpi = @DPI AND estado = 1';
    const resultsResidenteSearch = await request.query(searchResidente);

    if (resultsResidenteSearch.recordset.length === 0) {
      throw new Error(`No existe un residente con el DPI: ${DPI} en la base de datos.`);
    }

    // Subir la imagen a S3
    const s3Params = {
      Bucket: 'imagenes-talanquera-inteligente',
      Key: `Fotos_Matriculas/${DPI} - ${detectedText}.jpg`,
      Body: buffer,
      ContentType: 'image/jpeg',
    };

    console.log('Subiendo imagen a S3...');
    const uploadResult = await s3.upload(s3Params).promise();
    console.log('Subida a S3 exitosa:', uploadResult.Location);

    // Verificar si el automóvil ya existe
    request.input('detectedText', sql.VarChar, detectedText);
    const searchAutomovil = 'SELECT * FROM automovil WHERE matricula = @detectedText';
    const resultSearchAutomovil = await request.query(searchAutomovil);

    if (resultSearchAutomovil.recordset.length > 0 && resultSearchAutomovil.recordset[0].estado == 1) {
      throw new Error(`El automóvil con matrícula ${detectedText} ya está registrado.`);
    } else if (resultSearchAutomovil.recordset.length > 0 && resultSearchAutomovil.recordset[0].estado == 0) {
      await request.query('UPDATE automovil SET estado = 1 WHERE matricula = @detectedText');
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Automovil renovado.',
          location: uploadResult.Location,
        }),
      };
    } else {
      // Insertar nuevo automóvil en la base de datos
      console.log('Insertando nuevo automóvil en la base de datos...');
      request.input('modelo', sql.VarChar, modelo);
      request.input('color', sql.VarChar, color);
      request.input('imageLocation', sql.VarChar, uploadResult.Location);
      const insertCar = 'INSERT INTO automovil (matricula, modelo, color, credencialesVehiculo, estado) VALUES (@detectedText, @modelo, @color, @imageLocation, 1)';
      await request.query(insertCar);

      // Enlazar automóvil con residente
      console.log('Enlazando automóvil con residente...');
      request.input('idResidente', sql.VarChar, DPI);
      const carResident = 'INSERT INTO residentes_automovil (idResidente, matricula) VALUES (@idResidente, @detectedText)';
      await request.query(carResident);

      console.log('Automóvil registrado exitosamente.');

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Residente registrado y automóvil indexado correctamente',
          location: uploadResult.Location,
        }),
      };
    }
  } catch (error) {
    console.error('Error durante la ejecución:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message,
        error: error.message,
      }),
    };
  }
};
