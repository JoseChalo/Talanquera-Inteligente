import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Residents.css';
import CustomNavbar from './Navbar';

function Residents() {
  const navigate = useNavigate();
  const [residents, setResidents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Función para obtener residentes
  const fetchResidents = async () => {
    try {
      const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/getResidents', {
        method: 'POST',
        body: JSON.stringify({ DPI: '*' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setResidents(data.data);
    } catch (error) {
      console.error('Error al obtener residentes:', error);
    }
  };

  // Obtener residentes al cargar el componente
  useEffect(() => {
    fetchResidents();
  }, []);

  const handleClick = () => {
    navigate('/RegisterResident');
  };

  const handleEditClick = (resident) => {
    navigate('/editResident', { state: { resident } });
  };

  const handleDeleteClick = (resident) => {
    setResidentToDelete(resident);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (residentToDelete) {
      setLoadingDelete(true);
      try {
        const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/deleteResident', {
          method: 'POST',
          body: JSON.stringify({ DPI: residentToDelete.dpi }),
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          await fetchResidents();
          setShowModal(false);
        } else {
          console.error('Error al eliminar residente:', response.statusText);
        }
      } catch (error) {
        console.error('Error al eliminar residente:', error);
      } finally {
        setLoadingDelete(false);
      }
    }
  };

  return (
    <>
      <CustomNavbar></CustomNavbar>
      <div className='residentClass'>
        <Container className='resident-container'>
          <div className="title-and-button">
            <h2>Residentes Registrados</h2>
            <Button variant="primary" onClick={handleClick} className="register-button">Registrar nuevo residente</Button>
          </div>
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>DPI</th>
                <th>Teléfono</th>
                <th>Cluster</th>
                <th>Número de casa</th>
                <th>Fotografía</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {residents && residents.map((resident, index) => (
                <tr key={index}>
                  <td>{resident.nombre}</td>
                  <td>{resident.dpi}</td>
                  <td>{resident.numTelefono}</td>
                  <td>{resident.cluster}</td>
                  <td>{resident.numCasa}</td>
                  <td>
                    <img 
                      src={`${resident.datoBiometrico}?t=${Date.now()}`} 
                      alt="Fotografía del residente" 
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                    />
                  </td>
                  <td>
                    <Button className='editarButtonR' onClick={() => handleEditClick(resident)}>Editar</Button>
                    <Button className='eliminarButtonR' onClick={() => handleDeleteClick(resident)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Modal show={showModal} onHide={() => setShowModal(false)} className="dark-modal">
            <Modal.Header closeButton>
              <Modal.Title>Confirmación de Eliminación</Modal.Title>
            </Modal.Header>
            <Modal.Body>¿Estás seguro de que deseas eliminar a {residentToDelete?.nombre}?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
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

export default Residents;