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
  let pool;
  try {
    pool = await sql.connect(sqlConfig);
    const request = pool.request();
    const body = JSON.parse(event.body);
    
    // Definir el parámetro DPI
    const searchDPI = body.DPI;

    if (searchDPI !== '*') {
      request.input('DPI', sql.VarChar, searchDPI); // Usar input aquí
      const searchResidente = 'SELECT * FROM residentes WHERE dpi = @DPI';
      const resultsResidenteSearch = await request.query(searchResidente);
      
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: resultsResidenteSearch.recordset.length > 0 ? 'Residente encontrado' : 'No se encontró residente',
          data: resultsResidenteSearch.recordset,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };

      return response;
    } else {
      const searchResidente = 'SELECT * FROM residentes';
      const resultsResidenteSearch = await request.query(searchResidente);
      
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: resultsResidenteSearch.recordset.length > 0 ? 'Residentes encontrados' : 'No se encontraron residentes',
          data: resultsResidenteSearch.recordset,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };

      return response;
    }
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error al consultar la base de datos',
        error: error.message,
      }),
    };    
  } finally {
    if (pool) {
      await pool.close(); // Cerrar la conexión
    }
  }
};
