import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Visits.css';
import CustomNavbar from './Navbar';

function Visits() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const fetchVisits = async (storedUser) => {
    try {
      let dpiValue;
      if (storedUser.role === 'admin') {
        dpiValue = '*';
      } else {
        dpiValue = storedUser.user;
      }
      
      const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/getVisits', {
        method: 'POST',
        body: JSON.stringify({ DPI: dpiValue }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      setVisits(data.data);
    } catch (error) {
      console.error('Error al obtener visitas:', error);
    }
  };
  
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (storedUser) {
      fetchVisits(storedUser);
    } else {
      console.error('No user found in local storage.');
      navigate('/login');
    }
  }, [navigate]);

  const handleRegisterVisit = () => {
    navigate('/RegisterVisits');
  };

  const handleEditClick = (visit) => {
    navigate('/EditVisit', { state: { visita: visit } });
  };

  const handleDeleteClick = (visit) => {
    setVisitToDelete(visit);
    setShowModal(true);
  };
  
  const confirmDelete = async () => {
    if (visitToDelete) {
      setLoadingDelete(true);
      try {
        const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/deleteVisit', {
          method: 'POST',
          body: JSON.stringify({ dpiVisita: visitToDelete.dpiVisita }),
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          setVisits((prevVisits) => prevVisits.filter((visit) => visit.dpiVisita !== visitToDelete.dpiVisita));
          setShowModal(false);
        } else {
          console.error('Error al eliminar visita:', response.statusText);
        }
      } catch (error) {
        console.error('Error al eliminar visita:', error);
      }
      finally {
        setLoadingDelete(false);
      }
    }
  };

  return (
    <>
      <CustomNavbar></CustomNavbar>
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
              {visits && visits.map((visit, index) => (
                <tr key={index}>
                  <td>{visit.dpiVisita}</td>
                  <td>{visit.nombreVisita}</td>
                  <td>{visit.dpiResidente}</td>
                  <td>{visit.cluster}</td>
                  <td>{visit.numCasa}</td>
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
                    <Button className='editarButtonV' onClick={() => handleEditClick(visit)}> Editar </Button>
                    <Button className='eliminarButtonV' onClick={() => handleDeleteClick(visit)}>  Eliminar </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Modal show={showModal} onHide={() => setShowModal(false)} className="dark-modal">
            <Modal.Header closeButton>
              <Modal.Title>Confirmación de Eliminación</Modal.Title>
            </Modal.Header>
            <Modal.Body>¿Estás seguro de que deseas eliminar a {visitToDelete?.nombreVisita}?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button variant="danger" onClick={confirmDelete} disabled={loadingDelete} >
                {loadingDelete ? (<><Spinner animation="border" size="sm" /> Eliminando...</>) : ( 'Eliminar' )}
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </>
  );
}

export default Visits;