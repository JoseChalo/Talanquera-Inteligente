import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import '../styles/Navbar.css';

function CustomNavbar() {
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
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;