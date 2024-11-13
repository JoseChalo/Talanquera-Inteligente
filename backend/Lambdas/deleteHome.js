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

    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    request.input('cluster', sql.VarChar, currentCluster);
    request.input('numCasa', sql.Int, currentNumHome);

    const dataResidante = await request
      .query(`
        SELECT V.idVivienda, V.numCasa, V.cluster, R.dpi, R.estado AS estadoResidente 
        FROM vivienda V INNER JOIN residentes R 
        ON V.idVivienda = R.idVivienda WHERE R.estado = 1 AND cluster = @cluster AND numCasa = @numCasa;
      `);

    const currentDataVivienda = await request
      .query(`SELECT * FROM vivienda WHERE cluster = @cluster AND numCasa = @numCasa AND estado = 1`);
    if (currentDataVivienda.recordset.length === 0) {
      throw new Error('La casa que se desea eliminar ya esta eliminada o no existe en la base de datos');
    }

    if (dataResidante.recordset.length > 0) {
      const dataVisitas = await request
          .input('idViviendaDestino', sql.Int, dataResidante.recordset[0].idVivienda)
        .query(`
          SELECT V.idVivienda, V.numCasa, V.cluster, VS.dpiVisita, VS.estado AS estadoVisita 
          FROM vivienda V INNER JOIN visitas VS
          ON V.idVivienda = VS.idViviendaDestino WHERE VS.estado = 1 AND idViviendaDestino = @idViviendaDestino;
        `);

      if (newCluster && newNumHome) {
        const newIdVivienda = await request
            .input('newCluster', sql.VarChar, newCluster)
            .input('newNumHome', sql.Int, newNumHome)
          .query(`SELECT * FROM vivienda WHERE cluster = @newCluster AND numCasa = @newNumHome AND estado = 1`);

        if (newIdVivienda.recordset.length === 0) {
          throw new Error('Los datos de la nueva casa son incorrectos.');
        }

        const newIdViviendaValue = newIdVivienda.recordset[0].idVivienda;
        request.input('newIdVivienda', sql.Int, newIdViviendaValue);

        for (let index = 0; index < dataResidante.recordset.length; index++) {
          await request
              .input('dpi', sql.VarChar, dataResidante.recordset[index].dpi)
            .query(`UPDATE residentes SET idVivienda = @newIdVivienda WHERE dpi = @dpi`);
        }

        for (let index = 0; index < dataVisitas.recordset.length; index++) {
          await request
              .input('dpi', sql.VarChar, dataVisitas.recordset[index].dpiVisita)
            .query(`UPDATE visitas SET idViviendaDestino = @newIdVivienda WHERE dpiVisita = @dpi`);
        }

        await request.query(`
          UPDATE vivienda SET estado = 0 WHERE cluster = @cluster AND numCasa = @numCasa;
        `);
      } else {
        for (let index = 0; index < dataResidante.recordset.length; index++) {
          await request
              .input('dpi', sql.VarChar, dataResidante.recordset[index].dpi)
            .query(`UPDATE residentes SET estado = 0 WHERE dpi = @dpi`);
        }

        for (let index = 0; index < dataVisitas.recordset.length; index++) {
          await request
              .input('dpi', sql.VarChar, dataVisitas.recordset[index].dpiVisita)
            .query(`UPDATE visitas SET estado = 0 WHERE dpiVisita = @dpi`);
        }
      }
      await request
        .input('idVivienda', sql.Int, currentDataVivienda.recordset[0].idVivienda)
        .query(`UPDATE vivienda SET estado = 0 WHERE idVivienda = @idVivienda`);
    } else {
      await request
        .input('idVivienda', sql.Int, currentDataVivienda.recordset[0].idVivienda)
        .query(`UPDATE vivienda SET estado = 0 WHERE idVivienda = @idVivienda`);
    }

    await pool.close();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Casa eliminada de la base de datos correctamente.',
      }),
    };
  } catch (error) {
    console.error('Error al eliminar casa de la base de datos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error al eliminar casa de la base de datos.',
        error: error.message,
      }),
    };
  }
};
