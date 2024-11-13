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

    const { cluster, numHome } = JSON.parse(event.body);
    request.input('numCasa', sql.Int, numHome)
    request.input('cluster', sql.VarChar, cluster)

    const searhHome = await request.query(`SELECT * FROM vivienda WHERE numCasa = @numCasa AND cluster = @cluster`);
    if(searhHome.recordset.length > 0) {
      if (searhHome.recordset[0].estado === 1) {
        throw new Error('Esa casa ya existe.');
      } else {
        await request.query(`
        UPDATE vivienda SET estado = 1 WHERE numCasa = @numCasa AND cluster = @cluster
      `);
      }
    } else {
      await request.query(`
        INSERT INTO vivienda (numCasa, cluster, estado) 
        VALUES (@numCasa, @cluster, 1)
      `);      
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Casa guardada en la base de datos.',
      }),
    };
  } catch (error) {
    console.error('Error al guardas la vivienda en la base de datos: ', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error al guardas la vivienda en la base de datos.',
        error: error.message
      }),
    };
  }
};