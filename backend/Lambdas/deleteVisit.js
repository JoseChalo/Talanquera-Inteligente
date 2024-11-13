const AWS = require('aws-sdk');
const sql = require('mssql');

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

    const { dpiVisita } = JSON.parse(event.body);
    if(!dpiVisita) throw new Error('Parametros faltantes.');

    const dataVisita = await request
      .input('dpiVisita', sql.VarChar, dpiVisita)
    .query(`
      SELECT * FROM visitas WHERE dpiVisita = @dpiVisita;
    `);

    deleteFaceFromCollection(dataVisita.recordset[0].nombreVisita, dataVisita.recordset[0].dpiVisita);

    await request.query('UPDATE visitas SET estado = 0 WHERE dpiVisita = @dpiVisita');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Visita eliminada correctamente.',
      }),
    };     
  } catch (error) {
    console.error('Error al eliminar visita:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error al eliminar visita.',
        error: error.message
      }),
    };
  }
};

const deleteFaceFromCollection = async (nombreVisita, dpiVisita) => {
  const externalImageId = `Nombre:${nombreVisita.replace(/\s+/g, '-')}_DPI:${dpiVisita.replace(/\s+/g, '-')}`;

  try {
    const listFacesParams = {
      CollectionId: 'ResidentsFaces',
    };
    const listResponse = await rekognition.listFaces(listFacesParams).promise();

    const faceToDelete = listResponse.Faces.find(face => face.ExternalImageId === externalImageId);

    if (faceToDelete) {
      const deleteParams = {
        CollectionId: 'ResidentsFaces',
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