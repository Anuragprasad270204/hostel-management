// src/components/Dashboards/Student/CompleteProfileForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function CompleteProfileForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rollNumber: '',
    fullName: '',
    email: localStorage.getItem('userEmail') || '', 
    hostelId: '',
    room: '',
    contactNumber: '', 
    emergencyContact: { name: '', relation: '', phone: '' }
  });
  const [hostels, setHostels] = useState([]);
  const [loadingHostels, setLoadingHostels] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch('http://localhost:5000/api/hostels', { headers });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch hostels.');
        }
        const data = await response.json();
        setHostels(data);
      } catch (err) {
        console.error('Error fetching hostels for profile form:', err.message);
        setError(err.message || 'Failed to load hostels for form. Please log in again.');
      } finally {
        setLoadingHostels(false);
      }
    };
    fetchHostels();

    const userEmailFromStorage = localStorage.getItem('userEmail');
    if (userEmailFromStorage) {
        setFormData(prev => ({ ...prev, email: userEmailFromStorage }));
    }

  }, []); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/student-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create student profile.');
      }

      const data = await response.json();
      localStorage.setItem('studentId', data.student._id);
      setSuccess('Student profile completed successfully!');
      alert('Profile completed! You can now proceed to your dashboard.');
      navigate('/student/dashboard');
    } catch (err) {
      console.error('Error completing student profile:', err.message);
      setError(err.message || 'Failed to complete profile. Please check input.');
    }
  };

  if (loadingHostels) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div><p>Loading hostels...</p></div>;
  }
  if (error) { 
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}><div className="alert alert-danger">{error}</div></div>;
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', padding: '20px' }}>
      <div className="card shadow-lg p-3" style={{ width: '35rem' }}>
        <div className="card-body">
          <h2 className="text-center mb-4">Complete Your Student Profile</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="fullName" className="form-label">Full Name</label>
                <input type="text" className="form-control" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label htmlFor="rollNumber" className="form-label">Roll Number</label>
                <input type="text" className="form-control" id="rollNumber" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required />
              </div>
              <div className="col-md-12">
                <label htmlFor="email" className="form-label">Email (Pre-filled from registration)</label>
                <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required readOnly />
              </div>
              <div className="col-md-6">
                <label htmlFor="hostelId" className="form-label">Assigned Hostel:</label>
                <select
                  id="hostelId"
                  name="hostelId"
                  className="form-select"
                  value={formData.hostelId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Hostel --</option>
                  {hostels.map(hostel => (
                    <option key={hostel._id} value={hostel._id}>{hostel.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="room" className="form-label">Room Number (Optional)</label>
                <input type="text" className="form-control" id="room" name="room" value={formData.room} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label htmlFor="contactNumber" className="form-label">Contact Number (Optional)</label>
                <input type="text" className="form-control" id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
              </div>
              <h5 className="mt-4 mb-3">Emergency Contact Details</h5>
              <div className="col-md-4">
                <label htmlFor="ec_name" className="form-label">Name</label>
                <input type="text" className="form-control" id="ec_name" name="emergencyContact.name" value={formData.emergencyContact.name} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label htmlFor="ec_relation" className="form-label">Relation</label>
                <input type="text" className="form-control" id="ec_relation" name="emergencyContact.relation" value={formData.emergencyContact.relation} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label htmlFor="ec_phone" className="form-label">Phone</label>
                <input type="text" className="form-control" id="ec_phone" name="emergencyContact.phone" value={formData.emergencyContact.phone} onChange={handleChange} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-4">Complete Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompleteProfileForm;