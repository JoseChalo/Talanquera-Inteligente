import React, { useState, useEffect } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Residents.css';

function Residents() {
  const navigate = useNavigate();
  const [residents, setResidents] = useState([]);

  // Función para obtener residentes
  const fetchResidents = async () => {
    try {
      const response = await fetch('https://z6p60yenfa.execute-api.us-east-2.amazonaws.com/getDataBase/getAllResidents', {
        method: 'POST',
        body: JSON.stringify({
          DPI: '*',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
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

  return (
    <div className='residentClass'>
      <Container className='resident-container'>
        <div className="title-and-button">
          <h2>Residentes Registrados</h2>
          <Button variant="primary" onClick={handleClick} className="register-button">Registrar nuevo residente</Button>
        </div>
        <Table striped bordered hover className='tableColor'>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DPI</th>
              <th>Teléfono</th>
              <th>Número de casa</th>
              <th>Fotografía</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((resident, index) => (
              <tr key={index}>
                <td>{resident.nombre}</td>
                <td>{resident.dpi}</td>
                <td>{resident.numTelefono}</td>
                <td>{resident.numVivienda}</td>
                <td>
                  <img 
                    src={resident.data_Biometrico} 
                    alt="Fotografía del residente" 
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                  />
                </td>
                <td>
                  <Button className='editarButton' onClick={handleClick}>Editar</Button>{' '}
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

export default Residents;