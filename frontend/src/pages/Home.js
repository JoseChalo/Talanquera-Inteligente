import React, { useRef, useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import '../styles/Home.css';

function Home() {
  const videoRef = useRef(null);
  const [image, setImage] = useState(null);

  // Función para capturar la imagen
  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  
    // Convertir la imagen a base64
    const dataURL = canvas.toDataURL('image/jpeg');
    setImage(dataURL); // Guardar la imagen en el estado
  };

  // Función para enviar la imagen al servidor
  const searchResident = async () => {
    if (!image) {
      alert('Toma la foto antes de continuar.');
      return;
    }

    try {
      // Enviar la imagen a la API como POST request
      const response = await fetch('https://gh8bben0sg.execute-api.us-east-2.amazonaws.com/search/residentFaceID', {
        method: 'POST',
        body: JSON.stringify({ 
          image: image,
          S3_BUCKET_NAME: "imagenes-talanquera-inteligente"
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);
    } catch (error) {
      console.error('Error al enviar la imagen:', error);
    }
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        // Limpiar el stream al desmontar
        return () => {
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (error) {
        console.error("Error al acceder a la cámara:", error);
      }
    };

    startCamera();
  }, []);

  return (
    <div className="home-container">
      <div className="card-container">
        <div className="card">
          <h2>Visitas</h2>
          <div className="card-content">Contenido de visitas</div>
        </div>
        <div className="card">
          <h2>Cámara</h2>
          <div className="card-content">Visualización de cámara</div>
          <div className="camera-column">
            <Form.Label>Fotografía</Form.Label>
            <video ref={videoRef} autoPlay className="video-feed" />
            <Button variant="success" onClick={captureImage} className="capture-button">
              Tomar Foto
            </Button>
            {image && (
              <>
                <img src={image} alt="Captura" className="captured-image" />
                <Button variant="primary" onClick={searchResident}>
                  Enviar Foto
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
