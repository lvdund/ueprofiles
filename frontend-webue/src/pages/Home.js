import React from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center mb-4">
        <Col md={8}>
          <div className="p-5 mb-4 bg-light rounded-3">
            <h1 className="display-5 fw-bold">Welcome to the WebConsole UE</h1>
            <p className="col-md-8 fs-4">Manage your UE Profiles efficiently and safely.</p>
            <div className="d-flex gap-3">
              <Button variant="primary" as={Link} to="/register">Start</Button>
              <Button variant="outline-secondary" as={Link} to="/login">Login</Button>
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Authorized by Ho Tuan Tu - HUST</Card.Title>
              <Card.Text>
                Collaborate with the ETRIB5GC in Korea.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Friendly Interface</Card.Title>
              <Card.Text>
              Navigate through your profiles easily with user-friendly design.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Comprehensive Features</Card.Title>
              <Card.Text>
              Access a variety of tools to seamlessly create, update, and delete UE Profiles.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
