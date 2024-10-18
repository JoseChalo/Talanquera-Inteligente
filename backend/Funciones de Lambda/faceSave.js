const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();
const AWS = require('aws-sdk');
const mysql = require('mysql');

export const handler = async (event) => {
  try {
    const { 
      name, 
      DPI,
      phone,
      numHome
    } = JSON.parse(event.body);

    const image = event.body.image;
    const buffer = Buffer.from(image, 'base64');
    
    // Parámetros para subir a S3
    const s3Params = {
      Bucket: event.body.S3_BUCKET_NAME,
      Key: `Talanquera_Inteligente_IS/Fotos_Residentes/${DPI}.jpg`,
      Body: buffer,
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg',
    };

    // Subir la imagen a S3
    const uploadResult = await s3.upload(s3Params).promise();
    console.log('Subida a S3:', uploadResult.Location);

/////////////////////////////////////////////////// RDS ////////////////////////////////////////////////////////////////////////////////
  const connection = mysql.createConnection({
    host: 'dbtalanquerainteligente.cnwq4qec0kw3.us-east-2.rds.amazonaws.com', // Host de RDS
    user: 'admin', // Usuario de RDS
    password: 'Skelett337626', // Contraseña de RDS
    database: 'Talanquera_Inteligente' // Nombre de la base de datos
  });

  // Consulta SQL para insertar datos
  const searhHome = 'SELECT * FROM vivienda WHERE numVivienda = ?';
  const newResident = 'INSERT INTO residentes (name, DPI, phone, image, numHome) VALUES (?, ?, ?, ?, ?)';

  connection.query(searhHome, [ numHome ], (errorHome, resultsHome) => {
    if (errorHome) {
      throw new Error('Problemas con la consulta de vivienda: ', errorHome.message);
    } else {
      connection.query(newResident, [name, DPI, phone, image, numHome], (errorResident, resultsResident) => {
        if (errorResident) {
          throw new Error('Problemas con insertar datos de residente: ', errorResident.message);
        }
        if(resultsHome.length === 0){
          throw new Error(`Vivienda con numero ${numHome} no existe.`);
        }
        console.log(resultsResident);
      });
    }
  });

  console.log('Residente ingresado en DB exitosamente.');

  connection.end();

//////////////////////////////////////////////// rekognition ////////////////////////////////////////////////////////////////////////////////
    rekognition.createCollection({ CollectionId: 'ResidentsFaces' }, (err, data) => {
      if (err) console.log(err);
      else console.log(data);
    });

    const params = {
      CollectionId: 'ResidentsFaces',
      Image: {
        S3Object: {
          Bucket: 'imagenes-talanquera-inteligente',
          Name: `Talanquera_Inteligente_IS/Fotos_Residentes/${event.body.DPI}.jpg`
        }
      }
    };

    rekognition.indexFaces(params, (err, data) => {
      if (err) console.log(err);
      else console.log(data);
    });

    console.log('Residente ingresado en rekognition collection exitosamente.');
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Imagen subida correctamente',
        location: uploadResult.Location,
      }),
    };
  } catch (err) {
    console.error('Error al subir la imagen:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error al subir la imagen',
        error: err.message
      }),
    };
  }
};