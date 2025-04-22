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
import SlideGeneration from './components/SlideGeneration'; // Import SlideGeneration component
import AttendanceMonitoring from './components/AttendanceMonitoring';
import BackgroundIcons from './components/BackgroundIcons'; 
import Results from './components/Results.js';
import Logout from './components/Logout.js';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import './App.css';

function App() {
  const [userType, setUserType] = useState('');
  const [userID, setUserID] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState("");
  const [makeQuiz, setMakeQuiz] = useState(false)
  const [takeQuiz, setTakeQuiz] = useState(false)
  const [numQuestions, setNumQuestions] = useState(1);
  const [selectedLecture, setSelectedLecture] = useState('');
  const [pageNumbers, setPageNumbers] = useState([]);
  
  const [results, setResults] = useState({ awake_time: 0, drowsy_time: 0 });
  const [emotionResults, setEmotionResults] = useState({ awake_time: 0, drowsy_time: 0 });
  const [postureResults, setPostureResults] = useState({ total_time:0, good_posture_time: 0, phone_use_time: 0 , no_person_time: 0, looking_right_time: 0, looking_left_time: 0, slouching_time: 0});
  const [gazeResults, setGazeResults] = useState({ focused_time: 0, unfocused_time: 0 });
  const [isCalibrated, setIsCalibrated] = useState(false); 
  const [invalidationCount, setInvalidationCount] = useState([]); 
  
  const incrementInvalidationCount = () => {
    const timestamp = new Date().toLocaleTimeString();
    setInvalidationCount((prevCount) => [...prevCount, { name: timestamp, value: prevCount.length + 1 }]);
  };

  return (
    <Router>
      <div className="App">
        <ToastContainer />
        <BackgroundIcons />
        <Header userType={userType}/>
        {userType === "Teacher" ? (
          <div className="main-container">
            <div className="sidebar">
              <Link to="/"><button style={{ '--animation-order': 1 }}>Home</button></Link>
              <Link to="/createLecture"><button style={{ '--animation-order': 2 }}>Lectures</button></Link>
              <Link to="/createQuiz"><button style={{ '--animation-order': 3 }}>Quizzes</button></Link>
              <Link to="/insights"><button style={{ '--animation-order': 4 }}>Insights</button></Link>
              <Link to="/attendanceMonitoring"><button style={{ '--animation-order': 5 }}>Attendance Monitoring</button></Link>
              <Link to="/slideGeneration"><button style={{ '--animation-order': 6 }}>Slide Generation</button></Link> {/* Added Slide Generation link */}
              <Link to="/logout"><button style={{ '--animation-order': 7 }}>Log out</button></Link>
            </div>
            <div className="content">
              <Routes>
                <Route path="/" element={<Home userType={userType} userID={userID} userName={userName}  email={email} />} />
                <Route path="/createLecture" element={<CreateLecture userID={userID}/>} />
                <Route path="/createQuiz" element={<CreateQuiz userID={userID} makeQuiz={makeQuiz} setMakeQuiz={setMakeQuiz} numQuestions={numQuestions} setNumQuestions={setNumQuestions} setSelectedLecture={setSelectedLecture}/>} />
                <Route path="/insights" element={<Insights emotionResults={emotionResults} gazeResults={gazeResults} invalidationCount={invalidationCount} />} />
                <Route path="/attendanceMonitoring" element={<AttendanceMonitoring emotionResults={emotionResults} gazeResults={gazeResults} postureResults={postureResults}/>} /> 
                <Route path="/slideGeneration" element={<SlideGeneration />} /> {/* Added route for Slide Generation */}
                <Route path="/logout" element={<Logout setUserType={setUserType}/>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        ) : (userType === "Student") ? (
          <div className="main-container">
            <div className="sidebar">
              <Link to="/"><button style={{ '--animation-order': 1 }}>Home</button></Link>
              <Link to="/lectures"><button style={{ '--animation-order': 2 }}>Lectures</button></Link>
              <Link to="/liveFeed"><button style={{ '--animation-order': 3 }}>Emotion Detection</button></Link>
              <Link to="/postureDetection"><button style={{ '--animation-order': 4 }}>Posture Detection</button></Link>
              <Link to="/quizzes"><button style={{ '--animation-order': 5 }}>Quizzes</button></Link>
              <Link to="/StudentInsights"><button style={{ '--animation-order': 6 }}>Insights</button></Link>
              <Link to="/logout"><button style={{ '--animation-order': 7 }}>Log out</button></Link>
            </div>
            <div className="content">
              <Routes>
                <Route path="/" element={<Home userType={userType} userID={userID} userName={userName} email={email} />} />
                <Route path="/lectures" element={<Lectures isCalibrated={isCalibrated} setIsCalibrated={setIsCalibrated} setGazeResults={setGazeResults} makeQuiz={makeQuiz} setTakeQuiz={setTakeQuiz} selectedLecture={selectedLecture} setPageNumbers={setPageNumbers}/>} />
                <Route path="/liveFeed" element={<LiveFeed setEmotionResults={setEmotionResults} />} />
                <Route path="/quizzes" element={<Quizzes incrementInvalidationCount={incrementInvalidationCount} makeQuiz={makeQuiz} takeQuiz={takeQuiz} setTakeQuiz={setTakeQuiz} selectedLecture={selectedLecture} pageNumbers={pageNumbers} numQuestions={numQuestions}/>} />
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