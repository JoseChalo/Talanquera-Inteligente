const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();

const handler = async (event) => {
  try {
    // Parsear el cuerpo si es una cadena
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    // Verificar que el campo 'image' exista
    if (!body.image) {
      throw new Error("El campo 'image' es requerido.");
    }

    const base64Data = body.image.replace(/^data:image\/jpeg;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

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

module.exports = { handler };