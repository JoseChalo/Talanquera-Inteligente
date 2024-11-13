const AWS = require('aws-sdk');
const sql = require('mssql');
const s3 = new AWS.S3();

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

module.exports.handler = async (event) => {    
  console.log('Iniciando eliminación de vehículo....');
  let pool;
  try {
    pool = await sql.connect(sqlConfig);
    const request = pool.request();

    const { DPI, matricula } = JSON.parse(event.body);
    console.log('Parámetros recibidos:', { DPI, matricula });

    const existsResult = await request
      .input('idResidente', sql.VarChar, DPI)
      .input('matricula', sql.VarChar, matricula)
      .query(`SELECT * FROM residentes_automovil WHERE matricula = @matricula AND idResidente = @idResidente`);

    if (existsResult.recordset.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'No se encontró el registro relacionado para eliminar.',
        }),
      };
    }

    await request.query(`DELETE FROM residentes_automovil WHERE matricula = @matricula AND idResidente = @idResidente`);

    await request.query(`DELETE FROM automovil WHERE matricula = @matricula`);

    try {
      await s3.deleteObject({
        Bucket: BUCKET_NAME,
        Key: `Fotos_Residentes/${DPI} - ${matricula}.jpg`,
      }).promise();
      console.log('Imagen eliminada de S3.');
    } catch (error) {
      console.error('Error al eliminar la imagen de S3:', error);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Vehículo eliminado exitosamente...',
      }),
    };     
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error al eliminar vehículo.',
        error: error.message
      }),
    };
  }
};
