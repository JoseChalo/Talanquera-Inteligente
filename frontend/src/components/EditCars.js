import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/RegisterResident.css';
import CustomNavbar from './Navbar';

function EditCars() {
  const [dpi, setDpi] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [image, setImage] = useState('No Foto');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const car = location.state?.car;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      } catch (error) {
        console.error("Error al acceder a la cámara:", error);
      }
    };
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if(car){
      setDpi(car.idResidente || '');
      setModel(car.modelo || '');
      setColor(car.color);
      setImage('No Foto');
    }
  }, [car]);

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

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const updateCar = async () => {
    if (image) {
      setLoading(true);
      try {
        const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/updateCar', {
          method: 'POST',
          body: JSON.stringify({
            DPI: dpi,
            credencialesVehiculo: image,
            modelo: model,
            color: color,
            matricula: car.matricula
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        alert(data.message);
        if(data.error){
          return false;
        } else {
          return true;
        }

      } catch (error) {
        console.error('Error al actualizar los datos:', error);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Toma la foto antes de continuar con la actualización.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dpi || !model || !color) {
      alert('Por favor completa todos los campos.');
      return;
    }

    updateCar().then((finalizado) => {
      if(finalizado){
        stopCamera();
        navigate('/Cars');
      }
    });
  };

  return (
    <>
      <CustomNavbar></CustomNavbar>
      <div className='registerResident'>
        <Container className='register-resident-container'>
          <h2 className='register-title'>Editar Automóvil</h2>
          <div className="form-camera-container">
            <Form onSubmit={handleSubmit} className="form-column form-spacing">
              <Form.Group controlId="formDpi">
                <Form.Label>DPI</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingresa el DPI"
                  value={dpi}
                  required
                  readOnly
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

              <Button className="custom-button" type="submit" disabled={loading}>
                {loading ? (<> <Spinner animation="border" size="sm" /> Cargando...</>) : ('Actualizar')}
              </Button>
            </Form>

            <div className="camera-column">
              <Form.Label>Fotografía de la Placa</Form.Label>
              <video ref={videoRef} autoPlay className="video-feed" />
              <Button variant="success" onClick={captureImage} className="capture-button">
                Tomar Foto
              </Button>
              {<img src={image !== 'No Foto'? image : `${car.credencialesVehiculo}?v=${Date.now()}`} alt="Captura" className="captured-image" />}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}

export default EditCars;