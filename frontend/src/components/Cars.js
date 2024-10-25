import React, { useState, useEffect } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Cars.css';

function Cars() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);

  // Función para obtener carros
  const fetchCars = async () => {
    try {
      const response = await fetch('https://8whj3n8d29.execute-api.us-east-2.amazonaws.com/get/getCars', {
        method: 'POST',
        body: JSON.stringify({
          matricula: '*',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      // Verifica la respuesta
      console.log(data); // Para depuración
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

  const handleClick = () => {
    navigate('/RegisterCars'); // Redirige a la página de registro de vehículos
  };

  return (
    <div className='carsClass'>
      <Container className='cars-container'>
        <div className="title-and-button">
          <h2>Vehículos Registrados</h2>
          <Button variant="primary" onClick={handleClick} className="register-button">
            Registrar nuevo automóvil
          </Button>
        </div>
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>DPI</th>
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
                    src={car.imagenPlaca}
                    alt="Fotografía del carro"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                </td>
                <td>
                  <Button className='editarButton' onClick={() => handleClick()}>Editar</Button>{' '}
                  <Button className='eliminarButton'>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </div>
  );
}

export default Cars;