import React, { useEffect, useRef } from 'react';

function PostureDetection() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const container = document.querySelector('.main-container');
    const isWideScreen = window.innerWidth > 768;
    document.documentElement.style.setProperty('--dynamic-height', isWideScreen ? '75vh' : '75vh');


    const handlePostMessage = (event) => {
      if (event.data.postureData) {
        console.log('Posture Data:', event.data.postureData);

        // Handle the posture data as needed
        // Example: Display it or store it in state
        const {
          totalSessionTime,
          goodPostureTime,
          durations: { noPerson, phoneUse, lookingRight, lookingLeft, slouching },
        } = event.data.postureData;

        console.log(`Total Time: ${totalSessionTime}s`);
        console.log(`Good Posture Time: ${goodPostureTime}s`);
        console.log(`No Person Time: ${noPerson}s`);
        console.log(`Phone Use Time: ${phoneUse}s`);
        console.log(`Looking Right Time: ${lookingRight}s`);
        console.log(`Looking Left Time: ${lookingLeft}s`);
        console.log(`Slouching Time: ${slouching}s`);
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
        ref={iframeRef}
        src="/iframe.html"
        title="Posture Detection"
      />
    </div>
  );
}

export default PostureDetection;
