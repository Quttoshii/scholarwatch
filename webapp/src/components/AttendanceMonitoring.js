import React from 'react';

function AttendanceMonitoring({ results, gazeResults, thresholdUnfocused, thresholdDrowsy }) {


  const totalLectureTime = 60; 
  
  
  const isAbsentDueToUnfocus = gazeResults.unfocused_time > thresholdUnfocused;   // checks for Attendance
  
  const isAbsentDueToDrowsiness = results.drowsy_time > thresholdDrowsy;

  const isPresent = !isAbsentDueToUnfocus && !isAbsentDueToDrowsiness;

  return (

    <div>
      <h2>Attendance Monitoring</h2>
      <p>Total Lecture Time: {totalLectureTime} minutes</p>
      <p>Unfocused Time: {gazeResults.unfocused_time} minutes</p>
      <p>Drowsy Time: {results.drowsy_time} minutes</p>
      <p>Attendance Status: {isPresent ? "Present" : "Absent"}</p>
    </div>

    

 
  );
}

export default AttendanceMonitoring;