import React, { useState, useEffect } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/RegisterResident.css';
import CustomNavbar from './Navbar';

function EditHouses() {
  const [houseNumber, setHouseNumber] = useState('');
  const [cluster, setCluster] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const house = location.state?.house;

  // Obtener los datos de la casa al cargar la página
  useEffect(() => {
    if (house) {
      setHouseNumber(house.houseNumber || '');
      setCluster(house.cluster || '');
    }
  }, [house]);

  // Función para enviar la actualización
  const updateHouse = async () => {
    try {
      const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/updateHouse', {
        method: 'POST',
        body: JSON.stringify({
          houseNumber,
          cluster,
          houseId: house.houseId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);
    } catch (error) {
      console.error('Error al actualizar los datos:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!houseNumber || !cluster) {
      alert('Por favor completa todos los campos.');
      return;
    }

    updateHouse().then(() => {
      navigate('/Houses');
    });
  };

  return (
    <>
      <CustomNavbar />
      <div className='registerResident'>
        <Container className='register-resident-container'>
          <h2 className='register-title'>Editar Casa</h2>
          <Form onSubmit={handleSubmit} className="form-column form-spacing">
            <Form.Group controlId="formHouseNumber">
              <Form.Label>Número de Casa</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el número de casa"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
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
              Actualizar
            </Button>
          </Form>
        </Container>
      </div>
    </>
  );
}

export default EditHouses;