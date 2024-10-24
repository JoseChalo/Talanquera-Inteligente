import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterResident.css';

function RegisterCars() {
  const [dpi, setDpi] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [numero, setNumero] = useState('');
  const [image, setImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null); // Para almacenar el stream de la cámara
  const navigate = useNavigate();

  // Iniciar la cámara
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        streamRef.current = stream; // Guardar el stream
      } catch (error) {
        console.error("Error al acceder a la cámara:", error);
      }
    };
    startCamera();

    // Limpiar el stream al desmontar
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Capturar la imagen
  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        setImage(reader.result);
      };
    }, 'image/jpeg');
  };

  // Apagar la cámara
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // Función para enviar los datos
  const newCar = async () => {
    if (image) {
      try {
        const response = await fetch('https://kcxa2xedhl.execute-api.us-east-2.amazonaws.com/save/saveCar', {
          method: 'POST',
          body: JSON.stringify({
            DPI: dpi,
            matricula: image,  // Enviar la imagen de la matrícula
            modelo: model,
            color: color,
            numero: numero
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);
      } catch (error) {
        console.error('Error al enviar los datos:', error);
      }
    } else {
      alert('Toma la foto antes de continuar con el registro.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dpi || !model || !color || !numero) {
      alert('Por favor completa todos los campos.');
      return;
    }

    newCar().then(() => {
      stopCamera(); // Apagar la cámara antes de navegar
      navigate('/Cars');
    });
  };

  return (
    <div className='registerResident'>
      <Container className='register-resident-container'>
        <h2 className='register-title'>Registrar Nuevo Automóvil</h2>
        <div className="form-camera-container">
          <Form onSubmit={handleSubmit} className="form-column form-spacing">
            <Form.Group controlId="formDpi">
              <Form.Label>DPI</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el DPI"
                value={dpi}
                onChange={(e) => setDpi(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formModel" className="formMargin">
              <Form.Label>Modelo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el modelo"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formColor" className="formMargin">
              <Form.Label>Color</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formColor" className="formMargin">
              <Form.Label>Número</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el número"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                required
              />
            </Form.Group>

            <Button className="custom-button" type="submit">
              Registrar
            </Button>
          </Form>

          <div className="camera-column">
            <Form.Label>Fotografía de la Placa</Form.Label>
            <video ref={videoRef} autoPlay className="video-feed" />
            <Button variant="success" onClick={captureImage} className="capture-button">
              Tomar Foto
            </Button>
            {image && <img src={image} alt="Captura" className="captured-image" />}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default RegisterCars;