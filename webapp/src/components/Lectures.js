import React, { useEffect, useRef, useState } from 'react';
import GazeTracking from './GazeTracking';
import PDFViewer from './PDFViewer';

function Lectures({ isCalibrated, setIsCalibrated, setGazeResults }) {
  const [cameraPermission, setCameraPermission] = useState(true);
  const [uploadedFile, setUploadFile] = useState(null);
  const lecturesRef = useRef(null); // Create a ref for the Lectures component

  useEffect(() => {
    const checkCameraSupport = () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermission(false);
      }
    };

    checkCameraSupport();
  }, []);

  // Function to send gaze tracking data to the server
  const sendGazeDataToServer = async (focusTime, unfocusTime) => {
    try {
      const response = await fetch('http://localhost/scholarwatch/insertGazeTracking.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          FocusTime: focusTime,
          UnfocusTime: unfocusTime
        })
      });

      const data = await response.json();
      console.log('Server Response:', data);
    } catch (error) {
      console.error('Error sending gaze tracking data:', error);
    }
  };

  return (
    <div className="lectures-container" ref={lecturesRef}>
      <div className="lectures-content">
        <h2>Lectures</h2>

        {cameraPermission === null && <p>Checking camera permission...</p>}

        {cameraPermission === false && (
          <p style={{ color: 'red' }}>
            Please allow access to your camera to use the gaze tracking feature for lectures.
          </p>
        )}

        {cameraPermission === true && (
          <GazeTracking 
            isCalibrated={isCalibrated} 
            setIsCalibrated={setIsCalibrated} 
            lecturesRef={lecturesRef}
            setGazeResults={(focusTime, unfocusTime) => {
              sendGazeDataToServer(focusTime, unfocusTime); // Store values in the database
            }}
          />
        )}

        {isCalibrated ? (
          <PDFViewer pdfFile={uploadedFile} />
        ) : (
          <p style={{ color: 'orange' }}>Please complete calibration before uploading a PDF.</p>
        )}
      </div>
    </div>
  );
}

export default Lectures;