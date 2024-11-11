import React, { useRef, useEffect, useState } from 'react';
import { Button, Alert, Table, Card, Container } from 'react-bootstrap';
import '../styles/Home.css';

function Home() {
  const videoRef = useRef(null);
  const [image, setImage] = useState(null);
  const [serverResponse, setServerResponse] = useState(null);
  const [error, setError] = useState(null);
  const [recognitionHistory, setRecognitionHistory] = useState([]);

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  
    const dataURL = canvas.toDataURL('image/jpeg');
    setImage(dataURL);
  };

  const searchResident = async () => {
    if (!image) {
      alert('Toma la foto antes de continuar.');
      return;
    }
    try {
      setError(null);
      setServerResponse(null);

      const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/residentFaceID', {
        method: 'POST',
        body: JSON.stringify({ image: image, S3_BUCKET_NAME: "imagenes-talanquera-inteligente" }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error(`Error: Error al buscar el residente: ${response.statusText}`);

      const data = await response.json();
      setServerResponse(data);

      console.log(data);

      if (data.dataResident) {
        const recognizedResident = data.dataResident[0];

        // Parsear el nombre
        const nameRaw = recognizedResident.Face.ExternalImageId;
        const cleanedText = nameRaw.replace('Nombre:', '').replace('DPI:', '');
        const [name, dpi] = cleanedText.split('_');
        const formattedName = name.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        const formattedDpi = dpi.replace(/-/g, ' ');

        const residentData = {
          name: formattedName,
          dpi: formattedDpi,
          confidence: recognizedResident.Face.Confidence.toFixed(2),
          similarity: recognizedResident.Similarity.toFixed(2),
        };
        setRecognitionHistory((prevHistory) => [...prevHistory, residentData]);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Error al acceder a la cámara:", error);
      }
    };
    startCamera();
  }, []);

  return (
    <div className="home-container">
      <Container className="card-container">
        <Card className="card">
          <h2>Historial de Reconocimientos</h2>
          <div className="card-content table-container">
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>DPI</th>
                  <th>Confianza</th>
                  <th>Similitud</th>
                </tr>
              </thead>
              <tbody>
                {recognitionHistory.length > 0 ? recognitionHistory.map((record, index) => (
                  <tr key={index}>
                    <td>{record.name}</td>
                    <td>{record.dpi}</td>
                    <td>{record.confidence}%</td>
                    <td>{record.similarity}%</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4">No hay registros.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card className="card">
          <h2>Cámara</h2>
          <div className="camera-column">
            <video ref={videoRef} autoPlay className="video-feed" />
            <Button variant="success" onClick={captureImage} className="capture-button">
              Tomar Foto
            </Button>



            {image && (
              <div className="captured-image-container">
                <img src={image} alt="Captura" className="captured-image" />
                <Button variant="info" onClick={searchResident} className="capture-button">
                  Enviar Foto
                </Button>
              </div>
            )}



          </div>
        </Card>
      </Container>

      {error && <Alert variant="danger">{error}</Alert>}
      {serverResponse && (
        <div className="response-container">
          <h2>Resultados del Reconocimiento</h2>
          {serverResponse.dataResident.length > 0 ? (
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