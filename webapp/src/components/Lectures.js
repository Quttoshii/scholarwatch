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

  return (
    <div className="lectures-container" ref={lecturesRef}> {/* Attach the ref here */}
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
            lecturesRef={lecturesRef} // Pass the ref to GazeTracking
            setGazeResults={setGazeResults}
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
