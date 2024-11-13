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
    const { currentCluster, currentNumHome, newCluster, newNumHome } = JSON.parse(event.body);

  
    if (isNaN(currentNumHome) || isNaN(newNumHome)) {
      throw new Error('El número de casa debe ser un número válido.');
    }


    const numHome = parseInt(currentNumHome, 10);
    const newHome = parseInt(newNumHome, 10);


    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    const checkVivienda = await request
      .input('newCluster', sql.VarChar, newCluster)  
      .input('newNumHome', sql.Int, newHome) 
      .query(`
        SELECT * FROM vivienda WHERE cluster = @newCluster AND numCasa = @newNumHome
      `);


    if (checkVivienda.recordset.length > 0) {
      throw new Error('Ya existe una casa con ese nombre de cluster y número de casa.');
    }


    await request
      .input('currentCluster', sql.VarChar, currentCluster)
      .input('currentNumHome', sql.Int, numHome) 
      .query(`
        UPDATE vivienda 
        SET cluster = @newCluster, numCasa = @newNumHome 
        WHERE cluster = @currentCluster AND numCasa = @currentNumHome;
      `);

    await pool.close();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Casa editada en la base de datos correctamente.',
      }),
    };
  } catch (error) {
    console.error('Error al editar casa en la base de datos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message,
        error: error.message,
      }),
    };
  }
};
