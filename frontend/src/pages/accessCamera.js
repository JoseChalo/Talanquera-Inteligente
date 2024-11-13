import React, { useRef, useEffect, useState } from 'react';
import { Button, Alert, Table, Card, Container } from 'react-bootstrap';
import '../styles/Home.css';
import CustomNavbar from '../components/Navbar';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';

function Home() {
  const videoRef = useRef(null);
  const [image, setImage] = useState(null);
  const [serverResponse, setServerResponse] = useState(null);
  const [error, setError] = useState(null);
  const [recognitionHistory, setRecognitionHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState('*');

  const [nombreEntrada, setNombreEntrada] = useState('');
  const [dpiEntrada, setdpiEntrada] = useState('');

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  
    const dataURL = canvas.toDataURL('image/jpeg');
    setImage(dataURL);
  };

  const fetchRecognitionHistory = async () => {
    try {
      const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/getRecord', {
        method: 'POST',
        body: JSON.stringify({ dateSearch: selectedDate }),
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) throw new Error('Error al obtener el historial');
  
      const data = await response.json();
      setRecognitionHistory(data.data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(new Date(event.target.value).toISOString().split('T')[0]);
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

      if (!response.ok) throw new Error(`No se reconoce a la persona o vehiculo.`);

      const data = await response.json();
      setNombreEntrada(data.nombreEntrada);
      setdpiEntrada(data.dpiEntrada);
      setServerResponse(data);
      fetchRecognitionHistory();

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
    
    fetchRecognitionHistory();
  }, []);

  return (
    <>
      <CustomNavbar />
        <div className="home-container">
          <Container className="card-container">
            <Card className="card">
              <h2>Historial de Reconocimientos</h2>
              <InputGroup className="mb-3">
                <Form.Control type="date" aria-label="Buscar por fecha" onChange={handleDateChange} />
                <Button className='search' id="button-addon1" onClick={fetchRecognitionHistory}>
                  Buscar
                </Button>
              </InputGroup>
              <div className="card-content table-container">
                <Table striped bordered hover variant="dark">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>DPI</th>
                      <th>fecha</th>
                      <th>hora</th>
                    </tr>
                  </thead>
                    <tbody>
                      {recognitionHistory.length > 0 ? recognitionHistory.map((record, index) => {
                        const fechaObj = new Date(record.fecha);
                        const horaObj = new Date(record.hora);
                        const fechaFormateada = !isNaN(fechaObj) ? fechaObj.toISOString().split('T')[0] : 'Fecha inválida';
                        const horaFormateada = !isNaN(horaObj) ? horaObj.toISOString().split('T')[1].split('.')[0] : 'Hora inválida';

                        return (
                          <tr key={index}>
                            <td>{record.nombre}</td>
                            <td>{record.dpi}</td>
                            <td>{fechaFormateada}</td>
                            <td>{horaFormateada}</td>
                          </tr>
                        );
                      }) : (
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
            {serverResponse.dpiEntrada.length > 0 ? (
              <div>
                <p><strong>Nombre:</strong> {nombreEntrada}</p>
                <p><strong>DPI:</strong> {dpiEntrada}</p>
              </div>
            ) : (
              <p>No se encontraron coincidencias.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Home;