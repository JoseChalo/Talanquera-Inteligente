import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useAuth } from '../dataLogin';

const LoginPage = () => {
  const [dpi, setDpi] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Intentando acceder datos de usuario');
    try {
      const response = await fetch('https://ipx89knqqf.execute-api.us-east-2.amazonaws.com/getUsers', {
        method: 'POST',
        body: JSON.stringify({
          DPI: dpi,
          contra: password
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data && data.userDPI) {
        const user = { 
          user: data.userDPI, 
          role: data.rol 
        };

        // Guardamos el usuario en localStorage
        localStorage.setItem('user', JSON.stringify(user));
        login(data.userDPI, data.rol);

        // Redirigir inmediatamente después de guardar en localStorage
        if(user.role === 'admin' || user.role === 'garita'){
          navigate('/camara');
        } else if (user.role === 'residente') {
          navigate('/visits');
        } else {
          navigate('/');
        }
        
      } else {
        alert(data.message);
        navigate('/');
      }
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
      alert('Ocurrió un error. Intenta de nuevo.');
    }
  };

  return (
    <Form onSubmit={handleLogin}>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>DPI user</Form.Label>
        <Form.Control type="text" value={dpi} onChange={(e) => setDpi(e.target.value)} placeholder="Ingresa tu DPI" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      </Form.Group>
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
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