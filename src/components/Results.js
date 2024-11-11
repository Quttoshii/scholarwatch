import React from 'react';

const Results = ({ results }) => { // Destructure results from props
  const { awake_time, drowsy_time } = results; // Use the correct keys

  return (
    <div>
      <h2>Detection Results</h2>
      <p>Time Awake: {awake_time.toFixed(2)} seconds</p>
      <p>Time Drowsy: {drowsy_time.toFixed(2)} seconds</p>
    </div>
  );
};

export default Results;
