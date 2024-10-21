import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import '../styles/RegisterVisits.css'; 

function RegisterVisits() {
  const [name, setName] = useState('');
  const [dpi, setDpi] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [image, setImage] = useState(null);
  const videoRef = useRef(null);

  // Iniciar la cámara cuando se monta el componente
  useEffect(() => {
    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    };
    startCamera();
  }, []);

  // Captura la imagen al presionar el botón
  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    setImage(imageData); // Guarda la imagen localmente
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Nueva visita:', { name, dpi, licensePlate, image });
  };

  return (
    <Container className='register-visit-container'>
      <h2 className="register-title">Registrar Nueva Visita</h2>
      <div className="form-camera-container">

        <Form onSubmit={handleSubmit} className="form-column">
          <Form.Group controlId="formName">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa el nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formDpi" className="formMargin">
            <Form.Label>DPI</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa el DPI"
              value={dpi}
              onChange={(e) => setDpi(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formLicensePlate" className="formMargin">
            <Form.Label>Placa</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa la placa"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
            />
          </Form.Group>

          <Button className="custom-button" type="submit">
            Registrar
          </Button>
        </Form>


        <div className="camera-column">
          <Form.Label>Fotografía</Form.Label>
          <video ref={videoRef} autoPlay className="video-feed" />
          <Button variant="success" onClick={captureImage} className="capture-button">
            Tomar Foto
          </Button>
          {image && <img src={image} alt="Captura" className="captured-image" />}
        </div>

      </div>
    </Container>
  );
}

export default RegisterVisits;