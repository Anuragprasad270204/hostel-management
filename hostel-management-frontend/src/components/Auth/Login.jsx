// src/components/Auth/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed.');
      }

      const data = await response.json();

      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userId', data.user.id);

      // alert('Login successful! You are now logged in.'); // Re-enable if you want this alert

      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/login');
        setError('Login successful, but unknown role. Please contact support.');
      }
    } catch (err) {
      console.error('Login error:', err.message);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow-lg p-3" style={{ width: '25rem' }}>
        <div className="card-body">
          <h2 className="text-center mb-4">Login</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger text-center">{error}</div>}

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter email"
                required
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                required
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-3">
              Login
            </button>
          </form>
          <div className="text-center mt-3">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;