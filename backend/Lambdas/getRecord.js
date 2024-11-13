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
    const { dateSearch } = JSON.parse(event.body);

    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    let resultRecord;
    if(dateSearch !== '*') {
      resultRecord = await request
        .input('date', sql.Date, dateSearch)
      .query(`
        SELECT * FROM historial_Entradas WHERE fecha = @date;
      `);
    } else {
      resultRecord = await request
      .query(`
        SELECT * FROM historial_Entradas;
      `);
    }

    await pool.close();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Historial consultado correctamente.',
        data: resultRecord.recordset
      }),
    };
  } catch (error) {
    console.error('Consulta a historial fallida: ', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Consulta a historial fallida.',
        error: error.message,
      }),
    };
  }
};
