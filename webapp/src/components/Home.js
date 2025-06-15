import React, { useState, useEffect } from 'react';
import './Home.css';
import duckSvg from '../duck.svg'; 

function Home({ userType, userID, userName, email }) {
  const [userInfo, setUserInfo] = useState({
    name: userName,
    rollNo: userID,
    status: "Loading...",
    mobileNumber: "Loading...",
    nationality: "Loading...",
    email: email
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost/local/scholarwatch/api/fetchUserDetails.php?userID=${userID}`, {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setUserInfo({
            name: `${data.firstname ?? userName} ${data.lastname ?? ''}`,
            rollNo: data.id ?? userID,
            status: data.suspended === 1 ? "Suspended" : "Active",
            mobileNumber: data.phone1 ?? "N/A",     // phone1 used as fallback
            nationality: data.country ?? "N/A",     // country used as fallback
            email: data.email ?? email
          });
        }
      } catch (err) {
        console.error("Error during fetch:", err);
        setError('Failed to fetch user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userID, userName, email]);

  const welcomeMessage = `Welcome, ${userInfo.name}!`;

  if (loading) {
    return <div className="home-container">Loading user details...</div>;
  }

  return (
    <div className="home-container">
      <img src={duckSvg} alt="Duck" className="peek-a-boo-duck" />
      <div className="profile-header">
        <h1>{welcomeMessage}</h1>
      </div>
      <div className="user-details">
        {error ? <p className="error">{error}</p> :
          <>
            <p><strong>Name:</strong> {userInfo.name}</p>
            <p><strong>Roll No:</strong> {userInfo.rollNo}</p>
            <p><strong>Status:</strong> {userInfo.status}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
            <p><strong>Nationality:</strong> {userInfo.nationality}</p>
            <p><strong>Mobile Number:</strong> {userInfo.mobileNumber}</p>
          </>
        }
      </div>
    </div>
  );
}

export default Home;
