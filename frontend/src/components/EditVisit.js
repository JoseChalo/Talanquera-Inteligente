import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/RegisterVisits.css';
import CustomNavbar from './Navbar';

function EditVisit() {
  const [dpiVisita, setDpiVisita] = useState('');
  const [nombreVisita, setNombreVisita] = useState('');
  const [dpiResidente, setDpiResidente] = useState('');
  const [clusterDestino, setClusterDestino] = useState('');
  const [numViviendaDestino, setNumViviendaDestino] = useState('');
  const [metodoIngreso, setMetodoIngreso] = useState('Peatonal');
  const [datoBiometrico, setDatoBiometrico] = useState('No Foto');
  const [numIngresos, setNumIngresos] = useState(2);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  var visita = location.state?.visita;

  // Cargar datos de la visita al iniciar
  useEffect(() => {
    if (visita) {
      setDpiVisita(visita.dpiVisita || '');
      setNombreVisita(visita.nombreVisita || '');
      setDpiResidente(visita.dpiResidente || '');
      setClusterDestino(visita.cluster || '');
      setNumViviendaDestino(visita.numCasa || '');
      setMetodoIngreso(visita.metodoIngreso);
      setDatoBiometrico('No Foto');
      setNumIngresos(visita.numIngresos || 1);
    }
  }, [visita]);

  // Iniciar la cámara
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
  
        // Limpiar el stream al desmontar
        return () => {
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (error) {
        console.error("Error al acceder a la cámara:", error);
      }
    };
  
    startCamera();
  }, []);

  // Capturar la imagen
  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    setDatoBiometrico(imageData);
  };

  const updateVisit = async () => {
    if (datoBiometrico) {
      try {
        const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/editVisit', {
          method: 'POST',
          body: JSON.stringify({
            dpiVisita: dpiVisita,
            nombreVisita: nombreVisita,
            dpiResidente: dpiResidente,
            idViviendaDestino: numViviendaDestino,
            metodoIngreso: metodoIngreso,
            datoBiometrico: datoBiometrico,
            numIngresos: numIngresos,
            clusterDestino: clusterDestino,
            numViviendaDestino: numViviendaDestino,
            oldNameVisit: visita.nombreVisita,
            oldMetodoIngreso: visita.metodoIngreso
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        alert((await response.json()).message);
        navigate('/Visits');
      } catch (error) {
        console.error('Error al actualizar la visita:', error);
      }
    } else {
      alert('Toma la foto antes de continuar con la actualización.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dpiVisita || !nombreVisita || !dpiResidente || !numViviendaDestino) {
      alert('Por favor completa todos los campos.');
      return;
    }
    updateVisit();
  };

  return (
    <>
      <CustomNavbar></CustomNavbar>
      <div className='registerVisit'>
        <Container className='register-visit-container'>
          <h2 className='register-title'>Editar Visita</h2>
          <div className="form-camera-container">
            <Form onSubmit={handleSubmit} className="form-column">
              <Form.Group controlId="formDpiVisita">
                <Form.Label>DPI de la Visita</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingresa el DPI de la visita"
                  value={dpiVisita}
                  onChange={(e) => setDpiVisita(e.target.value)}
                  readOnly
                />
              </Form.Group>

              <Form.Group controlId="formNombreVisita" className="formMargin">
                <Form.Label>Nombre de la Visita</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingresa el nombre de la visita"
                  value={nombreVisita}
                  onChange={(e) => setNombreVisita(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formDpiResidente" className="formMargin">
                <Form.Label>DPI del Residente</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingresa el DPI del residente"
                  value={dpiResidente}
                  onChange={(e) => setDpiResidente(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formClusterDestino" className="formMargin">
                <Form.Label>Cluster Destino</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingresa el cluster destino"
                  value={clusterDestino}
                  onChange={(e) => setClusterDestino(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formNumViviendaDestino" className="formMargin">
                <Form.Label>Número de Vivienda Destino</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ingresa el número de vivienda destino"
                  value={numViviendaDestino}
                  onChange={(e) => setNumViviendaDestino(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formMetodoIngreso" className="formMargin">
                <Form.Label>Método de Ingreso</Form.Label>
                <Form.Control as="select" value={metodoIngreso} onChange={(e) => setMetodoIngreso(e.target.value)}>
                  <option value="Peatonal">Peatonal</option>
                  <option value="Vehicular">Vehicular</option>
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formNumIngresos" className="formMargin">
                <Form.Label>Número de Ingresos</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ingresa el número de ingresos"
                  value={numIngresos}
                  onChange={(e) => setNumIngresos(e.target.value)}
                  required
                />
              </Form.Group>

              <Button className="custom-button" type="submit">
                Actualizar
              </Button>
            </Form>

            <div className="camera-column">
              <Form.Label>Fotografía</Form.Label>
              <video ref={videoRef} autoPlay className="video-feed" />
              <Button variant="success" onClick={captureImage} className="capture-button">
                Tomar Foto
              </Button>
              <img src={datoBiometrico !== 'No Foto'? datoBiometrico : `${visita.datoBiometrico}?v=${Date.now()}`} alt="Captura" className="captured-image" />
            </div>
          </div>
        </Container>
      </div>   
    </>

  );
}

export default EditVisit;