import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Lectures from './components/Lectures';
import Quizzes from './components/Quizzes';
import LiveFeed from './components/LiveFeed';
import Insights from './components/Insights';
import StudentInsights from './components/StudentsInsights.js';
import PostureDetection from './components/PostureDetection';
import CreateQuiz from './components/CreateQuiz';
import CreateLecture from './components/CreateLecture';
import SlideGeneration from './components/SlideGeneration';
import AttendanceMonitoring from './components/AttendanceMonitoring';
import BackgroundIcons from './components/BackgroundIcons';
import Results from './components/Results.js';
import Logout from './components/Logout.js';
import { ToastContainer } from "react-toastify";
import WeakAreaAnalysis from './components/WeakAreaAnalysis';
import TeacherWeakAreaAnalysis from './components/TeacherWeakAreaAnalysis';
import "react-toastify/dist/ReactToastify.css";
import useCachedState from './hooks/useCachedState';

import './App.css';

function App() {
  const [loggingOut, setLoggingOut] = useState(false);
  const [returnTo, setReturnTo] = useState('');
  const [userType, setUserType] = useState('');
  const [userID, setUserID] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [makeQuiz, setMakeQuiz] = useCachedState("makeQuiz", false);
  const [takeQuiz, setTakeQuiz] = useCachedState("takeQuiz", false);
  const [numQuestions, setNumQuestions] = useCachedState("numQuestions", 4);
  const [selectedLecture, setSelectedLecture] = useCachedState("selectedLecture", "");
  const [pageNumbers, setPageNumbers] = useState([]);
  const [emotionResults, setEmotionResults] = useCachedState("emotionResults", { awake_time: 0, drowsy_time: 0 });
  const [postureResults, setPostureResults] = useCachedState("postureResults", {
    total_time: 0,
    good_posture_time: 0,
    phone_use_time: 0,
    no_person_time: 0,
    looking_right_time: 0,
    looking_left_time: 0,
    slouching_time: 0
  });
  const [gazeResults, setGazeResults] = useCachedState("gazeResults", { focused_time: 0, unfocused_time: 0 });
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [invalidationCount, setInvalidationCount] = useCachedState("invalidationCount", []);
  const [weakAreas, setWeakAreas] = useCachedState("weakAreas", {});
  const [loading, setLoading] = useState(true);

  const incrementInvalidationCount = () => {
    const timestamp = new Date().toLocaleTimeString();
    setInvalidationCount(prev => [...prev, { name: timestamp, value: prev.length + 1 }]);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userid = params.get('userid');
    const fullname = params.get('fullname');
    const email = params.get('email');
    const role = params.get('role');
    const returnto = params.get('returnto');

    if (userid && fullname && email && role) {
      setUserID(userid);
      setUserName(fullname);
      setEmail(email);
      if (role.toLowerCase() === 'teacher' || role.toLowerCase() === 'admin') {
        setUserType("Teacher");
      } else {
        setUserType("Student");
      }
    }

    if (returnto) {
      setReturnTo(returnto);
    }

    setLoading(false);
  }, []);

  if (loading) return <div className="loading">Loading user info...</div>;
  if (!userType || !userID) {
    if (!loggingOut) {
      return <div className="error"  style={{ padding: '2rem', textAlign: 'center', fontSize: '1.5rem' }}>User info missing or invalid. Please access via Moodle.</div>;
    } else {
      return<div className="logout-message" style={{ padding: '2rem', textAlign: 'center', fontSize: '1.5rem' }}>
      Logging out of ScholarWatch... Please wait.
    </div>;
    }
  }


  return (
    <Router>
      <div className="App">
        <ToastContainer />
        <BackgroundIcons />
        <Header userType={userType} />
        {userType === "Teacher" ? (
          <div className="main-container">
            <div className="sidebar">
              <Link to="/"><button style={{ '--animation-order': 1 }}>Home</button></Link>
              <Link to="/createLecture"><button style={{ '--animation-order': 2 }}>Lectures</button></Link>
              <Link to="/createQuiz"><button style={{ '--animation-order': 3 }}>Quizzes</button></Link>
              <Link to="/insights"><button style={{ '--animation-order': 4 }}>Insights</button></Link>
              <Link to="/attendanceMonitoring"><button style={{ '--animation-order': 5 }}>Attendance Monitoring</button></Link>
              <Link to="/slideGeneration"><button style={{ '--animation-order': 6 }}>Slide Generation</button></Link>
              <Link to="/AggregatedWeakAreaAnalysis"><button style={{ '--animation-order': 7 }}>Weak Area Analysis</button></Link>
              <Link to="/logout"><button style={{ '--animation-order': 8 }}>Log out</button></Link>
            </div>
            <div className="content">
              <Routes>
                <Route path="/" element={<Home userType={userType} userID={userID} userName={userName} email={email} />} />
                <Route path="/createLecture" element={<CreateLecture userID={userID} />} />
                <Route path="/createQuiz" element={
                  <CreateQuiz userID={userID} makeQuiz={makeQuiz} setMakeQuiz={setMakeQuiz} numQuestions={numQuestions} setNumQuestions={setNumQuestions} setSelectedLecture={setSelectedLecture} />}
                />
                <Route path="/insights" element={<Insights emotionResults={emotionResults} gazeResults={gazeResults} invalidationCount={invalidationCount} />} />
                <Route path="/attendanceMonitoring" element={<AttendanceMonitoring emotionResults={emotionResults} gazeResults={gazeResults} postureResults={postureResults} />} />
                <Route path="/slideGeneration" element={<SlideGeneration />} />
                <Route path="/AggregatedWeakAreaAnalysis" element={<TeacherWeakAreaAnalysis aggregatedWeakAreas={weakAreas} />} />
                <Route path="/logout" element={<Logout setUserType={setUserType} returnTo={returnTo} setLoggingOut={setLoggingOut}/>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        ) : (
          <div className="main-container">
            <div className="sidebar">
              <Link to="/"><button style={{ '--animation-order': 1 }}>Home</button></Link>
              <Link to="/lectures"><button style={{ '--animation-order': 2 }}>Lectures</button></Link>
              <Link to="/liveFeed"><button style={{ '--animation-order': 3 }}>Emotion Detection</button></Link>
              <Link to="/postureDetection"><button style={{ '--animation-order': 4 }}>Posture Detection</button></Link>
              <Link to="/quizzes"><button style={{ '--animation-order': 5 }}>Quizzes</button></Link>
              <Link to="/StudentInsights"><button style={{ '--animation-order': 6 }}>Insights</button></Link>
              <Link to="/weakAreaAnalysis"><button style={{ '--animation-order': 7 }}>Weak Area Analysis</button></Link>
              <Link to="/logout"><button style={{ '--animation-order': 8 }}>Log out</button></Link>
            </div>
            <div className="content">
              <Routes>
                <Route path="/" element={<Home userType={userType} userID={userID} userName={userName} email={email} />} />
                <Route path="/lectures" element={<Lectures isCalibrated={isCalibrated} setIsCalibrated={setIsCalibrated} setGazeResults={setGazeResults} makeQuiz={makeQuiz} setTakeQuiz={setTakeQuiz} selectedLecture={selectedLecture} setPageNumbers={setPageNumbers} />} />
                <Route path="/liveFeed" element={<LiveFeed setEmotionResults={setEmotionResults} />} />
                <Route path="/quizzes" element={<Quizzes incrementInvalidationCount={incrementInvalidationCount} makeQuiz={makeQuiz} takeQuiz={takeQuiz} setTakeQuiz={setTakeQuiz} selectedLecture={selectedLecture} pageNumbers={pageNumbers} numQuestions={numQuestions} setWeakAreas={setWeakAreas} />} />
                <Route path="/postureDetection" element={<PostureDetection setPostureResults={setPostureResults} />} />
                <Route path="/StudentInsights" element={<StudentInsights results={emotionResults} gazeResults={gazeResults} />} />
                <Route path="/results" element={<Results emotionResults={emotionResults} />} />
                <Route path="/weakAreaAnalysis" element={<WeakAreaAnalysis weakAreas={weakAreas} />} />
                <Route path="/logout" element={<Logout setUserType={setUserType} returnTo={returnTo} setLoggingOut={setLoggingOut} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
