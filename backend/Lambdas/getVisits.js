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
    
    if(DPI != '*'){
      request.input('DPI', sql.VarChar, DPI); 
      const searchVisitas = `SELECT * FROM Visitas_Residentes WHERE dpi = @DPI`;
      const resultVisitas = await request.query(searchVisitas);

      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Tabla de Visitas por Residente Consultada.',
          data: resultVisitas.recordset,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };

      return response;
    } else {
      const searchVisitas = 'SELECT * FROM Visitas_Residentes';
      const resultVisitas = await request.query(searchVisitas);

      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Tabla de Visitas por Residente Consultada.',
          data: resultVisitas.recordset,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };

      return response;
    }

    await pool.close();

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