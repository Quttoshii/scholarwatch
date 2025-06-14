import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
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
import SlideGeneration from './components/SlideGeneration';
import AttendanceMonitoring from './components/AttendanceMonitoring';
import BackgroundIcons from './components/BackgroundIcons'; 
import Results from './components/Results.js';
import Logout from './components/Logout.js';
import { ToastContainer } from "react-toastify";
import WeakAreaAnalysis from './components/WeakAreaAnalysis';
import TeacherWeakAreaAnalysis from './components/TeacherWeakAreaAnalysis';
import "react-toastify/dist/ReactToastify.css";
import KnowledgeGraph from './components/KnowledgeGraph';
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
  
  const [emotionResults, setEmotionResults] = useState({ awake_time: 0, drowsy_time: 0 });
  const [postureResults, setPostureResults] = useState({ total_time:0, good_posture_time: 0, phone_use_time: 0 , no_person_time: 0, looking_right_time: 0, looking_left_time: 0, slouching_time: 0});
  const [gazeResults, setGazeResults] = useState({ focused_time: 0, unfocused_time: 0 });
  const [isCalibrated, setIsCalibrated] = useState(false); 
  const [invalidationCount, setInvalidationCount] = useState([]); 

  const [weakAreas, setWeakAreas] = useState({})
  
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
        <TopNavbarWrapper userType={userType} />
        <div className="main-content">
          <Routes>
            {userType === "Teacher" ? (
              <>
                <Route path="/" element={<Home userType={userType} userID={userID} userName={userName}  email={email} />} />
                <Route path="/createLecture" element={<CreateLecture userID={userID}/>} />
                <Route path="/createQuiz" element={<CreateQuiz userID={userID} makeQuiz={makeQuiz} setMakeQuiz={setMakeQuiz} numQuestions={numQuestions} setNumQuestions={setNumQuestions} setSelectedLecture={setSelectedLecture}/>} />
                <Route path="/knowledge-graph" element={<KnowledgeGraph courseId={1} isTeacher={true} teacherId={userID} />} />
                <Route path="/insights" element={<Insights emotionResults={emotionResults} gazeResults={gazeResults} invalidationCount={invalidationCount} />} />
                <Route path="/attendanceMonitoring" element={<AttendanceMonitoring emotionResults={emotionResults} gazeResults={gazeResults} postureResults={postureResults}/>} /> 
                <Route path="/slideGeneration" element={<SlideGeneration />} /> 
                <Route path="/AggregatedWeakAreaAnalysis" element={ <TeacherWeakAreaAnalysis aggregatedWeakAreas={weakAreas} /> } />
                <Route path="/logout" element={<Logout setUserType={setUserType}/>} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : userType === "Student" ? (
              <>
                <Route path="/" element={<Home userType={userType} userID={userID} userName={userName} email={email} />} />
                <Route path="/lectures" element={
                  <Lectures 
                    isCalibrated={isCalibrated} 
                    setIsCalibrated={setIsCalibrated} 
                    setGazeResults={setGazeResults} 
                    makeQuiz={makeQuiz} 
                    setTakeQuiz={setTakeQuiz} 
                    selectedLecture={selectedLecture} 
                    setSelectedLecture={setSelectedLecture}
                    setPageNumbers={setPageNumbers}
                    isInstructor={userType === "Teacher"}
                    userID={userID}
                    userType={userType}
                  />
                } />
                <Route path="/liveFeed" element={<LiveFeed setEmotionResults={setEmotionResults} />} />
                <Route path="/quizzes" element={<Quizzes incrementInvalidationCount={incrementInvalidationCount} makeQuiz={makeQuiz} takeQuiz={takeQuiz} setTakeQuiz={setTakeQuiz} selectedLecture={selectedLecture} pageNumbers={pageNumbers} numQuestions={numQuestions} setWeakAreas={setWeakAreas}/>} />
                <Route path="/postureDetection" element={<PostureDetection setPostureResults={setPostureResults}/>} />
                <Route path="/StudentInsights" element={<StudentInsights results={emotionResults} gazeResults={gazeResults} />} />
                <Route path="/results" element={<Results emotionResults={emotionResults}/>} />
                <Route path="/WeakAreaAnalysis" element={ <WeakAreaAnalysis weakAreas={weakAreas} /> } />
                <Route path="/logout" element={<Logout setUserType={setUserType}/>} />
                <Route path="/knowledge-graph" element={<KnowledgeGraph courseId={1} isTeacher={false} studentId={userID} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Login setUserType={setUserType} setUserID={setUserID} setUserName={setUserName} email={email} setEmail={setEmail} />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// Wrapper to use useLocation inside Router context
function TopNavbarWrapper({ userType }) {
  return <TopNavbarInner userType={userType} />;
}

function TopNavbarInner({ userType }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  if (userType === "Teacher") {
    return (
      <div className="top-navbar">
        <Link to="/"><button className={isActive("/") ? "active" : ""} style={{ '--animation-order': 1 }}>Home</button></Link>
        <Link to="/createLecture"><button className={isActive("/createLecture") ? "active" : ""} style={{ '--animation-order': 2 }}>Lectures</button></Link>
        <Link to="/createQuiz"><button className={isActive("/createQuiz") ? "active" : ""} style={{ '--animation-order': 3 }}>Quizzes</button></Link>
        <Link to="/knowledge-graph"><button className={isActive("/knowledge-graph") ? "active" : ""} style={{ '--animation-order': 4 }}>Knowledge Graph</button></Link>
        <Link to="/insights"><button className={isActive("/insights") ? "active" : ""} style={{ '--animation-order': 5 }}>Insights</button></Link>
        <Link to="/attendanceMonitoring"><button className={isActive("/attendanceMonitoring") ? "active" : ""} style={{ '--animation-order': 6 }}>Attendance Monitoring</button></Link>
        <Link to="/slideGeneration"><button className={isActive("/slideGeneration") ? "active" : ""} style={{ '--animation-order': 7 }}>Slide Generation</button></Link>
        <Link to="/AggregatedWeakAreaAnalysis"><button className={isActive("/AggregatedWeakAreaAnalysis") ? "active" : ""} style={{ '--animation-order': 8 }}>Weak Area Analysis</button></Link>
        <Link to="/logout"><button className={isActive("/logout") ? "active" : ""} style={{ '--animation-order': 9 }}>Log out</button></Link>
      </div>
    );
  } else if (userType === "Student") {
    return (
      <div className="top-navbar">
        <Link to="/"><button className={isActive("/") ? "active" : ""} style={{ '--animation-order': 1 }}>Home</button></Link>
        <Link to="/lectures"><button className={isActive("/lectures") ? "active" : ""} style={{ '--animation-order': 2 }}>Lectures</button></Link>
        <Link to="/liveFeed"><button className={isActive("/liveFeed") ? "active" : ""} style={{ '--animation-order': 3 }}>Emotion Detection</button></Link>
        <Link to="/postureDetection"><button className={isActive("/postureDetection") ? "active" : ""} style={{ '--animation-order': 4 }}>Posture Detection</button></Link>
        <Link to="/quizzes"><button className={isActive("/quizzes") ? "active" : ""} style={{ '--animation-order': 5 }}>Quizzes</button></Link>
        <Link to="/StudentInsights"><button className={isActive("/StudentInsights") ? "active" : ""} style={{ '--animation-order': 6 }}>Insights</button></Link>
        <Link to="/knowledge-graph"><button className={isActive("/knowledge-graph") ? "active" : ""} style={{ '--animation-order': 7 }}>Knowledge Graph</button></Link>
        <Link to="/weakAreaAnalysis"><button className={isActive("/weakAreaAnalysis") ? "active" : ""} style={{ '--animation-order': 8 }}>Weak Area Analysis</button></Link>
        <Link to="/logout"><button className={isActive("/logout") ? "active" : ""} style={{ '--animation-order': 9 }}>Log out</button></Link>
      </div>
    );
  } else {
    return null;
  }
}

export default App;