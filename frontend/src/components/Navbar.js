import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import '../styles/Navbar.css';
import { useAuth } from '../dataLogin';

function CustomNavbar() {
  const [userRole, setUserRole] = useState('');
  const { logout } = useAuth(); 

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role) {
      setUserRole(user.role);
    }
  }, []);

  const Logout = () => {
    localStorage.removeItem('user');
    setUserRole('');
    logout();
    window.location.replace('/');
  };

  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {userRole === 'admin' && (
              <>
                <Nav.Link href="/camara" className="navbar-inicio">Inicio</Nav.Link>
                <Nav.Link href="/residents" className="navbar-link">Residentes</Nav.Link>
                <Nav.Link href="/visits" className="navbar-link">Visitas</Nav.Link>
                <Nav.Link href="/cars" className="navbar-link">Vehículos</Nav.Link>
                <Nav.Link href="/houses" className="navbar-link">Casas</Nav.Link>
                <Nav.Link href="/RekognitionConfig" className="navbar-link">Rekognition</Nav.Link>
              </>
            )}
            {userRole === 'garita' && (
              <Nav.Link href="/camara" className="navbar-inicioG">Inicio</Nav.Link>
            )}
            {userRole === 'residente' && (
              <Nav.Link href="/visits" className="navbar-link">Visitas</Nav.Link>
            )}

            <Button onClick={Logout} className="navbar-button">
              Cerrar Sesión
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;