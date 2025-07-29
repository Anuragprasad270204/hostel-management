// src/components/HomePage.jsx
import React from 'react';

function HomePage() {
  // Using a publicly available logo URL for convenience. Replace with your local asset if preferred.
  const nitdgpLogoUrl = 'https://upload.wikimedia.org/wikipedia/en/c/cb/NIT_Durgapur_Logo.png';

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