// LiveFeed.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LiveFeed.css';

const LiveFeed = ({ setEmotionResults }) => {
  const navigate = useNavigate();
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const detectionInterval = useRef(null);
  const stopRequested = useRef(false);

  // Cleanup function to ensure detection is stopped when component unmounts
  useEffect(() => {
    return () => {
      if (isDetecting) {
        stopEmotionDetection();
      }
    };
  }, [isDetecting]);

  const startEmotionDetection = async () => {
    if (stopRequested.current) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Check if detection is already running
      const statusResponse = await axios.get('http://localhost:8000/detection_status');
      if (statusResponse.data.is_detecting) {
        setError("Detection is already running");
        return;
      }

      // Start the detection process
      const response = await axios.post('http://localhost:8000/start_detection', {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setIsDetecting(true);
        stopRequested.current = false;
        
        // Set up interval to check detection status
        detectionInterval.current = setInterval(async () => {
          try {
            const statusResponse = await axios.get('http://localhost:8000/detection_status');
            if (!statusResponse.data.is_detecting) {
              if (!stopRequested.current) {
                stopEmotionDetection();
              }
            }
          } catch (error) {
            console.error("Error checking detection status:", error);
            if (!stopRequested.current) {
              stopEmotionDetection();
            }
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error starting detection:", error);
      setError(error.response?.data?.detail || "Failed to start emotion detection. Please try again.");
      setIsDetecting(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopEmotionDetection = async () => {
    if (!isDetecting || stopRequested.current) return;

    try {
      stopRequested.current = true;
      setIsLoading(true);
      setError(null);
      
      // Clear the detection interval
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
      }

      // Stop the detection
      const stopResponse = await axios.post('http://localhost:8000/stop_detection', {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (stopResponse.data && stopResponse.data.results) {
        // Update the results
        setEmotionResults(stopResponse.data.results);
        
        // Reset detection state
        setIsDetecting(false);
        
        // Navigate to results page
        navigate('/results');
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error stopping detection:", error);
      setError(error.response?.data?.detail || "Failed to stop emotion detection. Please try again.");
      
      // Force reset detection state if stop fails
      setIsDetecting(false);
    } finally {
      setIsLoading(false);
      stopRequested.current = false;
    }
  };

  // Handle window unload to ensure detection is stopped
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDetecting) {
        stopEmotionDetection();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, [isDetecting]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isDetecting) {
        stopEmotionDetection();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDetecting]);

  return (
    <div className="emotion-detection-container">
      <h2>Emotion Detection</h2>
      <div className="emotion-btn-group">
        <button 
          className={`emotion-btn start ${isDetecting || isLoading ? 'disabled' : ''}`}
          onClick={startEmotionDetection} 
          disabled={isDetecting || isLoading}
        >
          {isLoading && !isDetecting ? 'Starting...' : 'Start Detection'}
        </button>
        <button 
          className={`emotion-btn stop ${!isDetecting || isLoading ? 'disabled' : ''}`}
          onClick={stopEmotionDetection} 
          disabled={!isDetecting || isLoading}
        >
          {isLoading && isDetecting ? 'Stopping...' : 'Stop Detection'}
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
      {isDetecting && <p className="detection-status">Detecting emotions...</p>}
    </div>
  );
};

export default LiveFeed;
