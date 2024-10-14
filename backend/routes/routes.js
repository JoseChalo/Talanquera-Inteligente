const express = require('express');
const router = express.Router();
const rekognitionService = require('../services/rekognitionService');

// Ruta para manejar la captura de imágenes y realizar la comparación
router.post('/faceCompare', (req, res) => {
  const imageBase64 = req.body.image.split(',')[1]; // Elimina el prefijo del data URL
  
  rekognitionService.compareFaces(imageBase64, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la comparación de rostros' });
    }
    return res.json(data);
  });
});

module.exports = router;
