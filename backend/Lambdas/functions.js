const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();

const COLLECTION_ID = 'Faces';

module.exports.handler = async (event) => {
  try {
    const { numFunction } = JSON.parse(event.body);
    let faceList = [];
    let response = null;

    switch (numFunction) {
      case 1:
        try {
          const params = {
            CollectionId: COLLECTION_ID,
            MaxResults: 10,
          };
          let faces = [];
          let hasMoreFaces = true;
          let nextToken = null;

          while (hasMoreFaces) {
            if (nextToken) {
              params.NextToken = nextToken;
            }
            const faceResponse = await rekognition.listFaces(params).promise();
            faces = faces.concat(faceResponse.Faces);
            nextToken = faceResponse.NextToken;
            hasMoreFaces = !!nextToken;
          }

          faceList = faces;
          console.log('Rostros en la colección:', faces);

        } catch (error) {
          console.error('Error al listar rostros en la colección:', error);
        }
        break;

      case 2:
        try {
          const params = {
            CollectionId: COLLECTION_ID,
          };
          response = await rekognition.deleteCollection(params).promise();
          
          console.log(`Colección ${COLLECTION_ID} eliminada. Detalles:`, response);
        } catch (error) {
          console.error('Error al eliminar la colección:', error);
        } 
        break;

      case 3:
        try {
          const params = {
            CollectionId: COLLECTION_ID,
          };
          response = await rekognition.createCollection(params).promise();
          console.log('Colección creada con éxito. Detalles:', response);
        } catch (error) {
          console.error('Error al crear la colección:', error);
        }
        break;

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: 'Función no válida. Use 1 para listar, 2 para eliminar o 3 para crear una colección.',
          }),
        };
    }
  
    return {
      statusCode: 200,
      body: JSON.stringify({
        faceList,
        response,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error al editar colección de datos en Rekognition.',
        error: error.message,
      }),
    };
  }
};
