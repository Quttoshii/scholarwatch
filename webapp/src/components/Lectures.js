import React, { useState, useEffect, useRef } from 'react';
import GazeTracking from './GazeTracking';
import PDFViewer from './PDFViewer';
import KnowledgeGraph from './KnowledgeGraph';
import './Lectures.css';

function Lectures({ isCalibrated, setIsCalibrated, setGazeResults, makeQuiz, setTakeQuiz, selectedLecture, setPageNumbers, isInstructor }) {
    const [cameraPermission, setCameraPermission] = useState(true);
    const [focusTimes, setFocusTimes] = useState({});
    const [unfocusTimes, setUnfocusTimes] = useState({});
    const [activeTab, setActiveTab] = useState('lectures');
    const lecturesRef = useRef(null);

    const handleGazeData = (focusTime, unfocusTime, currentPage) => {
        setFocusTimes(prev => ({
            ...prev,
            [currentPage]: (prev[currentPage] || 0) + focusTime
        }));
        setUnfocusTimes(prev => ({
            ...prev,
            [currentPage]: (prev[currentPage] || 0) + unfocusTime
        }));
        setGazeResults(focusTime, unfocusTime, currentPage);
    };

    const handleLectureFinish = () => {
        if (makeQuiz) {
            setTakeQuiz(true);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'lectures':
                return (
                    <div className="lectures-content">
                        {selectedLecture === "" ? (
                            <p className="no-lectures">No lectures to attend.</p>
                        ) : (
                            <>
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
                        )}
                    </div>
                );

            case 'knowledge-graph':
                return (
                    <div className="knowledge-graph-container">
                        <KnowledgeGraph courseId={1} isTeacher={isInstructor} />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="lectures-page" ref={lecturesRef}>
            <div className="tabs">
                <button 
                    className={`tab-button ${activeTab === 'lectures' ? 'active' : ''}`}
                    onClick={() => setActiveTab('lectures')}
                >
                    Lectures
                </button>
                <button 
                    className={`tab-button ${activeTab === 'knowledge-graph' ? 'active' : ''}`}
                    onClick={() => setActiveTab('knowledge-graph')}
                >
                    Knowledge Graph
                </button>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    );
}

export default Lectures;
