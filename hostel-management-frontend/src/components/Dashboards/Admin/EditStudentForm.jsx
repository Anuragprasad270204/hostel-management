// src/components/Dashboards/Admin/EditStudentForm.jsx
import React, { useState, useEffect } from 'react';

function EditStudentForm({ student, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    rollNumber: student.rollNumber || '',
    fullName: student.fullName || '',
    email: student.email || '',
    hostelId: student.hostel ? student.hostel._id : '',
    room: student.room || '',
    is_checked_in: student.is_checked_in, // Boolean state
    payment_status: student.payment_status || 'Pending',
    contactNumber: student.contactNumber || '',
    emergencyContact: {
      name: student.emergencyContact?.name || '',
      relation: student.emergencyContact?.relation || '',
      phone: student.emergencyContact?.phone || ''
    }
  });
  const [hostels, setHostels] = useState([]);
  const [loadingHostels, setLoadingHostels] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoadingHostels(false);
          return;
        }

        const hostelsResponse = await fetch('http://localhost:5000/api/hostels', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!hostelsResponse.ok) {
          const errorData = await hostelsResponse.json();
          throw new Error(errorData.message || 'Failed to fetch hostels.');
        }
        const hostelsData = await hostelsResponse.json();
        setHostels(hostelsData);
      } catch (err) {
        console.error('Error fetching form data:', err.message);
        setError(err.message || 'Failed to load form data.');
      } finally {
        setLoadingHostels(false);
      }
    };

    fetchHostels();
  }, []);
  useEffect(() => {
    setFormData({
      rollNumber: student.rollNumber || '',
      fullName: student.fullName || '',
      email: student.email || '',
      hostelId: student.hostel ? student.hostel._id : '',
      room: student.room || '',
      is_checked_in: student.is_checked_in,
      payment_status: student.payment_status || 'Pending',
      contactNumber: student.contactNumber || '',
      emergencyContact: {
        name: student.emergencyContact?.name || '',
        relation: student.emergencyContact?.relation || '',
        phone: student.emergencyContact?.phone || ''
      }
    });
    setError('');
    setSuccess('');
  }, [student]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [field]: value }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
    else {
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

      const dataToSend = { ...formData }; // Ensure numbers are parsed for capacity/occupancy if directly editable

      const response = await fetch(`http://localhost:5000/api/students/${student._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update student.');
      }

      setSuccess('Student updated successfully!');
      if (onSave) {
        onSave();
      }
    }
    catch (err) {
      console.error('Error updating student:', err.message);
      setError(err.message || 'Failed to update student. Please check input.');
    }
  };

  if (loadingHostels) {
    return <div className="text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div><p>Loading form data...</p></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h4 className="mb-4 text-center">Edit Student: {student.fullName}</h4>
      <div className="card shadow-sm p-4">
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="rollNumber" className="form-label">Roll Number</label>
              <input type="text" className="form-control" id="rollNumber" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input type="text" className="form-control" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
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
            <div className="col-md-6 form-check form-switch mt-4">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="is_checked_in"
                    name="is_checked_in"
                    checked={formData.is_checked_in}
                    onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="is_checked_in">Checked In</label>
            </div>
            <div className="col-md-6">
              <label htmlFor="payment_status" className="form-label">Payment Status</label>
              <select className="form-select" id="payment_status" name="payment_status" value={formData.payment_status} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="contactNumber" className="form-label">Contact Number (Optional)</label>
              <input type="text" className="form-control" id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
            </div>
            <hr className="my-4" />
            <h5>Emergency Contact Details</h5>
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
          <div className="d-flex justify-content-end mt-4">
            <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStudentForm;