import React from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';  // Importa useNavigate
import '../styles/Cars.css';

function Cars() {
  const navigate = useNavigate();  // Inicializa el hook de navegación

  const handleRegisterClick = () => {
    navigate('/RegisterCars');  // Redirige a la página de registro de vehículos
  };

  return (
    <div className='carsClass'>
      <Container className='cars-container'>
        <h2>Vehículos Registrados</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Placa</th>
              <th>Modelo</th>
              <th>Propietario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>P570JMK</td>
              <td>Mazda</td>
              <td>Fernando</td>
              <td>
                <Button variant="warning">Editar</Button>{' '}
                <Button variant="danger">Eliminar</Button>
              </td>
            </tr>
          </tbody>
        </Table>
        <Button variant="primary" onClick={handleRegisterClick}>
          Registrar nuevo vehículo
        </Button>
      </Container>
    </div>
  );
}

export default Cars;