const AWS = require('aws-sdk');

// Configura las credenciales
AWS.config.update({
  accessKeyId: 'AKIATFBMPM733BYCUL7Z',
  secretAccessKey: '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',
  region: 'us-east-2'
});

const rekognition = new AWS.Rekognition();
