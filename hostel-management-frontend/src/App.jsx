// src/App.jsx - Updated for single generic registration form
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

// Import main components
import Login from './components/Auth/Login';
import Register from './components/Auth/register'; // <-- RE-ADD THIS IMPORT
// REMOVED: import StudentRegister from './components/Auth/StudentRegister';
// REMOVED: import AdminRegister from './components/Auth/AdminRegister';
import AdminDashboard from './components/Dashboards/AdminDashboard';
import StudentDashboard from './components/Dashboards/StudentDashboard';
import HomePage from './components/HomePage';
import Modal from './components/Modal';

function App() {
  const currentToken = localStorage.getItem('token');
  const currentUserRole = localStorage.getItem('userRole');

  const [isAuthenticated, setIsAuthenticated] = useState(!!currentToken);
  const [userRole, setUserRole] = useState(currentUserRole);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(!!currentToken);
    setUserRole(currentUserRole);
  }, [currentToken, currentUserRole]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">HostelAdmin</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {!isAuthenticated && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                  {/* Single Register link in Navbar */}
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">Register</Link> {/* <-- USE SINGLE REGISTER LINK */}
                  </li>
                </>
              )}
              {isAuthenticated && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to={userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard'}>Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#" onClick={handleLogout}>Logout</a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          {/* Single registration route */}
          <Route path="/register" element={<Register />} /> {/* <-- USE SINGLE REGISTER ROUTE */}
          {/* REMOVED: <Route path="/student/register" element={<StudentRegister />} /> */}
          {/* REMOVED: <Route path="/admin/register" element={<AdminRegister />} /> */}

          <Route path="/admin/dashboard" element={isAuthenticated && userRole === 'admin' ? <AdminDashboard /> : <p className="text-center mt-5">Please login as Admin to view this page.</p>} />
          <Route path="/student/dashboard" element={isAuthenticated && userRole === 'student' ? <StudentDashboard /> : <p className="text-center mt-5">Please login as Student to view this page.</p>} />

          <Route path="*" element={<div className="container mt-5 text-center"><h2>404 Not Found</h2><p>The page you are looking for does not exist.</p></div>} />
        </Routes>
      </main>

      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <p className="mb-0">&copy; {new Date().getFullYear()} Hostel Management System NIT Durgapur</p>
      </footer>
    </div>
  );
}

export default App;