import React, { useContext, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../stylesCSS/Login.css';
import logo from '../TalanqueraIcono.svg';
import { dpiUser } from './dpiUserContext.js';
import ipConfig from '../ipConfig.js';

const Login = () => {
  const [dpi, setDpi] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setDpiCurrent } = useContext(dpiUser);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(`${ipConfig.API_BASE_URL}/user/${dpi}`); // Usa la URL de configuración
      const userData = response.data[0];

      if (userData && userData.contra === password) {
        console.log('Inicio de sesión exitoso');

        // Almacenar el token de autenticación en localStorage
        localStorage.setItem('authToken', 'your-auth-token');

        // Navegar a la página protegida
        setDpiCurrent(dpi);
        navigate('/home');
      } else {
        alert('Contraseña incorrecta');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          alert('Usuario no encontrado');
        } else {
          alert(`Error: ${error.response.data}`);
        }
      } else {
        console.error('Error en la solicitud:', error.message);
        alert('Error al iniciar sesión');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src={logo} alt="Talanquera Logo" className="logo" />
      </div>
      <Form className="login-form" onSubmit={handleSubmit}>
        <h3 className="inicio">Iniciar Sesión</h3>

        <Form.Group className="mb-3 inline-form-group1" controlId="formBasicUser">
          <Form.Label>Dpi</Form.Label>
          <Form.Control
            type="email"
            placeholder="Correo electrónico"
            value={dpi}
            onChange={(e) => setDpi(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3 inline-form-group2" controlId="formBasicPassword">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <div className="button-container">
          <Button type="submit" className="login-btn buttonColor">
            Ingresar
          </Button>
        </div>

      </Form>
    </div>
  );
};

export default Login;