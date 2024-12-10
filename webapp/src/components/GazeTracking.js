import React, { useEffect, useState } from 'react';


function GazeTracking({ isCalibrated, setIsCalibrated, lecturesRef, setGazeResults }) {
  const [isWebGazerReady, setIsWebGazerReady] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [isCalibrating, setIsCalibrating] = useState(!isCalibrated);
  const [clickCount, setClickCount] = useState(0);
  const [currentDotIndex, setCurrentDotIndex] = useState(0);
  const [focusTime, setFocusTime] = useState(0);
  const [unfocusTime, setUnfocusTime] = useState(0);

  const dotPositions = [
    { top: 5, left: 5 },
    { top: 5, left: 50 },
    { top: 5, left: 95 },
    { top: 50, left: 5 },
    { top: 50, left: 50 },
    { top: 50, left: 95 },
    { top: 95, left: 5 },
    { top: 95, left: 50 },
    { top: 95, left: 95 },
  ];

  useEffect(() => {
    
    const initializeWebGazer = () => {
      if (window.webgazer) {
        // console.log(isCalibrated);
        // if (isCalibrated) {

        //   window.webgazer = window.webgazer.resume();
        // }

        window.webgazer.showVideo(true);
        window.webgazer.showFaceOverlay(false);
        window.webgazer.showPredictionPoints(true);
        window.webgazer.showFaceFeedbackBox(false);
        setIsWebGazerReady(true);
    
        const styleWebGazerElements = () => {
          const videoContainer = document.getElementById('webgazerVideoContainer');
          const videoElement = document.getElementById('webgazerVideoFeed');
          const videoCanvas = document.getElementById('webgazerVideoCanvas');
          
          const lecturesContent = document.querySelector('.lectures-content'); // Get the lectures content container
    
          if (videoContainer && lecturesContent) {
            videoContainer.style.position = 'absolute';
            videoContainer.style.top = '20px'; // Align with top padding of lectures-content
            videoContainer.style.left = '80%'; // Align with left padding of lectures-content
            videoContainer.style.width = '200px'; // Slightly increased width
            videoContainer.style.height = '150px'; // Slightly increased height
            videoContainer.style.borderRadius = '8px';
            videoContainer.style.transform = 'scaleX(-1)'; // Mirror the video feed
            videoContainer.style.zIndex = '10';
            videoContainer.style.pointerEvents = 'none'; // Prevent interaction with the video
            videoContainer.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; // Optional: add a subtle shadow
            
            lecturesContent.appendChild(videoContainer);
          }
          
          if (videoElement && videoContainer) {
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.style.objectFit = 'cover'; // Ensures video fills container while maintaining aspect ratio
            videoElement.style.borderRadius = '8px';
            videoElement.style.transform = 'scaleX(-1)';
            
            videoContainer.appendChild(videoElement);
          }
          
          if (videoCanvas && videoContainer) {
            videoCanvas.style.width = '100%';
            videoCanvas.style.height = '100%';
            videoCanvas.style.objectFit = 'cover';
            videoCanvas.style.borderRadius = '8px';
            videoCanvas.style.transform = 'scaleX(-1)';
            
            videoContainer.appendChild(videoCanvas);
          }
        };
    
        const waitForElements = () => {
          const videoContainer = document.getElementById('webgazerVideoContainer');
          const videoElement = document.getElementById('webgazerVideoFeed');
          const lecturesContent = document.querySelector('.lectures-content');
          const videoCanvas = document.getElementById('webgazerVideoCanvas');
    
          if (videoContainer && videoElement && lecturesContent && videoCanvas) {
            styleWebGazerElements();
          } else {
            requestAnimationFrame(waitForElements); // Check again on the next animation frame
          }
        };
    
        requestAnimationFrame(waitForElements); // Start checking for elements
      }
    };
    

    initializeWebGazer();

    return () => {
      if (window.webgazer) {
        try {
          const webgazerGazeDot = document.getElementById('webgazerGazeDot');

          if (webgazerGazeDot) webgazerGazeDot.remove();

          window.webgazer.clearGazeListener();
          window.webgazer.showPredictionPoints(false);
          window.webgazer.pause();

          // window.webgazer.end();
          window.webgazer.stopVideo();
        } catch (error) {
          console.log('Stopping WebGazer', error);
        }

      }
    };
  }, []);

  useEffect(() => {
    if (isWebGazerReady) {
      if (!isCalibrating) {
        window.webgazer.showPredictionPoints(true); // Show the tracker dot
        window.webgazer.resume(); // Resume gaze tracking
        // console.log("calibration completed: ", isCalibrating)
      } else {
        startCalibration();
        // console.log("calibration in process: ", isCalibrating)
      }
    }
  }, [isWebGazerReady, isCalibrating]);

  // Track focus/unfocus time every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (isFocused) {
        setFocusTime((prev) => prev + 1);
      } else {
        setUnfocusTime((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isFocused]);

  // Update gazeResults in the global state
  useEffect(() => {
    setGazeResults({ focused_time: focusTime, unfocused_time: unfocusTime });
  }, [focusTime, unfocusTime, setGazeResults]);

  const startCalibration = () => {
    window.webgazer.setGazeListener((data) => {
      if (data == null) {
        setIsFocused(false);
        return;
      }
  
      const { x, y } = data;
  
      // Check if the user's gaze is within the bounding box of the Lectures component
      if (lecturesRef.current) {
        const boundingBox = lecturesRef.current.getBoundingClientRect();
        const isInBoundingBox = (
          x >= boundingBox.left && x <= boundingBox.right &&
          y >= boundingBox.top && y <= boundingBox.bottom
        );
        setIsFocused(isInBoundingBox);
      }
    }).begin();
  };

  const handleDotClick = () => {
    setClickCount((prevCount) => prevCount + 1);
    if (clickCount + 1 >= 5) {
      setClickCount(0);
      if (currentDotIndex + 1 < dotPositions.length) {
        setCurrentDotIndex((prevIndex) => prevIndex + 1);
      } else {
        setIsCalibrating(false);
        setIsCalibrated(true);
      }
    }
  };

  return (
    <div className="gaze-tracking-full">
      {isCalibrating ? (
        <>
          <h3>Calibration in Progress</h3>
          <p>{`Click count: ${clickCount}/5`}</p>
          <div
            className="calibration-dot"
            onClick={handleDotClick}
            style={{
              position: 'fixed',
              width: '15px',
              height: '15px',
              backgroundColor: 'red',
              borderRadius: '50%',
              top: `${dotPositions[currentDotIndex].top}vh`,
              left: `${dotPositions[currentDotIndex].left}vw`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: 1000,
            }}
          />
        </>
      ) : (
        <>
          <p>Gaze tracking is active. Please focus on the content.</p>
          <p style={{ color: isFocused ? 'green' : 'red' }}>
            {isFocused ? 'You are focusing on the content.' : 'You are looking away!'}
          </p>
        </>
      )}
    </div>
  );
}

export default GazeTracking;
