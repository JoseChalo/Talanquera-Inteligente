const AWS = require('aws-sdk');

// Configura las credenciales de AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const rekognition = new AWS.Rekognition();

console.log(process.env.AWS_ACCESS_KEY_ID);
console.log(process.env.AWS_SECRET_ACCESS_KEY);
console.log(process.env.AWS_REGION);

// Función que realiza la comparación de rostros
const compareFaces = (imageBase64, callback) => {
  const params = {
    SourceImage: {
      Bytes: Buffer.from(imageBase64, 'base64')
    },
    TargetImage: {
      S3Object: {
        Bucket: 'imagenes-talanquera-inteligente', // Cambia por el nombre de tu bucket
        Name: 'ImagenPersonalU.jpg' // Cambia por el nombre de la imagen en S3
      }
    },
    SimilarityThreshold: 90
  };

  rekognition.compareFaces(params, (err, data) => {
    if (err) {
      console.error('Error al comparar los rostros:', err);
      callback(err, null);
    } else {
      console.log('Resultados de comparación:', data);
      callback(null, data);
    }
  });
};

module.exports = {
  compareFaces
};
