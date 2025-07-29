// src/components/Dashboards/Admin/StudentList.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../Modal';
import EditStudentForm from './EditStudentForm';

// Accept selectedHostelId as a prop
function StudentList({ onRefresh, selectedHostelId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  // Fetch students from backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        // Construct URL with hostelId filter if selectedHostelId exists
        const url = selectedHostelId
          ? `http://localhost:5000/api/students?hostelId=${selectedHostelId}`
          : 'http://localhost:5000/api/students';

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch students.');
        }

        const data = await response.json();
        setStudents(data);
      } catch (err) {
        console.error('Error fetching students:', err.message);
        setError(err.message || 'Failed to load student data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [onRefresh, selectedHostelId]); // Re-run effect when onRefresh or selectedHostelId changes


  const handleDelete = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete student: ${studentName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Not authenticated. Please log in again.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete student.');
      }

      alert(`Student ${studentName} deleted successfully!`);
      if (onRefresh) {
        onRefresh(); // Call the callback from AdminDashboard to refresh the list
      }

    } catch (err) {
      console.error('Delete student error:', err.message);
      alert(`Error deleting student: ${err.message}`);
    }
  };

  const handleEdit = (student) => {
    setCurrentStudent(student);
    setShowEditModal(true);
  };

  const handleView = (student) => {
    setCurrentStudent(student);
    setShowEditModal(true); // For simplicity, re-use edit modal/form for view
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentStudent(null);
  };

  const handleSaveEdit = () => {
    setShowEditModal(false);
    setCurrentStudent(null);
    if (onRefresh) {
      onRefresh();
    }
  };


  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Students...</span>
        </div>
        <p>Loading student data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-center">Student List</h3>
      {students.length === 0 && (
        <div className="alert alert-info text-center" role="alert">
          {selectedHostelId ? 'No student records found for the selected hostel.' : 'No student records found.'}
        </div>
      )}
      {students.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Hostel</th>
                <th>Room No.</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student._id}>
                  <td>{student.rollNumber || student._id.substring(student._id.length - 4)}</td>
                  <td>{student.fullName}</td>
                  <td>{student.email}</td>
                  <td>{student.hostel ? student.hostel.name : 'N/A'}</td>
                  <td>{student.room || 'N/A'}</td>
                  <td>
                    <span className={`badge ${student.is_checked_in ? 'bg-success' : 'bg-danger'}`}>
                      {student.is_checked_in ? 'Checked In' : 'Checked Out'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${student.payment_status === 'Paid' ? 'bg-info' : student.payment_status === 'Pending' ? 'bg-warning' : 'bg-danger'}`}>
                      {student.payment_status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => handleView(student)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning me-1"
                      onClick={() => handleEdit(student)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(student._id, student.fullName)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Edit/View Student */}
      {currentStudent && (
        <Modal
          show={showEditModal}
          title={`Edit Student: ${currentStudent.fullName}`}
          onClose={handleCloseEditModal}
        >
          <EditStudentForm
            student={currentStudent}
            onSave={handleSaveEdit}
            onCancel={handleCloseEditModal}
          />
        </Modal>
      )}
    </div>
  );
}

export default StudentList;