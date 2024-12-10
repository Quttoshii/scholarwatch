import React, { useEffect, useRef } from 'react';

function PostureDetection() {
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
        ref={postureDetectionRef}
        src="/postureDetection.html"
        title="Posture Detection"
      />
    </div>
  );
}

export default PostureDetection;
