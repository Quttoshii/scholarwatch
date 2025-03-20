// LiveFeed.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LiveFeed = ({ setEmotionResults }) => {
  const navigate = useNavigate();
  const [isDetecting, setIsDetecting] = useState(false);

  const startEmotionDetection = async () => {
    setIsDetecting(true);
    try {
      const response = await axios.post('http://localhost:8000/start_detection/');
      // console.log("Start Detection Response:", response.data);
    } catch (error) {
      console.error("Error starting detection:", error);
      setIsDetecting(false);
    }
  };

  const stopEmotionDetection = async () => {
    try {
      const response = await axios.post('http://localhost:8000/stop_detection/');
      // console.log("Stop Detection Response:", response.data);
      setEmotionResults(response.data.results); // Update results here
      // console.log(response.data.results);
      navigate('/results');
    } catch (error) {
      console.error("Error stopping detection:", error);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div>
      <h2>Emotion Detection</h2>
      <button onClick={startEmotionDetection} disabled={isDetecting}>Start Detection</button>
      <button onClick={stopEmotionDetection} disabled={!isDetecting}>Stop Detection</button>
      {isDetecting && <p>Detecting emotions...</p>}
    </div>
  );
};

export default LiveFeed;
