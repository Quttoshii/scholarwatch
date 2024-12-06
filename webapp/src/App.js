// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Lectures from './components/Lectures';
import Quizzes from './components/Quizzes';
import LiveFeed from './components/LiveFeed';
import Insights from './components/Insights';
import StudentInsights from './components/StudentsInsights.js';
import PostureDetection from './components/PostureDetection';
import Login from './components/Login';
import CreateQuiz from './components/CreateQuiz';
import CreateLecture from './components/CreateLecture';
import './App.css';

function App() {
  const [userType, setUserType] = useState('');
  const [userID, setUserID] = useState('');
  const [results, setResults] = useState({ awake_time: 0, drowsy_time: 0 });
  const [gazeResults, setGazeResults] = useState({ focused_time: 0, unfocused_time: 0 });
  const [isCalibrated, setIsCalibrated] = useState(false); // Track calibration globally
  const [invalidationCount, setInvalidationCount] = useState([]); // New state for invalidation count

  // Function to increment invalidation count
  const incrementInvalidationCount = () => {
    const timestamp = new Date().toLocaleTimeString(); // Capture time of invalidation
    setInvalidationCount((prevCount) => [...prevCount, { name: timestamp, value: prevCount.length + 1 }]);
  };

  return (
    <Router>
      <div className="App">
        <Header userType={userType}/>
        {userType === "Teacher" ? (
          <div className="main-container">
            <div className="sidebar">
              <Link to="/createLecture"><button>Lectures</button></Link>
              <Link to="/createQuiz"><button>Quizzes</button></Link>
              <Link to="/insights"><button>Insights</button></Link>
            </div>
            <div className="content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/createLecture" element={<CreateLecture userID={userID}/>}/>
                <Route path="/createQuiz" element={<CreateQuiz/>}/>
                <Route path="/insights" element={<Insights results={results} gazeResults={gazeResults} invalidationCount={invalidationCount} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        ) : (userType === "Student") ? (
          <div className="main-container">
            <div className="sidebar">
              <Link to="/lectures"><button>Lectures</button></Link>
              <Link to="/liveFeed"><button>Emotion Detection</button></Link>
              <Link to="/postureDetection"><button>Posture Detection</button></Link>
              <Link to="/quizzes"><button>Quizzes</button></Link>
              <Link to="/StudentInsights"><button>Insights</button></Link>
            </div>
            <div className="content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/lectures" element={<Lectures isCalibrated={isCalibrated} setIsCalibrated={setIsCalibrated} setGazeResults={setGazeResults} />} />
                <Route path="/liveFeed" element={<LiveFeed setResults={setResults} />} />
                <Route path="/quizzes" element={<Quizzes incrementInvalidationCount={incrementInvalidationCount} />} />
                <Route path="/postureDetection" element={<PostureDetection/>} />
                <Route
                  path="/StudentInsights"
                  element={<StudentInsights results={results} gazeResults={gazeResults} />} // Correct component
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Login setUserType={setUserType} setUserID={setUserID}/>}/>
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
