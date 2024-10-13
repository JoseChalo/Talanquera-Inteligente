const AWS = require('aws-sdk');
const fs = require('fs');

// Configura las credenciales
AWS.config.update({
    accessKeyId: 'AKIATFBMPM733BYCUL7Z',
    secretAccessKey: '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',
    region: 'us-east-2' // Cambia por tu región
});

// Crea una instancia de Rekognition
const rekognition = new AWS.Rekognition();

// Lee la imagen local desde el sistema de archivos
const localImage = fs.readFileSync('./fotos/Naza.jpg'); // Cambia por la ruta de tu imagen local

// Define los parámetros para la comparación de rostros
const params = {
    SourceImage: {
        Bytes: localImage // Imagen local en formato de buffer
    },
    TargetImage: {
        S3Object: {
            Bucket: 'imagenes-talanquera-inteligente', // Cambia por el nombre de tu bucket
            Name: 'ImagenPersonalU.jpg' // Cambia por el nombre de la imagen en S3
        }
    },
    SimilarityThreshold: 90 // Umbral de similitud (0-100)
};

// Llama a la función compareFaces
rekognition.compareFaces(params, (err, data) => {
    if (err) {
        console.log('Error:', err); // Maneja el error
    } else {
        console.log('Resultados de comparación:', data); // Datos de respuesta
    }
});
