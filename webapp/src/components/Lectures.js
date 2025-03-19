import React, { useEffect, useRef, useState } from 'react';
import GazeTracking from './GazeTracking';
import PDFViewer from './PDFViewer';

function Lectures({ isCalibrated, setIsCalibrated, setGazeResults, makeQuiz, setTakeQuiz, selectedLecture, setPageNumbers }) {
  const [cameraPermission, setCameraPermission] = useState(true);
  const [focusTimes, setFocusTimes] = useState({});
  const [unfocusTimes, setUnfocusTimes] = useState({});
  const lecturesRef = useRef(null);

  useEffect(() => {
    const checkCameraSupport = () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermission(false);
      }
    };

    checkCameraSupport();
  }, []);

  const handleGazeData = (focusTime, unfocusTime, currentPage) => {
    setFocusTimes((prev) => ({ ...prev, [currentPage]: (prev[currentPage] || 0) + focusTime }));
    setUnfocusTimes((prev) => ({ ...prev, [currentPage]: (prev[currentPage] || 0) + unfocusTime }));
  };

  const handleLectureFinish = () => {
    // Compute total focus and unfocus time
    const totalFocusTime = Object.values(focusTimes).reduce((acc, time) => acc + time, 0);
    const totalUnfocusTime = Object.values(unfocusTimes).reduce((acc, time) => acc + time, 0);

    // Sort page numbers by highest unfocusTime first
    const sortedPages = Object.keys(unfocusTimes)
      .map((page) => ({ page: parseInt(page), unfocusTime: unfocusTimes[page] }))
      .sort((a, b) => b.unfocusTime - a.unfocusTime)
      .map((entry) => entry.page);

    setPageNumbers(sortedPages);

    // Send final gaze data when lecture is completed
    sendGazeDataToServer(totalFocusTime, totalUnfocusTime);
  };

  const sendGazeDataToServer = async (totalFocusTime, totalUnfocusTime) => {
    try {
      const response = await fetch('http://localhost/scholarwatch/insertGazeTracking.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ FocusTime: totalFocusTime, UnfocusTime: totalUnfocusTime }),
      });

      const data = await response.json();
      // console.log('Server Response:', data);
    } catch (error) {
      console.error('Error sending gaze tracking data:', error);
    }
  };

  return (
    <div className="lectures-container" ref={lecturesRef}>
      <div className="lectures-content">
        <h2>Lectures</h2>

        {selectedLecture === "" ? (
          <p style={{ color: 'gray' }}>No lectures to attend.</p>
        ) : (
          <>
            {cameraPermission === false && (
              <p style={{ color: 'red' }}>Please allow access to your camera to use gaze tracking.</p>
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
              <p style={{ color: 'orange' }}>Please complete calibration before starting the lecture.</p>
            )}

            {makeQuiz && (
              <p style={{ color: 'red', fontWeight: 'bold' }}>
                There will be a quiz for this lecture. After finishing, go to <strong>Quizzes</strong> to take it.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Lectures;
