import React, { useState } from 'react';

function AttendanceMonitoring({ emotionResults, gazeResults, postureResults }) {
  const [weights, setWeights] = useState({
    focus: 0.5,
    awake: 0.3,
    drowsy: -0.1,
    unfocused: -0.1,
    goodPosture: 0.2,
    slouching: -0.3,
    phoneUse: -0.2,
    noPersonTime: -0.4,
    lookingRight: 0.1,
    lookingLeft: 0.1
  });

  const [threshold, setThreshold] = useState(0.5);

  const totalLectureTime = postureResults.total_time + gazeResults.focused_time + gazeResults.unfocused_time + (emotionResults.awake_time * 10) + (emotionResults.drowsy_time* 10);

  const presenceScore = (
    (weights.focus * gazeResults.focused_time) +
    (weights.awake * (emotionResults.awake_time* 10)) +
    (weights.drowsy * (emotionResults.drowsy_time* 10)) +
    (weights.unfocused * gazeResults.unfocused_time) +
    (weights.goodPosture * postureResults.good_posture_time) +
    (weights.slouching * postureResults.slouching_time) +
    (weights.phoneUse * postureResults.phone_use_time) +
    (weights.noPersonTime * postureResults.no_person_time) +
    (weights.lookingRight * postureResults.looking_right_time) +
    (weights.lookingLeft * postureResults.looking_left_time)
  ) / totalLectureTime;

  const isPresent = presenceScore >= threshold;

  const handleWeightChange = (e) => {
    const { name, value } = e.target;
    setWeights((prevWeights) => ({ ...prevWeights, [name]: parseFloat(value) }));
  };

  const handleThresholdChange = (e) => {
    setThreshold(parseFloat(e.target.value));
  };

  return (
    <div className="attendance-container">
      <h2>Attendance Monitoring</h2>

      <div className="grid-container">
        <div className="weights-section">
          <h3>Adjust Weights</h3>
          {Object.keys(weights).map((key) => (
            <label className="monitoring-label" key={key}>
              {key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Weight:
              <input
                type="number"
                name={key}
                value={weights[key]}
                onChange={handleWeightChange}
                step="0.1"
              />
            </label>
          ))}
        </div>

        <div className="centered-section">
          <h3>Lecture Details</h3>
          <p><b>Total Lecture Time:</b> {(totalLectureTime / 60).toFixed(2)} minutes</p>
          <p><b>Focused Time:</b> {(gazeResults.focused_time / 60).toFixed(2)} minutes</p>
          <p><b>Unfocused Time:</b> {(gazeResults.unfocused_time / 60).toFixed(2)} minutes</p>
          <p><b>Awake Time:</b> {((emotionResults.awake_time* 10) / 60).toFixed(2)} minutes</p>
          <p><b>Drowsy Time:</b> {((emotionResults.drowsy_time* 10) / 60).toFixed(2)} minutes</p>
          <p><b>Good Posture Time:</b> {(postureResults.good_posture_time / 60).toFixed(2)} minutes</p>
          <p><b>Slouching Time:</b> {(postureResults.slouching_time / 60).toFixed(2)} minutes</p>
          <p><b>Phone Use Time:</b> {(postureResults.phone_use_time / 60).toFixed(2)} minutes</p>
          <p><b>No Person Time:</b> {(postureResults.no_person_time / 60).toFixed(2)} minutes</p>
          <p><b>Looking Right Time:</b> {(postureResults.looking_right_time / 60).toFixed(2)} minutes</p>
          <p><b>Looking Left Time:</b> {(postureResults.looking_left_time / 60).toFixed(2)} minutes</p>
        </div>


        <div className="threshold-section">
          <h3>Adjust Threshold</h3>
          <label className="monitoring-label">
            Threshold:
            <input
              type="number"
              value={threshold}
              onChange={handleThresholdChange}
              step="0.1"
            />
          </label>
          <p>Presence Score: {presenceScore.toFixed(2)}</p>
          <p style={{ color: isPresent ? 'green' : 'red' }}>
            Attendance Status: {isPresent ? 'Present' : 'Absent'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AttendanceMonitoring;
