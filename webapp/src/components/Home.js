import React, { useState, useEffect } from 'react';
import './Home.css';
import duckSvg from '/Users/apple.store.pk/Desktop/University/scholarwatch-eman/webapp/src/duck.svg'; 

function Home({ userType, userID, userName, email }) {
  const [userInfo, setUserInfo] = useState({
    name: userName,
    rollNo: userID,
    status: "Loading...",
    gender: "Loading...",
    dob: "Loading...",
    mobileNumber: "Loading...",
    nationality: "Loading...",
    email: email
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Make sure the correct userID is passed to the PHP file
        const response = await fetch(`http://localhost/scholarwatch/fetchUserDetails.php?userID=${userID}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          setLoading(false);
        } else {
          setUserInfo({
            name: data.Name || userName,
            rollNo: data.UserID || userID,
            status: data.Status,
            gender: data.Gender,
            dob: data.DOB,
            mobileNumber: data.MobileNumber,
            nationality: data.Nationality,
            email: data.Email || email
          });
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch user details.');
        setLoading(false);
        console.error("Error during fetch:", err);
      }
    };

    fetchUserData();
  }, [userID, userName, email]);  // Dependency array ensures fetch runs when these values change

  const welcomeMessage = userType === 'Teacher' ? `Welcome, ${userInfo.name}!` : `Welcome, ${userInfo.name}!`;

  if (loading) {
    return <div className="home-container">Loading user details...</div>;
  }

  return (
    <div className="home-container">
      <img src={duckSvg} alt="Duck" className="peek-a-boo-duck" /> {/* New image tag for the duck */}
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
            <p><strong>Gender:</strong> {userInfo.gender}</p>
            <p><strong>DOB:</strong> {userInfo.dob}</p>
            <p><strong>Mobile Number:</strong> {userInfo.mobileNumber}</p>
          </>
        }
      </div>
    </div>
  );
}

export default Home;