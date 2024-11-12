import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterResident.css'; 
import CustomNavbar from './Navbar';

function RegisterResident() {
  const [name, setName] = useState('');
  const [dpi, setDpi] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState(null);
  const [numHome, setNumHome] = useState('');
  const [nameCluster, setCluster] = useState('');
  const [password, setPassword] = useState('');
  const [clusters, setClusters] = useState([]);
  const [houses, setHouses] = useState([]);
  const videoRef = useRef(null);
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

  const newResident = async () => {
    if (image) {
      try {
        const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/saveResident', {
          method: 'POST',
          body: JSON.stringify({ 
            image: image,
            name: name,
            DPI: dpi,
            phone: phone,
            numHome: numHome,
            cluster: nameCluster,
            contra: password,
            S3_BUCKET_NAME: "imagenes-talanquera-inteligente"
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if(data.error === "Ya existe un residente con ese DPI."){
          alert("Ya existe un residente con ese DPI.");
        }
        console.log('Respuesta del servidor:', data);
      } catch (error) {
        console.error('Error al enviar la imagen:', error);
      }
    } else {
      alert('Toma la foto antes de seguir con el registro.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !dpi || !phone || !numHome || !nameCluster || !password) {
      alert('Por favor completa todos los campos.');
      return;
    }

    newResident().then(() => {
      navigate('/Residents');
    });
  };

  return (
    <>
      <CustomNavbar></CustomNavbar>
      <div className='registerResident'> 
        <Container className='register-resident-container'>
          <h2 className='register-title'>Registrar Nuevo Residente</h2>
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
                    if (value.length > 4) {
                      value = value.replace(/^(\d{4})(\d)/, '$1 $2');
                    }
                    if (value.length > 9) {
                      value = value.replace(/^(\d{4}) (\d{5})(\d)/, '$1 $2 $3');
                    }
                    setDpi(value);
                  }}
                  maxLength={15}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formPhone" className="formMargin">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingresa el teléfono"
                  value={phone}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    
                    if (value.length > 8) {
                      value = value.slice(0, 8);
                    }

                    setPhone(value);
                  }}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formCluster" className="formMargin">
                <Form.Label>Nombre del cluster</Form.Label>
                <Form.Control
                  as="select"
                  className="select-css"
                  value={nameCluster}
                  onChange={(e) => setCluster(e.target.value)}
                  required
                >
                  <option value="">Selecciona un cluster</option>
                  {clusters.map((cluster, index) => (
                    <option key={index} value={cluster}>{cluster}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formCasa" className="formMargin">
                <Form.Label>Número de casa</Form.Label>
                <Form.Control
                  as="select"
                  className="select-css"
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

              <Button className="custom-button" type="submit">
                Registrar
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

export default RegisterResident;