import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import '../styles/RegisterCars.css';

function RegisterCars() {
  const [dpi, setDpi] = useState('');
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Nuevo vehículo registrado:', { dpi, plate, model, color });
  };

  return (
    <div className='registerCars'>
      <Container className='register-cars-container'>
        <h2 className="register-title">Registrar Nuevo Vehículo</h2>
        <Form onSubmit={handleSubmit} className="form-column">
          <Form.Group controlId="formDpi" className="form-group">
            <Form.Label>DPI</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa el DPI"
              value={dpi}
              onChange={(e) => setDpi(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formPlate" className="form-group">
            <Form.Label>Matrícula</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa la matrícula"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formModel" className="form-group">
            <Form.Label>Modelo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa el modelo"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formColor" className="form-group">
            <Form.Label>Color</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa el color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </Form.Group>

          <Button type="submit" className="custom-btn">
            Registrar Vehículo
          </Button>
        </Form>
      </Container>
    </div>
  );
}

export default RegisterCars;