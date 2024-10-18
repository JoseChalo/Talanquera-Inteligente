const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();

export const handler = async (event) => {    
  try {
    const image = event.body.image;
    const imageBuffer = Buffer.from(image, 'base64');
    
    const searchParams = {
      CollectionId: 'ResidentsFaces', // ID de la colección
      Image: {
        Bytes: imageBuffer // Enviar datos de imagen
      },
      MaxFaces: 1, // Número máximo de coincidencias
      FaceMatchThreshold: 95 // Umbral de similitud
    };
    
    const data = await rekognition.searchFacesByImage(searchParams).promise();
    
    console.log('Rostros encontrados:', data.FaceMatches);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Rostro reconocido',
        dataResident: data.FaceMatches
      }),
    };     
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