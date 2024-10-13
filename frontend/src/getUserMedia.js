import React, { useRef, useState } from 'react';

const CameraCapture = () => {
  const videoRef = useRef(null);
  const [image, setImage] = useState(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    setImage(canvas.toDataURL('image/jpeg'));
  };

  return (
    <div>
      <video ref={videoRef} autoPlay />
      <button onClick={startCamera}>Iniciar cámara</button>
      <button onClick={captureImage}>Capturar Imagen</button>
      {image && <img src={image} alt="captura" />}
    </div>
  );
};

export default CameraCapture;
