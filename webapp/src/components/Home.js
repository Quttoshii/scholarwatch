import React from 'react';
import './Home.css'; 

function Home({ userType, userID ,userName,email}) {
  
  console.log(userName);
  const userInfo = {
    name: userName, 
    rollNo: userID, 
    status: "Active",
    gender: "Male",
    dob: "January 1, 1997",
    mobileNumber: "+92 300 1234567",
    nationality: "Pakistani",
    email:email

  };

 
  const welcomeMessage = userType === 'Teacher' ? `Welcome, ${userInfo.name}!` : `Welcome, ${userInfo.name}!`;

  return (
    <div className="home-container">
      <div className="profile-header">
        <h1>{welcomeMessage}</h1>
      </div>
      <div className="user-details">
        <p><strong>Name:</strong> {userInfo.name}</p>
        <p><strong>Roll No:</strong> {userInfo.rollNo}</p>
        <p><strong>Status:</strong> {userInfo.status}</p>
        <p><strong>Email:</strong> {userInfo.email}</p>
        <p><strong>Nationality:</strong> {userInfo.nationality}</p>
      </div>
    </div>
  );
}

export default Home;