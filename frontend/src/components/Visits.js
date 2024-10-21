import React from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Visits.css';

function Visits() {
  const navigate = useNavigate(); 

  const handleRegisterVisit = () => {
    //lógica después
    navigate('/RegisterVisits');
  };

  return (
    <div className='visitClass'>
      <Container className='visit-container'>
        <h2 className="visits-title">Visitas Registradas</h2>
        <Table striped bordered hover className="visits-table">
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
              <td>
                <Button variant="warning" className="action-button">Editar</Button>
                <Button variant="danger" className="action-button">Eliminar</Button>
              </td>
            </tr>
          </tbody>
        </Table>
        <Button
          variant="primary"
          className="register-visit-button"
          onClick={handleRegisterVisit}
        >
          Registrar nueva visita
        </Button>
      </Container>
    </div>
  );
}

export default Visits;