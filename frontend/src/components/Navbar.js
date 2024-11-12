import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { useAuth } from '../dataLogin';

function CustomNavbar() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [userDPI, setUserDPI] = useState('');
  const { logout } = useAuth(); 

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role) {
      setUserRole(user.role);
      setUserDPI(user.userDPI);
    }
  }, []);

  const Logout = () => {
    localStorage.removeItem('user');
    setUserRole('');
    setUserDPI('');
    logout();
    navigate('/');
  };

/*<Navbar.Brand href="/" className="navbar-brand">
  Inicio
</Navbar.Brand>*/
  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {userRole === 'admin' && (
              <>
                <Nav.Link href="/residents" className="navbar-link">Residentes</Nav.Link>
                <Nav.Link href="/visits" className="navbar-link">Visitas</Nav.Link>
                <Nav.Link href="/cars" className="navbar-link">Vehículos</Nav.Link>
              </>
            )}
            {userRole === 'garita' && (
              <Nav.Link href="/camara" className="navbar-link">Camara</Nav.Link>
            )}
            {userRole === 'residente' && (
              <Nav.Link href="/visits" className="navbar-link">Visitas</Nav.Link>
            )}

            <Button onClick={Logout} variant="outline-light" className="navbar-link">
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
