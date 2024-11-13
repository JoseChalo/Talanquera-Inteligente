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

const BUCKET_NAME = 'imagenes-talanquera-inteligente';
const COLLECTION_ID = 'Faces';

module.exports.handler = async (event) => {
  let pool;
  try {
    pool = await sql.connect(sqlConfig);
    const request = pool.request();
    const { DPI } = JSON.parse(event.body);
    console.log('Parámetros recibidos:', { DPI });

    // Eliminar la imagen de Rekognition
    await Promise.all([
      deleteFaceInCollection(DPI),
    ]);

    // Obtener matrículas y visitantes asociados a eliminar
    const matriculasResult = await request.input('DPI', sql.VarChar, DPI).query('SELECT matricula FROM residentes_automovil WHERE idResidente = @DPI;');
    const visitasResult = await request.query('SELECT dpiVisita FROM visitas WHERE dpiResidente = @DPI');
    
    if (matriculasResult.recordset.length > 0) {
      const deleteCarsQueries = matriculasResult.recordset.map(({ matricula }) => {
        request.input('matricula', sql.VarChar, matricula).query(`
          UPDATE automovil SET estado = 0 WHERE matricula = @matricula;
        `);
      });
      await Promise.all(deleteCarsQueries);
    }

    if (visitasResult.recordset.length > 0) {
      const deleteVisitas = visitasResult.recordset.map(( {dpiVisita} ) => {
        request.input('dpiVisita', sql.VarChar, dpiVisita).query('UPDATE visitas SET estado = 0 WHERE dpiVisita = @dpiVisita');
      });
    }

    // Deshabilitar al residente
    await request.query(`
      UPDATE residentes SET estado = 0 WHERE dpi = @DPI
    `);

    console.log(`Residente con DPI ${DPI} deshabilitado correctamente.`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Datos eliminados exitosamente.',
      }),
    };
  } catch (error) {
    console.error('Error en la función Lambda:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error al procesar la solicitud',
        error: error.message,
      }),
    };
  } finally {
    if (pool) {
      await pool.close(); // Cerrar la conexión
    }
  }
};

// Función para eliminar la cara en Rekognition
const deleteFaceInCollection = async (DPI) => {
  try {
    const faceSearchResult = await rekognition.searchFacesByImage({
      CollectionId: 'Faces',
      FaceMatchThreshold: 95,
      Image: { S3Object: { Bucket: BUCKET_NAME, Name: `Fotos_Residentes/${DPI}.jpg` } },
      MaxFaces: 1,
    }).promise();

    console.log('Resultados de búsqueda de cara:', faceSearchResult);

    if (faceSearchResult.FaceMatches.length > 0) {
      const faceId = faceSearchResult.FaceMatches[0].Face.FaceId;
      console.log('Face ID encontrado para eliminar:', faceId);
      const deleteResponse = await rekognition.deleteFaces({ CollectionId: 'Faces', FaceIds: [faceId] }).promise();
      console.log('Respuesta de eliminación de cara:', deleteResponse);
    } else {
      console.log('No se encontró ninguna coincidencia de cara para eliminar.');
    }
  } catch (error) {
    console.error('Error al eliminar la imagen de la colección de Rekognition:', error);
    throw Error;
  }
};