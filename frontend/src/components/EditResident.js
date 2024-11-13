import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/RegisterResident.css';
import CustomNavbar from './Navbar';

function EditResident() {
  const [name, setName] = useState('');
  const [dpi, setDpi] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState(null);
  const [numHome, setNumHome] = useState('');
  const [cluster, setCluster] = useState('');
  const [password, setPassword] = useState('');
  const [clusters, setClusters] = useState([]);
  const [houses, setHouses] = useState([]);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const resident = location.state?.resident;
  const [loading, setLoading] = useState(false);

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

  // Obtener los datos del residente actual al cargar la página
  useEffect(() => {
    if (resident) {
      setName(resident.nombre || '');
      setDpi(resident.dpi || '');
      setPhone(resident.numTelefono || '');
      setNumHome(resident.numCasa || '');
      setCluster(resident.cluster || '');
      setPassword(resident.contra || '');
      setImage(resident.datoBiometrico || null);
    }
  }, [resident]);

  // Iniciar la cámara
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
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
    canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        setImage(reader.result);
      };
    }, 'image/jpeg');
  };

  const updateResident = async () => {
    if (image) {
      setLoading(true);
      try {
        const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/updateResident', {
          method: 'POST',
          body: JSON.stringify({
            nombre: name,
            DPI: dpi,
            telefono: phone,
            numHome: numHome,
            cluster: cluster,
            image: image,
            contra: password
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.message === "Datos actualizados exitosamente.") {
          alert("Residente actualizado con éxito.");
          navigate('/Residents');
        }
      } catch (error) {
        console.error('Error al actualizar los datos del residente:', error);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Toma la foto antes de continuar con la actualización.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !dpi || !phone || !numHome || !cluster) {
      alert('Por favor completa todos los campos.');
      return;
    }
    updateResident();
  };

  return (
    <>
      <CustomNavbar></CustomNavbar>
      <div className='registerResident'>
        <Container className='register-resident-container'>
          <h2 className='register-title'>Editar Residente</h2>
          <div className="form-camera-container">
            <Form onSubmit={handleSubmit} className="form-column form-spacing">
              <Form.Group controlId="formName">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingresa el nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formDpi" className="formMargin">
                <Form.Label>DPI</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingresa el DPI"
                  value={dpi}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 4) value = value.replace(/^(\d{4})(\d)/, '$1 $2');
                    if (value.length > 9) value = value.replace(/^(\d{4}) (\d{5})(\d)/, '$1 $2 $3');
                    setDpi(value);
                  }}
                  maxLength={15}
                  readOnly
                  required
                />
              </Form.Group>

              <Form.Group controlId="formPhone" className="formMargin">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingresa el teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formCluster" className="formMargin">
                <Form.Label>Nombre del cluster</Form.Label>
                <Form.Control
                  as="select"
                  value={cluster}
                  onChange={(e) => setCluster(e.target.value)}
                  required
                >
                  <option value="">Selecciona un cluster</option>
                  {clusters.map((clusterItem, index) => (
                    <option key={index} value={clusterItem}>{clusterItem}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formCasa" className="formMargin">
                <Form.Label>Número de casa</Form.Label>
                <Form.Control
                  as="select"
                  value={numHome}
                  onChange={(e) => setNumHome(e.target.value)}
                  required
                >
                  <option value="">Selecciona un número de casa</option>
                  {houses.map((house, index) => (
                    <option key={index} value={house}>{house}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formPassword" className="formMargin">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Ingresa la contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button className="custom-button" type="submit" disabled={loading}>
                {loading ? (<> <Spinner animation="border" size="sm" /> Cargando...</>) : ('Actualizar')}
              </Button>
              
            </Form>

            <div className="camera-column">
              <Form.Label>Fotografía</Form.Label>
              <video ref={videoRef} autoPlay className="video-feed" />
              <Button variant="success" onClick={captureImage} className="capture-button">
                Tomar Foto
              </Button>
              {image && <img src={image} alt="Captura" className="captured-image" />}
            </div>
          </div>
        </Container>
      </div>    
    </>
  );
}

export default EditResident;