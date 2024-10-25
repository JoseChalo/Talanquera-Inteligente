import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/RegisterResident.css';

function EditResident() {
  const [name, setName] = useState('');
  const [dpi, setDpi] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState(null);
  const [numHome, setNumHome] = useState('');
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { residentDPI } = useParams(); // DPI del residente a editar

  // Obtener los datos del residente actual al cargar la página
  useEffect(() => {
    const fetchResidentData = async () => {
      try {
        const response = await fetch(`https://z6p60yenfa.execute-api.us-east-2.amazonaws.com/getDataBase/getAllResidents/${residentDPI}`);
        const data = await response.json();
        setName(data.name);
        setDpi(data.DPI);
        setPhone(data.phone);
        setNumHome(data.numHome);
        setImage(data.image); // Esta imagen será la URL de S3
      } catch (error) {
        console.error('Error al obtener datos del residente:', error);
      }
    };
    fetchResidentData();
  }, [residentDPI]);

  // Iniciar la cámara
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

  const updateResident = async () => {
    if (image) {
      try {
        const response = await fetch('https://4wufzl5q64.execute-api.us-east-2.amazonaws.com/update/updateResident', {
          method: 'POST',
          body: JSON.stringify({
            nombre: name,
            DPI: dpi,
            telefono: phone,
            numHome: numHome,
            image: image,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.message === "Datos actualizados exitosamente.") {
          alert("Residente actualizado con éxito.");
          navigate('/Residents');
        }
      } catch (error) {
        console.error('Error al actualizar los datos del residente:', error);
      }
    } else {
      alert('Toma la foto antes de continuar con la actualización.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !dpi || !phone || !numHome) {
      alert('Por favor completa todos los campos.');
      return;
    }
    updateResident();
  };

  return (
    <div className='registerResident'>
      <Container className='register-resident-container'>
        <h2 className='register-title'>Editar Residente</h2>
        <div className="form-camera-container">
          <Form onSubmit={handleSubmit} className="form-column form-spacing">
            <Form.Group controlId="formName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formDpi" className="formMargin">
              <Form.Label>DPI</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el DPI"
                value={dpi}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length > 4) value = value.replace(/^(\d{4})(\d)/, '$1 $2');
                  if (value.length > 9) value = value.replace(/^(\d{4}) (\d{5})(\d)/, '$1 $2 $3');
                  setDpi(value);
                }}
                maxLength={15}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPhone" className="formMargin">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el teléfono"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                required
              />
            </Form.Group>

            <Form.Group controlId="number" className="formMargin">
              <Form.Label>Número de casa</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el número de casa"
                value={numHome}
                onChange={(e) => setNumHome(e.target.value)}
                required
              />
            </Form.Group>

            <Button className="custom-button" type="submit">
              Actualizar
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
    </div>
  );
}

export default EditResident;