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
    
    const searchMatricula = body.matricula;

    if (searchMatricula !== '*') {
      request.input('matricula', sql.VarChar, searchMatricula);
      const searchCars = `
        SELECT A.matricula, A.modelo, A.color, A.credencialesVehiculo, RA.idResidente
        FROM automovil A
        INNER JOIN residentes_automovil RA ON A.matricula = RA.matricula
        WHERE A.matricula = @matricula AND A.estado = 1
      `;
      const resultsSearchCars = await request.query(searchCars);
      
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: resultsSearchCars.recordset.length > 0 ? 'Carros encontrados.' : 'No se encontraron carros.',
          data: resultsSearchCars.recordset,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };

      return response;
    } else {
      const searchCars = `
        SELECT A.matricula, A.modelo, A.color, A.credencialesVehiculo, RA.idResidente
        FROM automovil A
        INNER JOIN residentes_automovil RA ON A.matricula = RA.matricula
        WHERE estado = 1
      `;
      const resultsSearchCars = await request.query(searchCars);
      
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: resultsSearchCars.recordset.length > 0 ? 'Carros encontrados.' : 'No se encontraron carros.',
          data: resultsSearchCars.recordset,
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
      await pool.close();
    }
  }
};
