// src/components/Dashboards/StudentDashboard.jsx
import { useState, useEffect } from "react";
import Rooms from "./Student/Rooms";
import { Link } from "react-router-dom";

function StudentDashboard() {
  const [selectedHostel, setSelectedHostel] = useState("");
  const [hostels, setHostels] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [refreshProfileTrigger, setRefreshProfileTrigger] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please log in.");
          return;
        }

        // Fetch student's own profile
        const profileResponse = await fetch(
          "http://hostel-management-3x2z.onrender.com/api/student-profiles/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (profileResponse.status === 404) {
          // Profile not found (expected for new students)
          setStudentProfile(null);
        } else if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(
            errorData.message || "Failed to fetch student profile."
          );
        } else {
          const profileData = await profileResponse.json();
          setStudentProfile(profileData);
          localStorage.setItem("studentId", profileData._id);
        }

        const hostelsResponse = await fetch(
          "http://hostel-management-3x2z.onrender.com/api/hostels",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!hostelsResponse.ok) {
          const errorData = await hostelsResponse.json();
          throw new Error(errorData.message || "Failed to fetch hostels.");
        }
        const hostelsData = await hostelsResponse.json();
        setHostels(hostelsData);
      } catch (err) {
        console.error("Error fetching student dashboard data:", err.message);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [refreshProfileTrigger]);

  const handleHostelChange = (event) => {
    setSelectedHostel(event.target.value);
  };

  const handleCheckOut = async () => {
    if (!window.confirm("Are you sure you want to check out from your room?")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Not authenticated. Please log in.");
        return;
      }
      if (!studentProfile || !studentProfile._id) {
        alert("Student profile not found. Cannot check out.");
        return;
      }

      const response = await fetch(
        `http://hostel-management-3x2z.onrender.com/api/student-profiles/checkout`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to check out.");
      }

      alert("Successfully checked out from your room.");
      setRefreshProfileTrigger((prev) => !prev);
    } catch (err) {
      console.error("Check Out Error:", err.message);
      setError(err.message || "Failed to check out. Please try again.");
    }
  };

  const handleRoomBookedSuccessfully = () => {
    setRefreshProfileTrigger((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading dashboard data...</p>
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

  const hasRoom =
    studentProfile &&
    studentProfile.is_checked_in &&
    studentProfile.hostel &&
    studentProfile.room;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Student Dashboard</h2>
      <p className="lead text-center mb-5">
        Welcome, Student! Here are your features:
      </p>

      {hasRoom ? (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-success text-white">
            <h4 className="mb-0">Your Current Room</h4>
          </div>
          <div className="card-body text-center">
            <p className="fs-5">You are currently residing in:</p>
            <p className="display-6 text-success">
              Room {studentProfile.room} ({studentProfile.hostel.name})
            </p>
            <button className="btn btn-danger mt-3" onClick={handleCheckOut}>
              Check Out
            </button>
            <p className="mt-3 text-muted">
              You can request a room change through the complaint/request
              section.
            </p>
          </div>
        </div>
      ) : (
        <>
          {studentProfile ? (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Select Hostel</h4>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="hostelSelect" className="form-label">
                    Choose a Hostel:
                  </label>
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
          ) : (
            <div className="card shadow-sm mb-4">
              <div className="card-body text-center">
                <p className="alert alert-warning">
                  Your student profile is not complete. Please complete it to
                  book a room.
                </p>
                <Link
                  to="/student/complete-profile"
                  className="btn btn-primary"
                >
                  Complete Profile Now
                </Link>
              </div>
            </div>
          )}

          {studentProfile && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-info text-white">
                <h4 className="mb-0">Room Availability</h4>
              </div>
              <div className="card-body">
                <Rooms
                  selectedHostel={selectedHostel}
                  onRoomBooked={handleRoomBookedSuccessfully}
                />
              </div>
            </div>
          )}
        </>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-secondary text-white">
          <h4 className="mb-0">My Details & Payments (Coming Soon)</h4>
        </div>
        <div className="card-body">
          <p>
            Your personal information and payment history will be displayed
            here.
          </p>
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
