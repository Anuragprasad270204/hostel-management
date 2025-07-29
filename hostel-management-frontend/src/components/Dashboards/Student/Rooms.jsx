// src/components/Dashboards/Student/Rooms.jsx - UPDATED (Direct Booking)
import React, { useState, useEffect } from 'react';
// Removed Modal import as it's no longer needed for booking directly
// Removed BookingRequestForm component definition

// Main Rooms Component
function Rooms({ selectedHostel }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Removed modal related states
  // const [showBookingModal, setShowBookingModal] = useState(false);
  // const [roomToRequest, setRoomToRequest] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!selectedHostel) {
        setRooms([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        // Fetch all hostels to find the ID of the selected hostel (by name)
        // This GET /api/hostels is PUBLIC, but also requires Auth token for consistency in dashboard
        const allHostelsResponse = await fetch('http://localhost:5000/api/hostels', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const allHostelsData = await allHostelsResponse.json();
        const selectedHostelObj = allHostelsData.find(h => h.name === selectedHostel);

        if (!selectedHostelObj) {
          setError('Selected hostel not found or invalid.');
          setLoading(false);
          setRooms([]);
          return;
        }

        // Fetch rooms filtered by the selected hostel's ID and availability
        const response = await fetch(`http://localhost:5000/api/rooms?hostelId=${selectedHostelObj._id}&isAvailable=true`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch rooms.');
        }

        const data = await response.json();
        setRooms(data);
      } catch (err) {
        console.error('Error fetching rooms for student view:', err.message);
        setError(err.message || 'Failed to load room data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [selectedHostel]); // Re-fetch when selectedHostel changes

  const handleBookNowClick = async (room) => {
    if (!window.confirm(`Are you sure you want to book Room ${room.roomNumber} in ${room.hostel.name}?`)) {
        return; // User cancelled
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Not authenticated. Please log in to book a room.');
            return;
        }
        // Ensure student profile exists for this user (backend logic handles creation if not)
        const userId = localStorage.getItem('userId'); // Get userId from localStorage
        if (!userId) {
            alert('User ID not found in session. Please log in again or contact admin.');
            return;
        }

        // --- NEW API ENDPOINT FOR DIRECT BOOKING ---
        const response = await fetch('http://localhost:5000/api/rooms/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ roomId: room._id }) // Send only the room ID
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to book room.');
        }

        const data = await response.json();
        alert(`Success! ${data.message}`);
        // Optimistically update the room's availability in the UI
        setRooms(prevRooms => prevRooms.map(r => r._id === room._id ? { ...r, currentOccupancy: r.currentOccupancy + 1, isAvailable: r.currentOccupancy + 1 < r.capacity } : r));
        // A full re-fetch might be needed for absolute accuracy, but this provides immediate feedback.
        // If the component's useEffect is dependent on selectedHostel, a simple state toggle in parent could trigger it.
        // For now, this local update or a manual page refresh will reflect the change.
    } catch (err) {
        console.error('Book Room Error:', err.message);
        setError(err.message || 'Failed to book room. Please try again.');
    }
  };


  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Rooms...</span>
        </div>
        <p>Loading room data...</p>
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
      <h3 className="mb-4 text-center">Available Rooms</h3>
      {rooms.length === 0 && selectedHostel && (
        <div className="alert alert-info text-center" role="alert">
          No available rooms found for {selectedHostel}.
        </div>
      )}
      {rooms.length === 0 && !selectedHostel && (
        <div className="alert alert-info text-center" role="alert">
          Please select a hostel to view available rooms.
        </div>
      )}

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {rooms.map(room => (
          <div className="col" key={room._id}>
            <div className={`card h-100 ${room.isAvailable ? 'border-success' : 'border-danger'}`}>
              <div className={`card-header ${room.isAvailable ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                <h5 className="mb-0">Room: {room.roomNumber} ({room.hostel.name})</h5>
              </div>
              <div className="card-body">
                <p className="card-text"><strong>Floor:</strong> {room.floor}</p>
                <p className="card-text"><strong>Capacity:</strong> {room.capacity}</p>
                <p className="card-text"><strong>Occupancy:</strong> {room.currentOccupancy}</p>
                <p className="card-text">
                  <strong>Type:</strong> {room.type}
                </p>
                <p className="card-text">
                  <strong>Features:</strong> {room.features.join(', ') || 'None'}
                </p>
                <p className="card-text">
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${room.status === 'Operational' ? 'bg-success' : 'bg-warning'}`}>
                    {room.status}
                  </span>
                </p>
              </div>
              <div className="card-footer text-end">
                {room.isAvailable ? (
                  <button className="btn btn-sm btn-primary" onClick={() => handleBookNowClick(room)}>Book Now</button>
                ) : (
                  <button className="btn btn-sm btn-secondary" disabled>Full</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Removed Booking Request Modal */}
    </div>
  );
}

export default Rooms;