import React, { useEffect, useRef } from 'react';

function PostureDetection({ setPostureResults }) {
  const postureDetectionRef = useRef(null);

  useEffect(() => {
    const container = document.querySelector('.main-container');
    const isWideScreen = window.innerWidth > 768;
    document.documentElement.style.setProperty('--dynamic-height', isWideScreen ? '85vh' : '85vh');

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

        console.log("Sending Posture Data to Backend:", JSON.stringify(postureResults)); // Debugging log

        setPostureResults(postureResults);

        // Send data to PHP backend for storage
        fetch('http://localhost/scholarwatch/insertPostureDetection.php', {
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
            return response.text(); // Get raw response first
          })
          .then((text) => {
            try {
              const data = JSON.parse(text); // Try parsing JSON
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
      document.documentElement.style.setProperty('--dynamic-height', '');
    };

  }, []);

  return (
    <div id="posture-detection-container" className="postureDetection">
      <h2>Posture Detection</h2>
      <iframe
        ref={postureDetectionRef}
        src="/postureDetection.html"
        title="Posture Detection"
      />
    </div>
  );
}

export default PostureDetection;