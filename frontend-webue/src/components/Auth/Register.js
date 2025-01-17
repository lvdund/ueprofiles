import React, { useState } from 'react';
import axios from '../../api';
import { Form, Button, Alert, Card, Container } from 'react-bootstrap';
import { toast } from 'react-toastify'; 

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/register', formData);
      setMessage('Register successfully! Please login.');
      setFormData({ username: '', password: '' });
      toast.success('Register successfully! Please login.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Register Failed.');
      toast.error(error.response?.data?.error || 'Register Failed.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <Card.Title className="mb-4">Register</Card.Title>
          {message && <Alert variant={message.includes('thành công') ? 'success' : 'danger'}>{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="username" className="mb-3">
              <Form.Label>Username:</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter the username"
              />
            </Form.Group>
            <Form.Group controlId="password" className="mb-4">
              <Form.Label>Password:</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter the password"
              />
            </Form.Group>
            <Button variant="success" type="submit" className="w-100">
              Register
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Register;
