import React from 'react';

const Results = ({ emotionResults }) => { // Destructure results from props
  const { awake_time, drowsy_time } = emotionResults; // Use the correct keys

  return (
    <div>
      <h2>Detection Results</h2>
      <p>Time Awake: {(awake_time * 10).toFixed(2)} seconds</p>
      <p>Time Drowsy: {(drowsy_time * 10).toFixed(2)} seconds</p>
    </div>
  );
};

export default Results;
