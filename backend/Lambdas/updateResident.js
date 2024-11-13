const AWS = require('aws-sdk');
const sql = require('mssql');

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

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
let errorMessage = ''; // Mover esta variable aquí asegura que el mensaje de error se mantenga en la respuesta
let imageBuffer = null;
let detectedPlateText = null;

module.exports.handler = async (event) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();
    console.log('Evento recibido:', event);

    const { nombre, DPI, telefono, numHome, cluster, image, contra } = JSON.parse(event.body);

    request.input('numCasa', sql.Int, numHome);
    request.input('cluster', sql.VarChar, cluster);
    const resultVivienda = await request.query('SELECT idVivienda FROM vivienda WHERE numCasa = @numCasa AND cluster = @cluster');

    if (resultVivienda.recordset.length === 0) {
      errorMessage = 'No existe esta registrada esa vivienda.';
      throw new Error(errorMessage);
    }

    if (image !== 'No Foto') {
      await analyzeImageFromBytes(image); // Esperar la función

      if (!isPersonChek) {
        errorMessage = 'No se reconoce a una persona en la imagen, intente de nuevo.';
        throw new Error(errorMessage);
      }
      
      const s3Params = {
        Bucket: S3_BUCKET_NAME,
        Key: `Fotos_Residentes/${DPI}.jpg`,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
      };

      const uploadResult = await s3.upload(s3Params).promise();    
      console.log('Imagen actualizada en S3 exitosa:', uploadResult.Location);

      await updateFaceInCollection(DPI, nombre);

      request.input('nombre', sql.VarChar, nombre);
      request.input('DPI', sql.VarChar, DPI);
      request.input('numTelefono', sql.VarChar, telefono);
      request.input('datoBiometrico', sql.VarChar, uploadResult.Location);
      request.input('idVivienda', sql.Int, resultVivienda.recordset[0].idVivienda);
      await request.query(`
        UPDATE residentes
        SET nombre = @nombre,
            numTelefono = @numTelefono,
            datoBiometrico = @datoBiometrico,
            idVivienda = @idVivienda
        WHERE dpi = @DPI;
      `);  

      await request
        .input('contra', sql.VarChar, contra)
        .query(`
          UPDATE usuarios SET contra = @contra WHERE userDPI = @DPI
        `);

    } else {
      request.input('nombre', sql.VarChar, nombre);
      request.input('DPI', sql.VarChar, DPI);
      request.input('numTelefono', sql.VarChar, telefono);
      request.input('idVivienda', sql.Int, resultVivienda.recordset[0].idVivienda);
      
      await request.query(`
        UPDATE residentes
        SET nombre = @nombre,
            numTelefono = @numTelefono,
            idVivienda = @idVivienda
        WHERE dpi = @DPI;
      `);

      await request
        .input('contra', sql.VarChar, contra)
        .query(`
          UPDATE usuarios SET contra = @contra WHERE userDPI = @DPI
        `);
    }

    await pool.close(); 
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Datos actualizados exitosamente.',
      }),
    };
  } catch (error) {
    console.error('Error en la función:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: errorMessage || 'Error al procesar la solicitud', // Devolver errorMessage si está definido
        error: error.message,
      }),
    };
  }
};


const updateFaceInCollection = async (DPI, nombre) => {
  const collectionId = 'Faces';

  try {
    const faceSearchParams = {
      CollectionId: collectionId,
      FaceMatchThreshold: 95,
      Image: {
        S3Object: {
          Bucket: S3_BUCKET_NAME,
          Name: `Fotos_Residentes/${DPI}.jpg`,
        },
      },
      MaxFaces: 1,
    };

    const faceSearchResult = await rekognition.searchFacesByImage(faceSearchParams).promise();

    if (faceSearchResult.FaceMatches.length > 0) {
      const faceId = faceSearchResult.FaceMatches[0].Face.FaceId;
      await rekognition.deleteFaces({ CollectionId: collectionId, FaceIds: [faceId] }).promise();
    }

    const sanitizedName = nombre.replace(/\s+/g, '-');
    const sanitizedDPI = DPI.replace(/\s+/g, '-');
    const indexParams = {
      CollectionId: collectionId,
      Image: {
        S3Object: {
          Bucket: S3_BUCKET_NAME,
          Name: `Fotos_Residentes/${DPI}.jpg`,
        },
      },
      ExternalImageId: `Nombre:${sanitizedName}_DPI:${sanitizedDPI}`,
    };

    const indexResult = await rekognition.indexFaces(indexParams).promise();
    console.log('Imagen actualizada en la colección:', indexResult);
  } catch (error) {
    console.error('Error al actualizar la colección de Rekognition:', error);
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

    let isPerson = labelsResponse.Labels.some(label =>
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

    let isText = placasDetectadas.length > 0;

    console.log('Es una persona? ', isPerson);
    console.log('Es un carro? ', isText);

    if (!isText && !isPerson) {
      errorMessage = 'No se reconocio a una persona o vehiculo.';
    }

    isPersonChek = isPerson;
    isCarChek = isText;
    imageBuffer = buffer;
    detectedPlateText = placasDetectadas[0];
  } catch (error) {
    console.error('Error en la función analyzeImageFromBytes:', error);
  }
};
