// src/components/Dashboards/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import StudentList from './Admin/StudentList'; 

function AdminDashboard() {
  const [refreshStudentList, setRefreshStudentList] = useState(false);
  // State for hostel filter for student list
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [hostels, setHostels] = useState([]);
  const [loadingHostels, setLoadingHostels] = useState(true);
  const [hostelsError, setHostelsError] = useState('');
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setHostelsError('Authentication token not found. Please log in.');
          setLoadingHostels(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/hostels', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch hostels for filter.');
        }
        const data = await response.json();
        setHostels(data);
      } catch (err) {
        console.error('Error fetching hostels for admin filter:', err.message);
        setHostelsError(err.message || 'Failed to load hostels for filter.');
      } finally {
        setLoadingHostels(false);
      }
    };

    fetchHostels();
  }, []); 
  const handleRefreshStudentList = () => {
    setRefreshStudentList(prev => !prev);
  };

  const handleHostelFilterChange = (event) => {
    setSelectedHostelId(event.target.value);
    handleRefreshStudentList();
  };

  if (loadingHostels) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Hostels...</span>
        </div>
        <p>Loading hostel filter...</p>
      </div>
    );
  }
  if (hostelsError) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger" role="alert">
          {hostelsError}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Admin Dashboard</h2>
      <p className="lead text-center mb-5">Welcome, Administrator! Here are your administrative tools:</p>

      {/* Hostel Filter Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Filter Students by Hostel</h4>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="hostelFilter" className="form-label">Select Hostel:</label>
            <select
              id="hostelFilter"
              className="form-select"
              value={selectedHostelId}
              onChange={handleHostelFilterChange}
            >
              <option value="">-- View All Hostels --</option> {}
              {hostels.map((hostel) => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student Management Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Student Management</h4>
        </div>
        <div className="card-body">
          <StudentList
            key={refreshStudentList ? 'refreshed-student' : 'initial-student'}
            onRefresh={handleRefreshStudentList} 
            selectedHostelId={selectedHostelId} 
          />
        </div>
      </div>
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-secondary text-white">
          <h4 className="mb-0">Room Allocation Requests</h4>
        </div>
        <div className="card-body">
          <p>Student requests for new room allocation or changes will appear here for approval/disapproval.</p>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-danger text-white">
          <h4 className="mb-0">Complaints & Feedback</h4>
        </div>
        <div className="card-body">
          <p>Student complaints and feedback will be displayed here.</p>
    
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;