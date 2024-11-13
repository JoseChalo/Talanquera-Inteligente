const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();
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
    const { opcionSearch, dpiSeacrh } = JSON.parse(event.body);

    const pool = await sql.connect(sqlConfig);
    const request = pool.request();
    let getHomes;

    if (opcionSearch !== 'AllHomes') {
      getHomes = await request.query(`
        SELECT v.idVivienda, v.numCasa, v.cluster
        FROM vivienda v
        LEFT JOIN residentes r ON v.idVivienda = r.idVivienda
        WHERE r.dpi IS NULL AND v.estado = 1;
      `);
    } else if (dpiSeacrh) {
      getHomes = await request
        .input('dpi', sql.VarChar, dpiSeacrh)
      .query(`
        SELECT v.idVivienda, v.numCasa, v.cluster, r.dpi, r.nombre
        FROM vivienda v
        LEFT JOIN residentes r 
        ON v.idVivienda = r.idVivienda AND r.estado = 1
        WHERE v.estado = 1 AND r.dpi = @dpi
      `);
    } else {
      getHomes = await request
      .query(`
        SELECT v.idVivienda, v.numCasa, v.cluster, r.dpi, r.nombre
        FROM vivienda v
        LEFT JOIN residentes r 
        ON v.idVivienda = r.idVivienda AND r.estado = 1
        WHERE v.estado = 1
      `);
    }


    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Tabla de viviendas consultada.',
        data: getHomes.recordset,
      }),       
    }
  } catch (error) {
    console.error('Error al hacer la consulta a la base de datos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error al hacer la consulta a la base de datos.',
        error: error.message
      }),
    };
  }
};