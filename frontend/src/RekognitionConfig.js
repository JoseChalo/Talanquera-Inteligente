import React, { useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import './styles/RekognitionConfig.css';
import CustomNavbar from './components/Navbar';

const CameraCapture = () => {
  const videoRef = useRef(null);
  const [image, setImage] = useState(null);

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

  /*const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;

    // Iniciar la captura automática de imágenes
    const intervalId = setInterval(captureImage, 5000); // Captura cada 5 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  };*/

  


  // getHomes ----->>>>> https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/getHomes
  const testFetch = async () => {
    await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/functions', {
      method: 'POST',
      body: JSON.stringify({ 
        dpiVisita: "2675 88259 0101",
        nombreVisita: "Alejandra Nazareth",
        dpiResidente: "3826 20704 0101",
        clusterDestino: "Alamos",
        numViviendaDestino: "1",
        metodoIngreso: "Peatonal",
        datoBiometrico: image,
        matriculaVehiculo: ' ',
        numIngresos: "4",


        opcionSearch: 'AllHomes',

        DPI: '*'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Respuesta del servidor:', data);
      })
      .catch((error) => {
        console.error('Error con la peticion:', error);
      });
  };

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');

    // Enviar la imagen al servidor EC2
    /*fetch('https://z6p60yenfa.execute-api.us-east-2.amazonaws.com/getAllResidents/getAllResidents', {
      method: 'POST',
      body: JSON.stringify({ image: imageData }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Respuesta del servidor:', data);
      })
      .catch((error) => {
        console.error('Error al enviar la imagen:', error);
      });*/

    setImage(imageData);
  };

  return (
    <>
      <CustomNavbar></CustomNavbar>
      <div className='Rekognition'>
        <video ref={videoRef} autoPlay />
        {image && <img src={image} alt="captura" />}
        <Button className='buttonTestFetch' type="submit" onClick={testFetch}>
          testFetch
        </Button>
        <Button className='buttonCaptureImage' type="submit" onClick={captureImage}>
          captureImage
        </Button>
        <Button className='buttonStartCamera' type="submit" onClick={startCamera}>
          startCamera
        </Button>
      </div>
    </>
  );
};

export default CameraCapture;


// GetAllCars: https://8whj3n8d29.execute-api.us-east-2.amazonaws.com/get/getCars
// UpdateResidents: https://4wufzl5q64.execute-api.us-east-2.amazonaws.com/update/updateResident
// Delete Resident: https://xshjpzgyh0.execute-api.us-east-2.amazonaws.com/delete/deleteResident