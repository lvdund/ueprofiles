import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import UEProfileList from '../components/UEProfiles/UEProfileList';

function Dashboard() {
  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <h1 className="mb-4">Dashboard</h1>
          <UEProfileList />
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
