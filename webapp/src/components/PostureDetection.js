import React, { useEffect, useRef } from 'react';

function PostureDetection({ setPostureResults }) {
  const postureDetectionRef = useRef(null);

  useEffect(() => {
    const handlePostMessage = (event) => {
      if (event.data.postureData) {
        console.log('Posture Data:', event.data.postureData);

        // Posture data 
        const {
          totalSessionTime,
          goodPostureTime,
          durations: { noPerson, phoneUse, lookingRight, lookingLeft, slouching },
        } = event.data.postureData;

        const postureResults = {
          SessionID: 1,
          GoodPostureTime: goodPostureTime,
          SlouchingTime: slouching,
          LookingLeftTime: lookingLeft,
          LookingRightTime: lookingRight,
          UsingPhoneTime: phoneUse
        };

        console.log("Sending Posture Data to Backend:", JSON.stringify(postureResults));

        setPostureResults(postureResults);

        // Send data to PHP backend for storage
        fetch('http://localhost/local/scholarwatch/api/insertPostureDetection.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postureResults),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
          })
          .then((text) => {
            try {
              const data = JSON.parse(text);
              if (data.status === 'success') {
                console.log('Posture data stored successfully.');
              } else {
                console.error('Error storing posture data:', data.message);
              }
            } catch (error) {
              console.error('Invalid JSON response:', text);
            }
          })
          .catch((error) => {
            console.error('Fetch error:', error);
          });
      }
    };

    window.addEventListener('message', handlePostMessage);

    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, []);

  // Helper to send a message to the iframe
  const sendToIframe = (msg) => {
    if (postureDetectionRef.current && postureDetectionRef.current.contentWindow) {
      postureDetectionRef.current.contentWindow.postMessage(msg, '*');
    }
  };

  return (
    <div className="posture-video-page">
      <iframe
        ref={postureDetectionRef}
        src="/postureDetection.html"
        title="Posture Detection"
        className="posture-iframe-large"
        allow="camera"
      />
      <div className="posture-btn-group no-card">
        <button className="posture-btn start" onClick={() => sendToIframe('startLecture')}>Start Lecture</button>
        <button className="posture-btn end" onClick={() => sendToIframe('endLecture')}>End Lecture</button>
      </div>
    </div>
  );
}

export default PostureDetection;