import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterVisits.css'; 
import CustomNavbar from './Navbar';

function RegisterVisits() {
  const [dpiVisita, setDpiVisita] = useState('');
  const [nombreVisita, setNombreVisita] = useState('');
  const [dpiResidente, setDpiResidente] = useState('');
  const [clusterDestino, setClusterDestino] = useState('');
  const [numViviendaDestino, setNumViviendaDestino] = useState('');
  const [metodoIngreso, setMetodoIngreso] = useState('Peatonal');
  const [datoBiometrico, setDatoBiometrico] = useState(null);
  const [numIngresos, setNumIngresos] = useState(1);
  const [role, setRole] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [clusters, setClusters] = useState([]);
  const [houses, setHouses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomes = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (storedUser && storedUser.role) {
          let dpiValue;
          if (storedUser.role === 'admin') {
            dpiValue = null;
            setRole(true);
          } else {
            dpiValue = storedUser.user;
            setDpiResidente(dpiValue);
            setRole(false);
          }

          const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/getHomes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              opcionSearch: 'AllHomes',
              dpiSeacrh: dpiValue
            }),
          });

          const data = await response.json();
          if (response.status === 200) {
            const clustersData = [];
            const housesData = [];

            data.data.forEach(item => {
              if (item.cluster && !clustersData.includes(item.cluster)) {
                clustersData.push(item.cluster);
              }
              if (item.numCasa && !housesData.includes(item.numCasa)) {
                housesData.push(item.numCasa);
              }
            });

            setClusters(clustersData);
            setHouses(housesData);
          } else {
            console.error('Error al obtener los datos de casas:', data.message);
          }
        } else {
          console.error("No se encontró un usuario en localStorage o el objeto es inválido.");
          navigate('/login');
        }
      } catch (error) {
        console.error('Error al realizar la solicitud a Lambda:', error);
      }
    };

    fetchHomes();
  }, [navigate]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
  
        return () => {
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (error) {
        console.error("Error al acceder a la cámara:", error);
      }
    };
  
    startCamera();
  }, []);

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    setDatoBiometrico(imageData);
  };

  const newVisit = async () => {
    if (datoBiometrico) {
      setLoading(true);
      try {
        const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/saveVisit', {
          method: 'POST',
          body: JSON.stringify({ 
            dpiVisita,
            nombreVisita: nombreVisita,
            dpiResidente,
            clusterDestino,
            numViviendaDestino,
            metodoIngreso,
            datoBiometrico: datoBiometrico,
            numIngresos
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        alert(data.message);
        if(!data.error) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error('Error al registrar la visita:', error);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Por favor captura la imagen antes de continuar.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dpiVisita || !dpiResidente || !clusterDestino || !numViviendaDestino || !metodoIngreso || !numIngresos) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    newVisit().then((finalizado) => {
      if(finalizado){
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        navigate('/Visits');
      }
    });
  };

  return (
    <>
      <CustomNavbar></CustomNavbar>
      <div className='registerVisit'>
        <Container className='register-visit-container'>
          <h2 className="register-title">Registrar Nueva Visita</h2>
          <div className="form-camera-container">
            <Form onSubmit={handleSubmit} className="form-column">

              <Form.Group controlId="formDpiVisita">
                <Form.Label>DPI de la Visita</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingresa el DPI de la visita"
                  value={dpiVisita}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, ''); 
                    if (value.length > 4) {
                      value = value.replace(/^(\d{4})(\d)/, '$1 $2');
                    }
                    if (value.length > 9) {
                      value = value.replace(/^(\d{4}) (\d{5})(\d)/, '$1 $2 $3');
                    }
                    setDpiVisita(value);
                  }}
                  maxLength={15}
                  required
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
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, ''); 
                    if (value.length > 4) {
                      value = value.replace(/^(\d{4})(\d)/, '$1 $2');
                    }
                    if (value.length > 9) {
                      value = value.replace(/^(\d{4}) (\d{5})(\d)/, '$1 $2 $3');
                    }
                    setDpiResidente(value);
                  }}
                  maxLength={15}
                  required
                  readOnly={!role}
                />
              </Form.Group>


              <Form.Group controlId="formClusterDestino" className="formMargin">
                <Form.Label>Cluster Destino</Form.Label>
                <Form.Control
                  as="select"
                  value={clusterDestino}
                  onChange={(e) => setClusterDestino(e.target.value)}
                  required
                >
                  <option value="">Selecciona un cluster</option>
                  {clusters.map((cluster, index) => (
                    <option key={index} value={cluster}>{cluster}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formNumViviendaDestino" className="formMargin">
                <Form.Label>Número de Vivienda Destino</Form.Label>
                <Form.Control
                  as="select"
                  value={numViviendaDestino}
                  onChange={(e) => setNumViviendaDestino(e.target.value)}
                  required
                >
                  <option value="">Selecciona un número de vivienda</option>
                  {houses.map((house, index) => (
                    <option key={index} value={house}>{house}</option>
                  ))}
                </Form.Control>
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
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value)) {
                      setNumIngresos(value % 2 === 0 ? value : value + 1);
                    }
                  }}
                  required
                />
              </Form.Group>

              <Button className="custom-button" type="submit" disabled={loading}>
                {loading ? (<> <Spinner animation="border" size="sm" /> Cargando...</>) : ('Registrar')}
              </Button>
            </Form>

            <div className="camera-column">
              <Form.Label>Fotografía</Form.Label>
              <video ref={videoRef} autoPlay className="video-feed" />
              <Button variant="success" onClick={captureImage} className="capture-button">
                Tomar Foto
              </Button>
              {datoBiometrico && <img src={datoBiometrico} alt="Captura" className="captured-image" />}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}

export default RegisterVisits;