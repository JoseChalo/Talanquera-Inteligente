import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Houses.css';
import CustomNavbar from './Navbar';

function Houses() {
  const navigate = useNavigate();
  const [houses, setHouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [houseToDelete, setHouseToDelete] = useState(null);

  // Función para obtener casas cambiar url
  const fetchHouses = async () => {
    try {
      const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/getHomes', {
        method: 'POST',
        body: JSON.stringify({
          opcionSearch: 'AllHomes',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data && data.data) {
        setHouses(data.data);
      } else {
        console.error('No se encontraron datos en la respuesta:', data);
      }
    } catch (error) {
      console.error('Error al obtener casas:', error);
    }
  };

  // Obtener casas al cargar el componente
  useEffect(() => {
    fetchHouses();
  }, []);

  const newHouse = () => {
    navigate('/RegisterHouses');
  };

  const handleClick = (house) => {
    navigate('/EditHouses', { state: { house } });
  };

  const handleDeleteClick = (house) => {
    setHouseToDelete(house);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (houseToDelete) {
      try {
        const response = await fetch('https://api-url/deleteHouse', {
          method: 'POST',
          body: JSON.stringify({ 
            numeroCasa: houseToDelete.numeroCasa,
            DPI: houseToDelete.idPropietario
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          await fetchHouses();
          setShowModal(false);
        } else {
          console.error('Error al eliminar casa:', response.statusText);
          alert('Error al eliminar casa: ' + response.statusText);
        }
      } catch (error) {
        console.error('Error al eliminar casa:', error);
        alert('Error al eliminar casa: ' + error.message);
      }
    }
  };

  return (
    <>
      <CustomNavbar />
      <div className='housesClass'>
        <Container className='houses-container'>
          <div className="title-and-button">
            <h2>Casas Registradas</h2>
            <Button variant="primary" onClick={newHouse} className="register-button">
              Registrar nueva casa
            </Button>
          </div>
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>DPI del propietario</th>
                <th>Nombre del propietario</th>
                <th>Número de casa</th>
                <th>Cluster</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {houses.map((house, index) => (
                <tr key={index}>
                  <td>{house.dpi}</td>
                  <td>{house.nombre}</td>
                  <td>{house.numCasa}</td>
                  <td>{house.cluster}</td>
                  <td>
                    <Button className='editarButton' onClick={() => handleClick(house)}>Editar</Button>{' '}
                    <Button className='eliminarButton' onClick={() => handleDeleteClick(house)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Modal de confirmación de eliminación */}
          <Modal show={showModal} onHide={() => setShowModal(false)} className="dark-modal">
            <Modal.Header closeButton>
              <Modal.Title>Confirmación de Eliminación</Modal.Title>
            </Modal.Header>
            <Modal.Body>¿Estás seguro de que deseas eliminar la casa número {houseToDelete?.numeroCasa}?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Eliminar
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </>
  );
}

export default Houses;