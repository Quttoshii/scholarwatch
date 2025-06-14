import React, { useState, useEffect, useRef } from 'react';
import GazeTracking from './GazeTracking';
import PDFViewer from './PDFViewer';
import KnowledgeGraph from './KnowledgeGraph';
import './Lectures.css';
import axios from 'axios';

function Lectures({ isCalibrated, setIsCalibrated, setGazeResults, makeQuiz, setTakeQuiz, selectedLecture, setSelectedLecture, setPageNumbers, isInstructor, userID, userType }) {
    const [cameraPermission, setCameraPermission] = useState(true);
    const [focusTimes, setFocusTimes] = useState({});
    const [unfocusTimes, setUnfocusTimes] = useState({});
    const [activeTab, setActiveTab] = useState('lectures');
    const lecturesRef = useRef(null);
    const [lectures, setLectures] = useState([]);
    const [selectedLectureId, setSelectedLectureId] = useState(null);

    useEffect(() => {
        const fetchLectures = async () => {
            try {
                const response = await axios.post(
                    "http://localhost/scholarwatch/fetchLecture.php",
                    { userID },
                    { headers: { "Content-Type": "application/json" } }
                );

                if (response.data.success) {
                    setLectures(response.data.data);
                } else {
                    console.error("Error fetching lectures:", response.data.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchLectures();
    }, [userID]);

    const handleGazeData = (focusTime, unfocusTime, currentPage) => {
        setFocusTimes(prev => ({
            ...prev,
            [currentPage]: (prev[currentPage] || 0) + focusTime
        }));
        setUnfocusTimes(prev => ({
            ...prev,
            [currentPage]: (prev[currentPage] || 0) + unfocusTime
        }));
        // Do NOT call setGazeResults here to avoid infinite loop
    };

    const handleLectureFinish = () => {
        if (makeQuiz) {
            setTakeQuiz(true);
        }
    };

    const handleLectureSelect = (lectureId) => {
        setSelectedLectureId(lectureId);
        const lecture = lectures.find(l => l.lectureID === lectureId);
        if (lecture) {
            setSelectedLecture({ name: lecture.lectureName, path: lecture.DirectoryPath });
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'lectures':
                return (
                    <div className="lectures-content">
                        {lectures.length > 0 ? (
                            <div>
                                <label htmlFor="lecture-select" style={{ fontWeight: 700, color: '#2C1810', fontSize: '1.12rem', marginBottom: '8px', display: 'inline-block' }}>Select Lecture: </label>
                                <select
                                    id="lecture-select"
                                    value={selectedLectureId || ""}
                                    onChange={(e) => handleLectureSelect(parseInt(e.target.value))}
                                    style={{ padding: '10px 16px', borderRadius: '8px', border: '2px solid #ffe5b4', margin: '0 0 18px 12px', fontSize: '1rem', outline: 'none', width: '60%', marginBottom: '18px' }}
                                >
                                    <option value="">-- Select a lecture --</option>
                                    {lectures.map((lecture) => (
                                        <option key={lecture.lectureID} value={lecture.lectureID}>
                                            {lecture.lectureName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <p className="no-lectures">No lectures to attend.</p>
                        )}

                        {selectedLecture && selectedLecture.path ? (
                            <>
                                <div className="current-lecture-banner">
                                    <span role="img" aria-label="book" style={{ marginRight: 8 }}>📖</span>
                                    <span>Currently Attending: <strong>{selectedLecture.name}</strong></span>
                                </div>
                                {cameraPermission === false && (
                                    <p className="camera-warning">Please allow access to your camera to use gaze tracking.</p>
                                )}

                                {cameraPermission === true && (
                                    <GazeTracking 
                                        isCalibrated={isCalibrated} 
                                        setIsCalibrated={setIsCalibrated} 
                                        lecturesRef={lecturesRef}
                                        setGazeResults={handleGazeData}
                                    />
                                )}

                                {isCalibrated ? (
                                    <PDFViewer 
                                        setTakeQuiz={setTakeQuiz} 
                                        selectedLecture={selectedLecture} 
                                        onLectureFinish={handleLectureFinish}
                                        onPageGazeData={handleGazeData}
                                    />
                                ) : (
                                    <p className="calibration-warning">Please complete calibration before starting the lecture.</p>
                                )}
                            </>
                        ) : (
                            <p className="no-lectures">No lecture selected.</p>
                        )}
                    </div>
                );

            case 'knowledge-graph':
                return (
                    <div className="knowledge-graph-container">
                        <KnowledgeGraph courseId={1} isTeacher={userType === 'Teacher'} teacherId={userType === 'Teacher' ? userID : undefined} studentId={userType === 'Student' ? userID : undefined} />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="lectures-page" ref={lecturesRef}>
            <div className="content" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                {renderContent()}
            </div>
        </div>
    );
}

export default Lectures;
