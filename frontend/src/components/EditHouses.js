import React, { useState, useEffect } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/RegisterResident.css';
import CustomNavbar from './Navbar';

function EditHouses() {
  const [numCasa, setnumCasa] = useState(''); 
  const [cluster, setCluster] = useState(''); 
  const navigate = useNavigate();
  const location = useLocation();
  const house = location.state?.house;

  useEffect(() => {
    if (house) {
      setnumCasa(house.numCasa || '');
      setCluster(house.cluster || '');
    }
  }, [house]);

  const updateHouse = async () => {
    try {
      const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/editHome', {
        method: 'POST',
        body: JSON.stringify({
          newCluster: cluster,
          newNumHome: numCasa,
          currentCluster: house.cluster,
          currentNumHome: house.numCasa
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
    if (!numCasa || !cluster) {
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
            <Form.Group controlId="formnumCasa">
              <Form.Label>Número de Casa</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el número de casa"
                value={numCasa} 
                onChange={(e) => setnumCasa(e.target.value)}
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