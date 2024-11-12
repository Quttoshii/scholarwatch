import React from 'react';
import './Header.css'; // Separate CSS for the header

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <img 
          src="/assets/moodle-logo.png" 
          alt="Moodle Logo" 
          className="logo" 
        />
        <h1>ScholarWatch</h1>
      </div>
    </header>
  );
}

export default Header;
