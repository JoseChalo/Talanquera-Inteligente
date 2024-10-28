import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Cars.css';

function Cars() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);

  // Función para obtener carros
  const fetchCars = async () => {
    try {
      const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/getCars', {
        method: 'POST',
        body: JSON.stringify({
          matricula: '*',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data && data.data) {
        setCars(data.data);
      } else {
        console.error('No se encontraron datos en la respuesta:', data);
      }
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
    }
  };

  // Obtener carros al cargar el componente
  useEffect(() => {
    fetchCars();
  }, []);

  const newCar = () => {
    navigate('/RegisterCars');
  };

  const handleClick = (car) => {
    navigate('/EditCars', { state: { car } });
  };

  const handleDeleteClick = (car) => {
    setCarToDelete(car);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (carToDelete) {
      try {
        const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/deleteCar', {
          method: 'POST',
          body: JSON.stringify({ 
            matricula: carToDelete.matricula,
            DPI: carToDelete.idResidente
           }),
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          // Actualizar la lista de vehículos después de la eliminación
          await fetchCars();
          setShowModal(false); // Cerrar el modal después de actualizar la lista
        } else {
          console.error('Error al eliminar vehículo:', response.statusText);
          alert('Error al eliminar vehículo: ' + response.statusText);
        }
      } catch (error) {
        console.error('Error al eliminar vehículo:', error);
        alert('Error al eliminar vehículo: ' + error.message);
      }
    }
  };

  return (
    <div className='carsClass'>
      <Container className='cars-container'>
        <div className="title-and-button">
          <h2>Vehículos Registrados</h2>
          <Button variant="primary" onClick={newCar} className="register-button">
            Registrar nuevo automóvil
          </Button>
        </div>
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>DPI del propietario</th>
              <th>Modelo</th>
              <th>Color</th>
              <th>Matrícula</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, index) => (
              <tr key={index}>
                <td>{car.idResidente}</td>
                <td>{car.modelo}</td>
                <td>{car.color}</td>
                <td>
                  <img
                    src={car.credencialesVehiculo}
                    alt="Fotografía del carro"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                </td>
                <td>
                  <Button className='editarButton' onClick={() => handleClick(car)}>Editar</Button>{' '}
                  <Button className='eliminarButton' onClick={() => handleDeleteClick(car)}>Eliminar</Button>
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
          <Modal.Body>¿Estás seguro de que deseas eliminar el vehículo con matrícula {carToDelete?.matricula}?</Modal.Body>
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
  );
}

export default Cars;
