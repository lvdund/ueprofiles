import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken, removeToken } from '../utils/auth';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import axios from '../api';
import { toast } from 'react-toastify'; 

function AppNavbar() {
  const navigate = useNavigate();
  const token = getToken();

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      removeToken();
      toast.success('Logout Successfully!');
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
      toast.error('Logout failed.');
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">WebConsole UE</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {token && <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>}
          </Nav>
          <Nav>
            {token ? (
              <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
            ) : (
              <>
                <Button variant="outline-light" as={Link} to="/login" className="me-2">Login</Button>
                <Button variant="outline-light" as={Link} to="/register">Register</Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
