import React, { useRef, useEffect, useState } from 'react';
import { Button, Alert, Table } from 'react-bootstrap';
import '../styles/Home.css';

function Home() {
  const videoRef = useRef(null);
  const [image, setImage] = useState(null);
  const [serverResponse, setServerResponse] = useState(null);
  const [error, setError] = useState(null);
  const [recognitionHistory, setRecognitionHistory] = useState([]); // Historial de reconocimientos

  // Función para capturar la imagen
  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  
    const dataURL = canvas.toDataURL('image/jpeg');
    setImage(dataURL);
  };

  // Función para enviar la imagen al servidor
  const searchResident = async () => {
    if (!image) {
      alert('Toma la foto antes de continuar.');
      return;
    }

    try {
      setError(null);
      setServerResponse(null);

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

      if (!response.ok) {
        throw new Error(`Error al buscar el residente: ${response.statusText}`);
      }

      const data = await response.json();
      setServerResponse(data);

      if (data.dataResident && data.dataResident.length > 0) {
        const recognizedResident = data.dataResident[0]; 
        const residentData = {
          name: recognizedResident.Face.ExternalImageId,
          dpi: recognizedResident.DPI || 'No disponible',
          confidence: recognizedResident.Face.Confidence.toFixed(2),
          similarity: recognizedResident.Similarity.toFixed(2),
        };
        
        // Actualizar el historial de reconocimientos
        setRecognitionHistory((prevHistory) => [...prevHistory, residentData]);
      }
    } catch (error) {
      setError(error.message);
      console.error('Error al enviar la imagen:', error);
    }
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

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
          <div className="card-content">
            <Table striped bordered hover variant='dark'>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Confianza</th>
                  <th>Similitud</th>
                </tr>
              </thead>
              <tbody>
                {recognitionHistory.length > 0 ? (
                  recognitionHistory.map((record, index) => (
                    <tr key={index}>
                      <td>{record.name}</td>
                      <td>{record.confidence}%</td>
                      <td>{record.similarity}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No hay registros de reconocimiento.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
        <div className="card">
          <h2>Cámara</h2>
          <div className="camera-column">
            <video ref={videoRef} autoPlay className="video-feed" />
            <Button variant="success" onClick={captureImage} className="capture-button">
              Tomar Foto
            </Button>
            {image && (
              <>
                <img src={image} alt="Captura" className="captured-image" />
                <Button className="capture-button" onClick={searchResident}>
                  Enviar Foto
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">Error: {error}</Alert>}
      {serverResponse && (
        <div className="response-container">
          <h2>Resultados del Reconocimiento</h2>
          {serverResponse.dataResident && serverResponse.dataResident.length > 0 ? (
            serverResponse.dataResident.map((match, index) => (
              <div key={index}>
                <p><strong>Residente:</strong> {match.Face.ExternalImageId}</p>
                <p><strong>Confianza:</strong> {match.Face.Confidence.toFixed(2)}%</p>
                <p><strong>Similitud:</strong> {match.Similarity.toFixed(2)}%</p>
              </div>
            ))
          ) : (
            <p>No se encontraron coincidencias.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;