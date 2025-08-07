// src/components/HomePage.jsx
import React from 'react';

function HomePage() {
  //const nitdgpLogoUrl = 'https://th.bing.com/th/id/OIP.RuqAy58qL-tpE1gOUCIJdAHaHa?w=182&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
 const nitdgpLogoUrl = '../../src/assets/nitlogo.jpeg'
  return (
    <div className="container mt-5 text-center">
      <div className="d-flex justify-content-center mb-4">
        <img
          src={nitdgpLogoUrl}
          alt="NIT Durgapur Logo"
          className="img-fluid rounded-circle shadow"
          style={{ maxWidth: '150px', height: 'auto' }}
        />
      </div>
      <h1 className="display-4 text-primary mb-3">Welcome to NIT Durgapur</h1>
      <h2 className="display-6 text-secondary mb-4">Hostel Management System</h2>
      <p className="lead">Your one-stop solution for hostel administration and student services.</p>
      <hr className="my-4" />
      <p>Please login or register to access your personalized dashboard.</p>
    </div>
  );
}

export default HomePage;