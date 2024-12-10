import React, { useState } from 'react';
import axios from '../../api';

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
      setMessage('Registration successful! Please log in.');
      setFormData({ username: '', password: '' });
    } catch (error) {
      setMessage(error.response.data.error || 'Registration failed.');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <p style={{ color: 'green' }}>{message}</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
