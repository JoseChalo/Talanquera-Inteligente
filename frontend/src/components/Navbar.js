import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

function CustomNavbar() {
  const navigate = useNavigate();

  const Logout = () => {
    const handleLogout = () => {
      localStorage.removeItem('user'); // Elimina el usuario de localStorage
      navigate('/login'); // Redirige al login
    };
  
    return (
      <button onClick={handleLogout}>Cerrar sesión</button>
    );
  };


  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container>
        <Navbar.Brand href="/" className="navbar-brand">
          Inicio
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/residents" className="navbar-link">Residentes</Nav.Link>
            <Nav.Link href="/visits" className="navbar-link">Visitas</Nav.Link>
            <Nav.Link href="/cars" className="navbar-link">Vehículos</Nav.Link>
            {/*<Nav.Link href="/camara" className="navbar-link">Prueba camara</Nav.Link>*/}
            
            {/* Verifica si el usuario está autenticado para mostrar el botón de Logout */}
            {user && (
              <Button onClick={Logout} variant="outline-light" className="navbar-link">
                Logout
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
