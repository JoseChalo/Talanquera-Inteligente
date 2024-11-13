import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import './styles/RekognitionConfig.css';
import CustomNavbar from './components/Navbar';

const EditRekognition = () => {
  const [faceList, setFaceList] = useState([]);

  const showListFaces = async () => {
    try {
      const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/functions', {
        method: 'POST',
        body: JSON.stringify({ numFunction: 1 }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setFaceList(data.faceList || []);
      console.log('Respuesta del servidor:', data);
    } catch (error) {
      console.error('Error con la petición:', error);
    }
  };

  const deleteRekognition = async () => {
    try {
      const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/functions', {
        method: 'POST',
        body: JSON.stringify({ numFunction: 2 }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      alert('Reconocimientos Eliminados.');
    } catch (error) {
      console.error('Error con la petición:', error);
    }
  };

  const createRekognition = async () => {
    try {
      const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/functions', {
        method: 'POST',
        body: JSON.stringify({ numFunction: 3 }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      alert('Reconocimientos creados.');
    } catch (error) {
      console.error('Error con la petición:', error);
    }
  };

  return (
    <>
      <CustomNavbar />
      <div className="Rekognition">
        <Button className="buttonTestFetch" onClick={showListFaces}>
          Ver listado de reconocimiento de Rekognition
        </Button>
        <Button className="buttonTestFetch" onClick={deleteRekognition}>
          Eliminar reconocimiento de Rekognition
        </Button>
        <Button className="buttonTestFetch" onClick={createRekognition}>
          Crear reconocimiento de Rekognition
        </Button>

        {faceList.length > 0 && (
          <div className="faceListTable">
            <h2>Listado de Rostros en Rekognition</h2>
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>DPI</th>
                  <th>Face ID</th>
                </tr>
              </thead>
              <tbody>
                {faceList.map((face, index) => {
                  const [name, dpi] = face.ExternalImageId.split('_').map((part) => part.split(':')[1]);
                  return (
                    <tr key={index}>
                      <td>{name}</td>
                      <td>{dpi}</td>
                      <td>{face.FaceId}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
};

export default EditRekognition;