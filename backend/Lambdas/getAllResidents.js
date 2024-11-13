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
    const { DPI } = JSON.parse(event.body);

    const searchQuery = `
      SELECT * FROM usuarios U INNER JOIN (
        SELECT R.dpi, R.nombre, R.numTelefono, 
                R.datoBiometrico, R.estado, R.idVivienda, 
                V.cluster, V.numCasa, V.estado AS estadoVivienda  
        FROM residentes R 
        INNER JOIN vivienda V ON R.idVivienda = V.idVivienda 
        WHERE R.estado = 1 ${DPI !== '*' ? 'AND dpi = @DPI' : ''}) 
      RV ON RV.dpi = U.userDPI;
    `;

    if (DPI !== '*') {
      request.input('DPI', sql.VarChar, DPI);
    }

    const results = await request.query(searchQuery);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: results.recordset.length > 0 ? (DPI !== '*' ? 'Residente encontrado' : 'Residentes encontrados') : 'No se encontraron residentes',
        data: results.recordset,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
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
      await pool.close();
    }
  }
};