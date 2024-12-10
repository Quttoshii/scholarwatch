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
        window.webgazer.showVideo(true);
        window.webgazer.showFaceOverlay(false);
        window.webgazer.showPredictionPoints(true);
        window.webgazer.showFaceFeedbackBox(false);
        setIsWebGazerReady(true);

        // Apply styles to WebGazer elements inside the `lectures-content` container
        const styleWebGazerElements = () => {
          const videoContainer = document.getElementById('webgazerVideoContainer');
          const videoElement = document.getElementById('webgazerVideoFeed');
          const faceOverlay = document.getElementById('webgazerFaceOverlay');
          const faceFeedbackBox = document.getElementById('webgazerFaceFeedbackBox'); // Bounding box
          const lecturesContent = document.querySelector('.lectures-content'); // Get the lectures content container
          
          console.log("videoContainer", videoContainer);
          console.log("videoElement", videoElement);
          console.log("faceOverlay", faceOverlay);
          console.log("faceFeedbackBox", faceFeedbackBox);
          console.log("lecturesContent", lecturesContent);

          if (videoContainer && lecturesContent) {
            videoContainer.style.position = 'absolute';
            videoContainer.style.top = '10px'; // Adjust as necessary
            videoContainer.style.right = '10px'; // Adjust as necessary
            videoContainer.style.width = '150px';
            videoContainer.style.height = '100px';
            // videoContainer.style.border = '2px solid rgba(0, 255, 0, 0.5)';
            videoContainer.style.borderRadius = '5px';
            videoContainer.style.transform = 'scaleX(-1)'; // Mirror the video feed
            videoContainer.style.zIndex = '999'; // Ensure it is below the buttons
            videoContainer.style.pointerEvents = 'none'; // Prevent interaction with the video

            // Append WebGazer's video container inside the lectures content container
            lecturesContent.appendChild(videoContainer);
          }

          if (videoElement && lecturesContent) {
            // Position the WebGazer video inside the lectures-content container
            videoElement.style.position = 'absolute';
            videoElement.style.top = '10px'; // Adjust as necessary
            videoElement.style.right = '10px'; // Adjust as necessary
            videoElement.style.width = '150px';
            videoElement.style.height = '100px';
            // videoElement.style.border = '2px solid rgba(0, 255, 0, 0.5)';
            videoElement.style.borderRadius = '5px';
            videoElement.style.transform = 'scaleX(-1)'; // Mirror the video feed
            videoElement.style.zIndex = '999'; // Ensure it is below the buttons
            videoElement.style.pointerEvents = 'none'; // Prevent interaction with the video

            // Append WebGazer's video feed inside the lectures content container
            lecturesContent.appendChild(videoElement);
          }

          if (faceOverlay && lecturesContent) {
            // Adjust the bounding box (face overlay) inside the container
            faceOverlay.style.position = 'absolute';
            faceOverlay.style.top = '10px'; // Adjust as necessary
            faceOverlay.style.right = '10px'; // Adjust as necessary
            faceOverlay.style.width = '150px';
            faceOverlay.style.height = '100px';
            faceOverlay.style.pointerEvents = 'none'; // Prevent interaction with the overlay
            faceOverlay.style.zIndex = '1000'; // Ensure it is below the buttons
            faceOverlay.style.pointerEvents = 'none'; // Prevent interaction with the box

            // Append the face overlay inside the lectures content container
            lecturesContent.appendChild(faceOverlay);
          }

          if (faceFeedbackBox && lecturesContent) {
            // Move the face feedback box (bounding box) to match the video feed position
            const videoRect = videoElement.getBoundingClientRect();
            const lecturesRect = lecturesContent.getBoundingClientRect();

            // Calculate the offset and size to center the feedback box
            const boundingBoxWidth = videoRect.width * 0.6;
            const boundingBoxHeight = videoRect.height * 0.6;
            const boundingBoxTop = videoRect.top - lecturesRect.top + (videoRect.height - boundingBoxHeight) / 2;
            const boundingBoxLeft = videoRect.left - lecturesRect.left + (videoRect.width - boundingBoxWidth) / 2;

            faceFeedbackBox.style.position = 'absolute';
            faceFeedbackBox.style.top = `${boundingBoxTop}px`;
            faceFeedbackBox.style.left = `${boundingBoxLeft}px`;
            faceFeedbackBox.style.width = `${boundingBoxWidth}px`;
            faceFeedbackBox.style.height = `${boundingBoxHeight}px`;
            faceFeedbackBox.style.border = '2px solid red';
            faceFeedbackBox.style.zIndex = '1001'; // Ensure it is below the buttons
            faceFeedbackBox.style.pointerEvents = 'none'; // Prevent interaction with the box

            // Append the face feedback box inside the lectures content container
            lecturesContent.appendChild(faceFeedbackBox);
          }
        };

        // Delay to ensure WebGazer elements are loaded into the DOM
        setTimeout(styleWebGazerElements, 1000); // Adjust the delay if necessary
      }
    };

    initializeWebGazer();

    return () => {
      if (window.webgazer) {
        try {
          const videoElement = document.getElementById('webgazerVideoFeed');
          const faceOverlay = document.getElementById('webgazerFaceOverlay');
          const faceFeedbackBox = document.getElementById('webgazerFaceFeedbackBox');
          const videoContainer = document.getElementById('webgazerVideoContainer');
          
          if (videoElement && videoElement.srcObject) {
            const tracks = videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
          }

          if (videoElement) videoElement.remove(); // Remove video
          if (faceOverlay) faceOverlay.remove(); // Remove face overlay
          if (faceFeedbackBox) faceFeedbackBox.remove(); // Remove feedback box
          if (videoContainer) videoContainer.remove();

          window.webgazer.clearGazeListener();
          window.webgazer.showPredictionPoints(false);
          window.webgazer.pause();

          // window.webgazer.end();
          // window.webgazer.stopVideo();
        } catch (error) {
          console.log('Stopping WebGazer', error);
        }


        // // Send data when component unmounts
        // fetch("http://localhost/scholarwatch/insertGazeTracking.php", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ 
        //     title: "Sample Lecture", 
        //     description: "Lecture description",
        //     focusTime: focusTime,
        //     unfocusTime: unfocusTime
        //   }),
        // })
        // .then(response => response.json())
        // .then(data => console.log("Lecture inserted:", data))
        // .catch(error => console.error("Error inserting lecture:", error));
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

  // Focus detection logic
  const startFocusTracking = () => {
    window.webgazer.setGazeListener((data) => {
      if (data == null) {
        setIsFocused(false);
        return;
      }

      const { x, y } = data;
      if (lecturesRef.current) {
        const boundingBox = lecturesRef.current.getBoundingClientRect();
        const isInBoundingBox =
          x >= boundingBox.left &&
          x <= boundingBox.right &&
          y >= boundingBox.top &&
          y <= boundingBox.bottom;
        setIsFocused(isInBoundingBox);
      }
    }).begin();
  };

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
