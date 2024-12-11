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
import AttendanceMonitoring from './components/AttendanceMonitoring';
import BackgroundIcons from './components/BackgroundIcons'; 
import Results from './components/Results.js';
import Logout from './components/Logout.js';

import './App.css';

function App() {
  const [userType, setUserType] = useState('');
  const [userID, setUserID] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState("");
  
  
  const [results, setResults] = useState({ awake_time: 0, drowsy_time: 0 });
  const [emotionResults, setEmotionResults] = useState({ awake_time: 0, drowsy_time: 0 });
  const [postureResults, setPostureResults] = useState({ total_time:0, good_posture_time: 0, phone_use_time: 0 , no_person_time: 0, looking_right_time: 0, looking_left_time: 0, slouching_time: 0});
  const [gazeResults, setGazeResults] = useState({ focused_time: 0, unfocused_time: 0 });
  const [isCalibrated, setIsCalibrated] = useState(false); // Track calibration globally
  const [invalidationCount, setInvalidationCount] = useState([]); // New state for invalidation count

  
  const incrementInvalidationCount = () => {
    const timestamp = new Date().toLocaleTimeString();
    setInvalidationCount((prevCount) => [...prevCount, { name: timestamp, value: prevCount.length + 1 }]);
  };

  return (
    <Router>
      <div className="App">
      <BackgroundIcons />
        <Header userType={userType}/>
        {userType === "Teacher" ? (
          <div className="main-container">
            <div className="sidebar">
              <Link to="/"><button>Home</button></Link>
              <Link to="/createLecture"><button>Lectures</button></Link>
              <Link to="/createQuiz"><button>Quizzes</button></Link>
              <Link to="/insights"><button>Insights</button></Link>
              <Link to="/attendanceMonitoring"><button>Attendance Monitoring</button></Link> 
              <Link to="/logout"><button>Log out</button></Link>
            </div>
            <div className="content">
              <Routes>
                <Route path="/" element={<Home userType={userType} userID={userID} userName={userName}  email={email} />} />
                <Route path="/createLecture" element={<CreateLecture userID={userID}/>} />
                <Route path="/createQuiz" element={<CreateQuiz/>} />
                <Route path="/insights" element={<Insights results={emotionResults} gazeResults={gazeResults} invalidationCount={invalidationCount} />} />
                <Route path="/attendanceMonitoring" element={<AttendanceMonitoring emotionResults={emotionResults} gazeResults={gazeResults} postureResults={postureResults}/>} /> 
                <Route path="/logout" element={<Logout setUserType={setUserType}/>} />
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
              <Link to="/logout"><button>Log out</button></Link>
            </div>
            <div className="content">
              <Routes>

                <Route path="/" element={<Home userType={userType} userID={userID} userName={userName} email={email} />} />
                <Route path="/lectures" element={<Lectures isCalibrated={isCalibrated} setIsCalibrated={setIsCalibrated} setGazeResults={setGazeResults} />} />
                <Route path="/liveFeed" element={<LiveFeed setEmotionResults={setEmotionResults} />} />
                <Route path="/quizzes" element={<Quizzes incrementInvalidationCount={incrementInvalidationCount} />} />
                <Route path="/postureDetection" element={<PostureDetection setPostureResults={setPostureResults}/>} />
                <Route path="/StudentInsights" element={<StudentInsights results={emotionResults} gazeResults={gazeResults} />} />
                <Route path="/results" element={<Results emotionResults={emotionResults}/>} />
                <Route path="/logout" element={<Logout setUserType={setUserType}/>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Login setUserType={setUserType} setUserID={setUserID} setUserName={setUserName} email={email} setEmail={setEmail} />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;