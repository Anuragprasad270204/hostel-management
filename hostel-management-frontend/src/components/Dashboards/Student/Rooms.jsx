// src/components/Dashboards/Student/Rooms.jsx - UPDATED (Fixed initialization error)
import React, { useState, useEffect } from "react";

// Main Rooms Component
function Rooms({ selectedHostel, onRoomBooked }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      if (!selectedHostel) {
        setRooms([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please log in.");
          setLoading(false);
          return;
        }

        const allHostelsResponse = await fetch(
          "http://hostel-management-3x2z.onrender.com/api/hostels",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const allHostelsData = await allHostelsResponse.json();
        const selectedHostelObj = allHostelsData.find(
          (h) => h.name === selectedHostel
        );

        if (!selectedHostelObj) {
          setError("Selected hostel not found or invalid.");
          setLoading(false);
          setRooms([]);
          return;
        }

        const response = await fetch(
          `http://hostel-management-3x2z.onrender.com/api/rooms?hostelId=${selectedHostelObj._id}&isAvailable=true`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch rooms.");
        }

        const data = await response.json();
        setRooms(data);
      } catch (err) {
        console.error("Error fetching rooms for student view:", err.message);
        setError(err.message || "Failed to load room data.");
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [selectedHostel]);

  const handleBookNowClick = async (room) => {
    if (
      !window.confirm(
        `Are you sure you want to book Room ${room.roomNumber} in ${room.hostel.name}?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Not authenticated. Please log in to book a room.");
        return;
      }
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert(
          "User ID not found in session. Please log in again or contact admin."
        );
        return;
      }

      const response = await fetch(
        "http://hostel-management-3x2z.onrender.com/api/rooms/book",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roomId: room._id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to book room.");
      }

      const data = await response.json();
      alert(`Success! ${data.message}`);
      if (onRoomBooked) {
        onRoomBooked();
      }
    } catch (err) {
      console.error("Book Room Error:", err.message);
      setError(err.message || "Failed to book room. Please try again.");
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
        {rooms.map((room) => (
          <div className="col" key={room._id}>
            <div
              className={`card h-100 ${
                room.isAvailable ? "border-success" : "border-danger"
              }`}
            >
              <div
                className={`card-header ${
                  room.isAvailable
                    ? "bg-success text-white"
                    : "bg-danger text-white"
                }`}
              >
                <h5 className="mb-0">
                  Room: {room.roomNumber} ({room.hostel.name})
                </h5>
              </div>
              <div className="card-body">
                <p className="card-text">
                  <strong>Floor:</strong> {room.floor}
                </p>
                <p className="card-text">
                  <strong>Capacity:</strong> {room.capacity}
                </p>
                <p className="card-text">
                  <strong>Occupancy:</strong> {room.currentOccupancy}
                </p>
                <p className="card-text">
                  <strong>Type:</strong> {room.type}
                </p>
                <p className="card-text">
                  <strong>Features:</strong>{" "}
                  {room.features.join(", ") || "None"}
                </p>
                <p className="card-text">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`badge ${
                      room.status === "Operational"
                        ? "bg-success"
                        : "bg-warning"
                    }`}
                  >
                    {room.status}
                  </span>
                </p>
              </div>
              <div className="card-footer text-end">
                {room.isAvailable ? (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleBookNowClick(room)}
                  >
                    Book Now
                  </button>
                ) : (
                  <button className="btn btn-sm btn-secondary" disabled>
                    Full
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Rooms;
