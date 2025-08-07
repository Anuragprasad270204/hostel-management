// src/components/Dashboards/Admin/ViewStudentDetails.jsx
import React from 'react';

function ViewStudentDetails({ student, onClose }) {
  if (!student) {
    return <div className="text-center">No student data to display.</div>;
  }

  return (
    <div className="container p-3">
      <h4 className="mb-4 text-center">Student Details: {student.fullName}</h4>
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <strong>Roll Number:</strong> {student.rollNumber || 'N/A'}
        </div>
        <div className="col-md-6">
          <strong>Email:</strong> {student.email || 'N/A'}
        </div>
        <div className="col-md-6">
          <strong>Hostel:</strong> {student.hostel?.name || 'N/A'}
        </div>
        <div className="col-md-6">
          <strong>Room:</strong> {student.room || 'N/A'}
        </div>
        <div className="col-md-6">
          <strong>Status:</strong>{' '}
          <span className={`badge ${student.is_checked_in ? 'bg-success' : 'bg-danger'}`}>
            {student.is_checked_in ? 'Checked In' : 'Checked Out'}
          </span>
        </div>
        <div className="col-md-6">
          <strong>Payment:</strong>{' '}
          <span className={`badge ${student.payment_status === 'Paid' ? 'bg-info' : student.payment_status === 'Pending' ? 'bg-warning' : 'bg-danger'}`}>
            {student.payment_status}
          </span>
        </div>
        <div className="col-md-6">
          <strong>Contact No:</strong> {student.contactNumber || 'N/A'}
        </div>
        <div className="col-md-6">
          <strong>Joined:</strong> {new Date(student.createdAt).toLocaleDateString() || 'N/A'}
        </div>
      </div>

      <h5 className="mt-4 mb-3">Emergency Contact</h5>
      <div className="row g-2">
        <div className="col-md-6">
          <strong>Name:</strong> {student.emergencyContact?.name || 'N/A'}
        </div>
        <div className="col-md-6">
          <strong>Relation:</strong> {student.emergencyContact?.relation || 'N/A'}
        </div>
        <div className="col-md-6">
          <strong>Phone:</strong> {student.emergencyContact?.phone || 'N/A'}
        </div>
      </div>

      <div className="d-flex justify-content-end mt-4">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default ViewStudentDetails;