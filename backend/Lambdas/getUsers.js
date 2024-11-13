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

let errorMessage;

module.exports.handler = async (event) => {
  try {
    console.log('Evento recibido:', event);

    const { DPI, contra } = JSON.parse(event.body);

    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    // Espera correctamente la respuesta de la consulta
    const userData = await request
      .input('DPI', sql.VarChar, DPI)
      .query('SELECT rol, userDPI, contra FROM usuarios WHERE userDPI = @DPI');
    
    if (userData.recordset.length === 0) {
      errorMessage = 'DPI no registrado como residente.';
      throw new Error(errorMessage);
    } else if (userData.recordset[0].contra != contra) {
      errorMessage = 'Contraseña incorrecta';
      throw new Error(errorMessage);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Residente logeado correctamente', 
        userDPI: userData.recordset[0].userDPI,
        rol: userData.recordset[0].rol
      }),
    };
  } catch (error) {
    console.error('Error en Lambda:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: errorMessage, 
        error: error.message 
      }),
    };
  }
};
