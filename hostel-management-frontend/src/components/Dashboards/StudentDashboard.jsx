// src/components/Dashboards/StudentDashboard.jsx - REVERTED to include Hostel selection and Rooms
import React, { useState, useEffect } from 'react';
import Rooms from './Student/Rooms'; // Re-import Rooms

function StudentDashboard() {
  const [selectedHostel, setSelectedHostel] = useState('');
  const [hostels, setHostels] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Effect to fetch hostels
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view hostels.');
          setLoading(false);
          return;
        }

        // GET /api/hostels is now public, but still requires auth if we want to populate in a protected dashboard
        // For now, keep token logic as StudentDashboard is a protected route itself.
        const response = await fetch('http://localhost:5000/api/hostels', {
          headers: {
            'Authorization': `Bearer ${token}`, // Still send token as dashboard is protected
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch hostels.');
        }

        const data = await response.json();
        setHostels(data);
      } catch (err) {
        console.error('Error fetching hostels for Student Dashboard:', err.message);
        setError(err.message || 'Failed to load hostels.');
      } finally {
        setLoading(false);
      }
    };

    fetchHostels();
  }, []); // Empty dependency array means this runs once on component mount

  const handleHostelChange = (event) => {
    setSelectedHostel(event.target.value);
  };

  if (loading) {
    return <div className="container mt-5 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div><p>Loading hostels...</p></div>;
  }

  if (error) {
    return <div className="container mt-5 text-center"><div className="alert alert-danger" role="alert">{error}</div></div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Student Dashboard</h2>
      <p className="lead text-center mb-5">Welcome, Student! Here are your features:</p>

      {/* Hostel Selection Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Select Hostel</h4>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="hostelSelect" className="form-label">Choose a Hostel:</label>
            <select
              id="hostelSelect"
              className="form-select"
              value={selectedHostel}
              onChange={handleHostelChange}
            >
              <option value="">-- Select Hostel --</option>
              {hostels.map((hostel) => (
                <option key={hostel._id} value={hostel.name}>
                  {hostel.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Room Availability Section - pass selectedHostel as prop */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-info text-white">
          <h4 className="mb-0">Room Availability</h4>
        </div>
        <div className="card-body">
          <Rooms selectedHostel={selectedHostel} />
        </div>
      </div>

      {/* Placeholder for other Student sections */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-secondary text-white">
          <h4 className="mb-0">My Details & Payments (Coming Soon)</h4>
        </div>
        <div className="card-body">
          <p>Your personal information and payment history will be displayed here.</p>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-warning text-white">
          <h4 className="mb-0">Submit Complaint/Request (Coming Soon)</h4>
        </div>
        <div className="card-body">
          <p>You can submit maintenance requests or other complaints here.</p>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;