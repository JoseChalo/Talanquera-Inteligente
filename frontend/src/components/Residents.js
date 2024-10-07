import React from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Residents.css';

function Residents() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/RegisterResident');
  };

  return (
    <div className='residentClass'>
      <Container className='resident-container'>
        <h2>Residentes Registrados</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Jose Fernando</td>
              <td>Calle 123</td>
              <td>12345678</td>
              <td>
                <Button variant="warning" onClick={handleClick}>Editar</Button>{' '}
                <Button variant="danger">Eliminar</Button>
              </td>
            </tr>
          </tbody>
        </Table>
        <Button variant="primary" onClick={handleClick}>Registrar nuevo residente</Button>
      </Container>
    </div>
  );
}

export default Residents;