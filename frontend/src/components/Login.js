import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useAuth } from '../dataLogin';
import '../styles/Login.css';

const LoginPage = () => {
  const [dpi, setDpi] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();


  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      if (user.role === 'admin' || user.role === 'garita') {
        navigate('/camara', { replace: true });
      } else if (user.role === 'residente') {
        navigate('/visits', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/getUsers', {
        method: 'POST',
        body: JSON.stringify({ DPI: dpi, contra: password }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data && data.userDPI) {
        const user = { 
          user: data.userDPI, 
          role: data.rol 
        };
        localStorage.setItem('user', JSON.stringify(user));
        login(data.userDPI, data.rol);
        user.role === 'admin' || user.role === 'garita' ? navigate('/camara') : navigate('/visits');
      } else {
        alert(data.message);
        navigate('/');
      }
    } catch (error) {
      console.error('Error al obtener datos de usuario:', error);
      alert('Ocurrió un error. Intenta de nuevo.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <div className="h" />
      </div>
      <Form className="login-form" onSubmit={handleLogin}>
        <h3 className="inicio">Iniciar Sesión</h3>
        <Form.Group className="mb-3" controlId="formBasicDPI">
          <Form.Label>DPI</Form.Label>
          <Form.Control
            type="text"
            value={dpi}
            onChange={(e) => setDpi(e.target.value)}
            placeholder="Ingresa tu DPI"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
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

export default LoginPage;





/* import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Importamos el AuthContext

const Login = () => {
  const [dpi, setDpiInput] = useState(''); // Almacenamos el DPI del usuario
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setIsAuthenticated, setDpi } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulación de verificación del DPI y la contraseña
    if (dpi === '1' && password === 'p') {  // Simula la validación
      // Establecemos el estado de autenticación
      setIsAuthenticated(true);
      setDpi(dpi);  // Almacenamos el DPI en el contexto

      // Redirigir al usuario a la página protegida (Home)
      navigate('/home');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={dpi}
          onChange={(e) => setDpiInput(e.target.value)}  // Actualizamos el estado de DPI
          placeholder="DPI"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default Login; */