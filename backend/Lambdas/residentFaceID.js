const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();
const sql = require('mssql');
const moment = require('moment-timezone');

const nowInGuatemala = moment.tz('America/Guatemala');
const fecha = nowInGuatemala.format('YYYY-MM-DD');
const hora = nowInGuatemala.format('YYYY-MM-DD HH:mm:ss');

const S3_BUCKET_NAME = 'imagenes-talanquera-inteligente';
let isPersonChek = false;
let isCarChek = false;
let imageBuffer = null;
let detectedPlateText = null;

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
    const { image } = JSON.parse(event.body);

    if (!image) {
      throw new Error("El campo 'image' es requerido.");
    }

    await analyzeImageFromBytes(image);

    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    if (isPersonChek) {
      const searchParams = {
        CollectionId: 'Faces',
        Image: { Bytes: imageBuffer },
        MaxFaces: 1,
        FaceMatchThreshold: 95
      };
  
      const data = await rekognition.searchFacesByImage(searchParams).promise();
      if (data.FaceMatches.length > 0) {
        const recognizedResident = data.FaceMatches[0];
        const nameRaw = recognizedResident.Face.ExternalImageId;
        const cleanedText = nameRaw.replace('Nombre:', '').replace('DPI:', '');
        const [name, dpi] = cleanedText.split('_');
        const formattedName = name.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        const formattedDpi = dpi.replace(/-/g, ' ');

        console.log('Rostros encontrados:', data.FaceMatches);
        request.input('dpi', sql.VarChar, formattedDpi);
        const comprobacionResidentes = await request.query(`SELECT * FROM residentes WHERE dpi = @dpi AND estado = 1`);
        const comprobacionVisitas = await request.query(`SELECT * FROM visitas WHERE dpiVisita = @dpi AND estado = 1`);

        console.log(comprobacionResidentes.recordset.length === 0 && comprobacionVisitas.recordset.length === 0);
        if (comprobacionResidentes.recordset.length === 0 && comprobacionVisitas.recordset.length === 0) {
          throw Error('No se reconocio ninguna persona.');
        }

        if(comprobacionVisitas.recordset.length > 0){
          console.log('Quitando 1 en el numero de ingresos de la visita;');
          await request.query(`
            UPDATE visitas SET numIngresos = numIngresos - 1 WHERE dpiVisita = @dpi
          `);
        } 

        await request
          .input('nombre', sql.VarChar, formattedName)
          .input('fecha', sql.Date, fecha)
          .input('hora', sql.DateTime, hora)
        .query(`
          INSERT INTO historial_Entradas (dpi, nombre, fecha, hora) 
          VALUES (@dpi, @nombre, @fecha, @hora)
        `);
        
        console.log('Devolviendo datos reconocidos.');
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Rostro reconocido',
            dataResident: data.FaceMatches,
            dpiEntrada: formattedDpi,
            nombreEntrada: formattedName,
            carData: ' '
          }),
        };
      } else {
        throw new Error('No se encontró un rostro coincidente en la colección.');
      }
    } else if (isCarChek) {
      const matricula = detectedPlateText;

      let dpiEntrada;
      let nombreEntrada;

      request.input('matricula', sql.VarChar, matricula);
      const searchMariculaResidente = await request.query(`
        SELECT R.dpi, R.nombre FROM residentes R INNER JOIN 
          (SELECT A.matricula, RA.idResidente FROM automovil A INNER JOIN 
          residentes_automovil RA ON A.matricula = RA.matricula) AD 
        ON AD.idResidente = R.dpi
        WHERE R.estado = 1 AND AD.matricula = @matricula
      `);

      if (searchMariculaResidente.recordset.length === 0) {
        const searchMatriculaVisita = await request.query(`
          SELECT dpiVisita, nombreVisita FROM visitas 
          WHERE estado = 1 AND matriculaVehiculo = @matricula
        `);

      if (searchMatriculaVisita.recordset.length > 0) {
          dpiEntrada = searchMatriculaVisita.recordset[0].dpiVisita;
          nombreEntrada = searchMatriculaVisita.recordset[0].nombreVisita;
          await request.query(`UPDATE visitas SET numIngresos = numIngresos - 1 WHERE matriculaVehiculo = @matricula`);
        } else {
          throw new Error('No se encuentra la placa en la base de datos.');
        }
      } else {
        dpiEntrada = searchMariculaResidente.recordset[0].dpi;
        nombreEntrada = searchMariculaResidente.recordset[0].nombre;
      }

      await request
        .input('dpi', sql.VarChar, dpiEntrada)
        .input('nombre', sql.VarChar, nombreEntrada)
        .input('fecha', sql.Date, fecha)
        .input('hora', sql.DateTime, hora)
      .query(`
        INSERT INTO historial_Entradas (dpi, nombre, fecha, hora) 
        VALUES (@dpi, @nombre, @fecha, @hora)
      `);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Vehículo reconocido',
          dataResident: '',
          matriculaCar: detectedPlateText,
          dpiEntrada: dpiEntrada,
          nombreEntrada: nombreEntrada
        }),
      };
    }

  } catch (error) {
    console.error('Error al reconocer rostro de residente:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error al reconocer rostro de residente',
        error: error.message
      }),
    };
  }
};

const analyzeImageFromBytes = async (image) => {
  try {
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const detectLabelsParams = {
      Image: { Bytes: buffer },
      MaxLabels: 10,
      MinConfidence: 90,
    };
    const labelsResponse = await rekognition.detectLabels(detectLabelsParams).promise();

    isPersonChek = labelsResponse.Labels.some(label =>
      ['Person', 'Human'].includes(label.Name)
    );

    const detectTextParams = { Image: { Bytes: buffer } };
    const rekognitionData = await rekognition.detectText(detectTextParams).promise();
    console.log("Textos detectados:", rekognitionData.TextDetections);

    const placaPattern = /^[PACUM]{1}\s?\d{3}[A-Z]{3}$/;
    const placasDetectadas = rekognitionData.TextDetections
      .map(detection => detection.DetectedText)
      .filter(text => placaPattern.test(text));

    isCarChek = placasDetectadas.length > 0;
    imageBuffer = buffer;
    detectedPlateText = placasDetectadas[0];
  } catch (error) {
    console.error("Error al analizar la imagen:", error);
    throw new Error("Error al procesar la imagen.");
  }
};