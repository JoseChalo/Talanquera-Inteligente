import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Visits.css';

function Visits() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState(null);

  // Función para obtener visitas (aun no sirve creo xd cambiar url)
  const fetchVisits = async () => {
    try {
      const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/getVisits', {
        method: 'POST',
        body: JSON.stringify({ DPI: '*' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setVisits(data.data);
    } catch (error) {
      console.error('Error al obtener visitas:', error);
    }
  };

  // Llamada inicial para cargar visitas
  useEffect(() => {
    fetchVisits();
  }, []);

  // Manejar el registro de nueva visita
  const handleRegisterVisit = () => {
    navigate('/RegisterVisits');
  };

  // Editar visita
  const handleEditClick = (visit) => {
    navigate('/EditVisit', { state: { visita: visit } });
  };


  // Configurar visita para eliminar y abrir modal
  const handleDeleteClick = (visit) => {
    setVisitToDelete(visit);
    setShowModal(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (visitToDelete) {
      try {
        const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/deleteVisit', {
          method: 'POST',
          body: JSON.stringify({ DPI: visitToDelete.dpiVisita }),
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          await fetchVisits();
          setShowModal(false);
        } else {
          console.error('Error al eliminar visita:', response.statusText);
        }
      } catch (error) {
        console.error('Error al eliminar visita:', error);
      }
    }
  };

  return (
    <div className='visitClass'>
      <Container className='visit-container'>
        <div className="title-and-button">
          <h2 className="visits-title">Visitas Registradas</h2>
          <Button variant="primary" onClick={handleRegisterVisit} className="register-visit-button">
            Registrar nueva visita
          </Button>
        </div>
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>Dpi Visita</th>
              <th>Nombre</th>
              <th>Dpi Residente</th>
              <th>Cluster</th>
              <th>Vivienda</th>
              <th>Forma de Ingreso</th>
              <th>Fotografía</th>
              <th>Número de Ingresos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit, index) => (
              <tr key={index}>
                <td>{visit.dpiVisita}</td>
                <td>{visit.nombre}</td>
                <td>{visit.dpiResidente}</td>
                <td>{visit.cluster}</td>
                <td>{visit.numVivienda}</td>
                <td>{visit.metodoIngreso}</td>
                <td>
                  <img 
                    src={`${visit.datoBiometrico}?t=${Date.now()}`} 
                    alt="Fotografía de la visita" 
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                  />
                </td>
                <td>{visit.numIngresos}</td>
                <td>
                  <Button variant="warning" onClick={() => handleEditClick(visit)} className="action-button"> Editar </Button>
                  <Button variant="danger" onClick={() => handleDeleteClick(visit)} className="action-button">  Eliminar </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Modal de confirmación */}
        <Modal show={showModal} onHide={() => setShowModal(false)} className="dark-modal">
          <Modal.Header closeButton>
            <Modal.Title>Confirmación de Eliminación</Modal.Title>
          </Modal.Header>
          <Modal.Body>¿Estás seguro de que deseas eliminar a {visitToDelete?.nombre}?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default Visits;