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

// Función para ejecutar queries de forma asíncrona
const queryAsync = async (query, params = {}) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    // Asigna los parámetros según corresponda
    if (params.name) request.input('name', sql.VarChar, params.name);
    if (params.DPI) request.input('DPI', sql.VarChar, params.DPI);
    if (params.phone) request.input('phone', sql.VarChar, params.phone);
    if (params.image) request.input('image', sql.VarChar, params.image);
    if (params.numHome) request.input('numHome', sql.Int, params.numHome);

    const result = await request.query(query);
    
    return result.recordset;
  } catch (error) {
    console.error('Error ejecutando query:', query, error);
    throw error;
  }
};

module.exports.handler = async (event) => {
  try {
    console.log('Evento recibido:', event);

    // Validar el cuerpo de la solicitud
    const { name, DPI, phone, numHome, image, S3_BUCKET_NAME } = JSON.parse(event.body);
    
    // Verifica si todos los campos requeridos están presentes
    if (!name || !DPI || !phone || !numHome || !image || !S3_BUCKET_NAME) {
      throw new Error('Faltan campos obligatorios en la solicitud');
    }
    console.log('Parámetros validados:', { name, DPI, phone, numHome, S3_BUCKET_NAME });

    // Convertir la imagen de base64 a buffer
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, ''); // Eliminar el prefijo si existe
    const buffer = Buffer.from(base64Data, 'base64');

    // Subir imagen a S3
    const s3Params = {
      Bucket: S3_BUCKET_NAME,
      Key: `Talanquera_Inteligente_IS/Fotos_Residentes/${DPI}.jpg`,
      Body: buffer,
      ContentType: 'image/jpeg',
    };

    console.log('Subiendo imagen a S3 con parámetros:', s3Params);
    const uploadResult = await s3.upload(s3Params).promise();
    console.log('Subida a S3 exitosa:', uploadResult.Location);

    // Consultar vivienda y agregar residente
    try {
      console.log('Consultando vivienda en la base de datos...');
      const searchHome = 'SELECT * FROM vivienda WHERE numVivienda = @numHome';
      const resultsHome = await queryAsync(searchHome, { numHome });

      if (resultsHome.length === 0) {
        throw new Error(`Vivienda con número ${numHome} no existe.`);
      }

      console.log('Vivienda encontrada:', resultsHome);

      // Insertar nuevo residente en la base de datos
      console.log('Insertando nuevo residente en la base de datos...');
      const newResident = 'INSERT INTO residentes (nombre, dpi, numTelefono, data_Biometrico, numVivienda) VALUES (@name, @DPI, @phone, @image, @numHome)';
      await queryAsync(newResident, { name, DPI, phone, image: uploadResult.Location, numHome });

      console.log('Residente ingresado en la base de datos con éxito.');
    } catch (error) {
      console.error('Error interactuando con la base de datos:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Error al procesar la solicitud en la base de datos',
          error: error.message,
        }),
      };
    }

    // Crear colección de Rekognition
    try {
      console.log('Creando colección en Rekognition...');
      await rekognition.createCollection({ CollectionId: 'ResidentsFaces' }).promise();
    } catch (err) {
      if (err.code !== 'ResourceAlreadyExistsException') {
        console.error('Error al crear la colección de Rekognition:', err);
        throw new Error('Error al crear la colección de Rekognition: ' + err.message);
      } else {
        console.log('La colección ya existe, continuando...');
      }
    }

    // Indexar cara en Rekognition
    try {
      console.log('Indexando cara en Rekognition...');
      const params = {
        CollectionId: 'ResidentsFaces',
        Image: {
          S3Object: {
            Bucket: S3_BUCKET_NAME,
            Name: `Talanquera_Inteligente_IS/Fotos_Residentes/${DPI}.jpg`,
          },
        },
      };

      const indexData = await rekognition.indexFaces(params).promise();
      console.log('Cara indexada exitosamente en Rekognition:', indexData);
    } catch (err) {
      console.error('Error al indexar la cara en Rekognition:', err);
      throw new Error('Error al indexar la cara en Rekognition: ' + err.message);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Residente registrado y cara indexada correctamente',
        location: uploadResult.Location,
      }),
    };
  } catch (err) {
    console.error('Error general en la función:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error al procesar la solicitud',
        error: err.message,
      }),
    };
  }
};
