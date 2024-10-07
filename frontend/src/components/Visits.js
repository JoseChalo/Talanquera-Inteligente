import React from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import '../styles/Visits.css';

function Visits() {
  return (
    <div className='visitClass'>
      <Container className = 'visit-container'>
        <h2>Visitas Registradas</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nombre del visitante</th>
              <th>Residente asociado</th>
              <th>Hora de llegada</th>
              <th>Hora de salida</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Alejandra Carrillo</td>
              <td>Fernando</td>
              <td>10:00 AM</td>
              <td>12:00 PM</td>
              <td><Button variant="warning">Editar</Button> <Button variant="danger">Eliminar</Button></td>
            </tr>
          </tbody>
        </Table>
        <Button variant="primary">Registrar nueva visita</Button>
      </Container>
    </div>
  );
}

export default Visits;