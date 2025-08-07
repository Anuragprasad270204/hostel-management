// src/components/Auth/Login.jsx - WITH DEBUGGING LOGS (Re-provided)
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
      console.log('[Login] Attempting to log in with:', { email, password }); 
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('[Login] API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Login] API Error Response:', errorData);
        throw new Error(errorData.message || 'Login failed.');
      }

      const data = await response.json();
      console.log('[Login] API Success Data:', data); 
      console.log('[Login] Token from API:', data.token);
      console.log('[Login] User Role from API:', data.user.role);

      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userEmail', data.user.email);
      console.log('[Login] LocalStorage items set.');
      console.log('[Login] LocalStorage content after set:', localStorage.getItem('token'), localStorage.getItem('userRole'));

      if (data.user.role === 'student') {
        const profileCheckResponse = await fetch('http://localhost:5000/api/student-profiles/me', {
            headers: { 'Authorization': `Bearer ${data.token}` }
        });
        console.log('[Login] Profile check status:', profileCheckResponse.status);

        if (profileCheckResponse.status === 404) {
            localStorage.removeItem('studentId');
            console.log('[Login] Redirecting to complete profile.'); 
            navigate('/student/complete-profile');
        } else if (!profileCheckResponse.ok) {
            const profileErrorData = await profileCheckResponse.json();
            console.error('[Login] Profile check API Error:', profileErrorData); 
            setError(profileErrorData.message || 'Failed to verify profile status.');
        } else {
            const profileData = await profileCheckResponse.json();
            localStorage.setItem('studentId', profileData._id);
            console.log('[Login] Redirecting to student dashboard.'); 
            navigate('/student/dashboard');
        }
      } else { // Admin or other roles
        console.log('[Login] Redirecting to admin dashboard.'); 
        navigate('/admin/dashboard');
      }

    } catch (err) {
      console.error('[Login] Caught Error in handleSubmit:', err.message); 
      setError(err.message || 'Login failed. Please check your credentials.');
      console.log('[Login] LocalStorage content on catch:', localStorage.getItem('token'), localStorage.getItem('userRole')); 
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
              <input type="email" id="email" placeholder="Enter email" required className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" id="password" placeholder="Password" required className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-3">Login</button>
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