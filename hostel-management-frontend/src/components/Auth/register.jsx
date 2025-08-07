// src/components/Auth/register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed.');
      }

      const data = await response.json();

      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userEmail', data.user.email); 

      setSuccess('Registration successful! You are now logged in.');
      if (data.user.role === 'student') {
        const profileCheckResponse = await fetch('http://localhost:5000/api/student-profiles/me', {
            headers: { 'Authorization': `Bearer ${data.token}` }
        });

        if (profileCheckResponse.status === 404) { 
            localStorage.removeItem('studentId'); 
            navigate('/student/complete-profile'); 
        } else if (!profileCheckResponse.ok) {
            const profileErrorData = await profileCheckResponse.json();
            setError(profileErrorData.message || 'Failed to verify profile status.');
         
        } else {
            const profileData = await profileCheckResponse.json();
            localStorage.setItem('studentId', profileData._id); 
            navigate('/student/dashboard'); 
        }
      } else { 
        navigate('/admin/dashboard');
      }

    } catch (err) {
      console.error('Registration Error:', err.message);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow-lg p-3" style={{ width: '25rem' }}>
        <div className="card-body">
          <h2 className="text-center mb-4">Register</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger text-center">{error}</div>}
            {success && <div className="alert alert-success text-center">{success}</div>}

            <div className="mb-3">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input
                type="text"
                id="fullName"
                placeholder="Enter full name"
                required
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

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

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm Password"
                required
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Role selection for registration */}
            <div className="mb-3">
              <label htmlFor="roleSelect" className="form-label">Register As:</label>
              <select
                id="roleSelect"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" className="btn btn-success w-100 mt-3">Register</button>
          </form>
          <div className="text-center mt-3">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;