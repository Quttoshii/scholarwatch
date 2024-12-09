import React from 'react';
import './Header.css'; // Separate CSS for the header

function Header( {userType} ) {
  return (
    <header className="header">
      <div className="header-content">
        <img 
          src="/assets/moodle-logo.png" 
          alt="Moodle Logo" 
          className="logo" 
        />
        {userType === "Teacher" ? (
          <h1>ScholarWatch Teacher</h1>
        ) : (userType === "Student") ? (
          <h1>ScholarWatch Student</h1>
        ) : (
          <h1>ScholarWatch</h1>
        )}
      </div>
    </header>
  );
}

export default Header;
