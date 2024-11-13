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
  const videoRef = useRef(null);
  const { userDPI, } = JSON.parse(localStorage.getItem('user'));
  const [loading, setLoading] = useState(false);
  const [clusters, setClusters] = useState([]);
  const [houses, setHouses] = useState([]);
  const navigate = useNavigate();


  // Cargar clusters y casas desde Lambda
  useEffect(() => {
    const fetchHomes = async () => {
      try {
        const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/getHomes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            opcionSearch: 'AllHomes',
          }),
        });

        const data = await response.json();
        if (response.status === 200) {
          const clustersData = [];
          const housesData = [];

          // Llenar los clusters y las casas
          data.data.forEach(item => {
            if (item.cluster && !clustersData.includes(item.cluster)) {
              clustersData.push(item.cluster); // Agregar clusters únicos
            }
            if (item.numCasa && !housesData.includes(item.numCasa)) {
              housesData.push(item.numCasa); // Agregar casas únicas
            }
          });

          setClusters(clustersData);
          setHouses(housesData);
        } else {
          console.error('Error al obtener los datos de casas:', data.message);
        }
      } catch (error) {
        console.error('Error al realizar la solicitud a Lambda:', error);
      }
    };

    fetchHomes();
  }, []);


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



  // Captura la imagen
  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    setDatoBiometrico(imageData);
  };

  // Función para registrar la visita
  const newVisit = async () => {
    if (datoBiometrico) {
      setLoading(true);
      try {
        const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/saveVisit', {
          method: 'POST',
          body: JSON.stringify({ 
            dpiVisita,
            nombreVisita,
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
        if (data.error === "Visita ya registrada.") {
          alert("La visita ya ha sido registrada.");
        } else {
          console.log('Respuesta del servidor:', data);
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

    newVisit().then(() => {
      navigate('/Visits');
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
                    // Par a impar
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