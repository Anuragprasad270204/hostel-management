// src/components/Dashboards/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import StudentList from './Admin/StudentList'; // Path corrected
// Note: AddStudentForm is not rendered here as per refined scope.
// import AddStudentForm from './Admin/AddStudentForm';

function AdminDashboard() {
  const [refreshStudentList, setRefreshStudentList] = useState(false);
  // State for hostel filter for student list
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [hostels, setHostels] = useState([]); // List of hostels for filter dropdown
  const [loadingHostels, setLoadingHostels] = useState(true);
  const [hostelsError, setHostelsError] = useState('');

  // Fetch Hostels for the dropdown when component mounts
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
  }, []); // Empty dependency array means this runs once on component mount

  // Callback to refresh student list (used by StudentList's delete/edit)
  const handleRefreshStudentList = () => {
    setRefreshStudentList(prev => !prev);
  };

  // Handler for hostel filter dropdown change
  const handleHostelFilterChange = (event) => {
    setSelectedHostelId(event.target.value);
    // When filter changes, trigger refresh of the student list
    handleRefreshStudentList();
  };

  // Conditional rendering for hostel filter loading/error
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
              <option value="">-- View All Hostels --</option> {/* Option to view all students */}
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
            key={refreshStudentList ? 'refreshed-student' : 'initial-student'} // Key to force refresh
            onRefresh={handleRefreshStudentList} // Pass refresh callback
            selectedHostelId={selectedHostelId} // Pass selected hostel ID for filtering
          />
        </div>
      </div>

      {/* Room Request Box Section (Placeholder) */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-secondary text-white">
          <h4 className="mb-0">Room Allocation Requests</h4>
        </div>
        <div className="card-body">
          <p>Student requests for new room allocation or changes will appear here for approval/disapproval.</p>
        </div>
      </div>

      {/* Complaints Section (Placeholder) */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-danger text-white">
          <h4 className="mb-0">Complaints & Feedback</h4>
        </div>
        <div className="card-body">
          <p>Student complaints and feedback will be displayed here.</p>
        {/* Note: Hostel Management and Room Management sections are removed from this AdminDashboard
            as per your refined scope. */}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;