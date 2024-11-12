import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterHouses.css';
import CustomNavbar from './Navbar';

function RegisterHouses() {
  const [numeroCasa, setNumeroCasa] = useState('');
  const [cluster, setCluster] = useState('');
  const navigate = useNavigate();

  // Función para enviar los datos
  const newHouse = async () => {
    try {
      const response = await fetch('https://api-url/saveHouse', {
        method: 'POST',
        body: JSON.stringify({
          numeroCasa: numeroCasa,
          cluster: cluster,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      if (data.success) {
        navigate('/Houses'); // Redirigir a la página de casas después del registro
      } else {
        alert('Error al registrar la casa');
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!numeroCasa || !cluster) {
      alert('Por favor completa todos los campos.');
      return;
    }

    newHouse();
  };

  return (
    <>
      <CustomNavbar />
      <div className='registerHouse'>
        <Container className='register-house-container'>
          <h2 className='register-title'>Registrar Nueva Casa</h2>
          <Form onSubmit={handleSubmit} className="form-column form-spacing">
            <Form.Group controlId="formNumeroCasa">
              <Form.Label>Número de Casa</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el número de casa"
                value={numeroCasa}
                onChange={(e) => setNumeroCasa(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formCluster" className="formMargin">
              <Form.Label>Cluster</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el cluster"
                value={cluster}
                onChange={(e) => setCluster(e.target.value)}
                required
              />
            </Form.Group>

            <Button className="custom-button" type="submit">
              Registrar
            </Button>
          </Form>
        </Container>
      </div>
    </>
  );
}

export default RegisterHouses;