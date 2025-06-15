import React, { useEffect, useState, useMemo } from 'react';
import { Pie, Line, Bar, Bubble } from 'react-chartjs-2'; 

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';
// eslint-disable-next-line no-use-before-define
import Plot from 'react-plotly.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement
);

// Updated attendance data structure to include courses
const attendanceData = {
  English: {
    '2024-11-01': { present: 20, absent: 5 },
    '2024-11-02': { present: 18, absent: 7 },
    '2024-11-03': { present: 22, absent: 3 },
    // Add more dates as needed
  },
  History: {
    '2024-11-01': { present: 15, absent: 10 },
    '2024-11-02': { present: 17, absent: 8 },
    '2024-11-03': { present: 14, absent: 11 },
    // Add more dates as needed
  },
  // Add more courses as needed
};

const Insights = ({
  results,
  gazeResults,
  invalidationCount,
  totalStudents,
  emotionResults,
}) => {
  const [data, setData] = useState({
    totalStudents: 0,
    totalLectures: 0,
    invalidationCount: 0,
    emotions: { awake_time: 0, drowsy_time: 0 },
    attention: { focused_time: 0, unfocused_time: 0 },
  });
  const [selectedCourse, setSelectedCourse] = useState('English');
  const [selectedQuiz, setSelectedQuiz] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState({ present: 0, absent: 0 });

  // THEME COLORS
  const THEME_ORANGE = '#f6a523';
  const THEME_DARK = '#2C1810';
  const THEME_GOLD = '#ffe5b4';
  const THEME_PEACH = '#fffbe9';

  useEffect(() => {
    fetch('http://localhost/local/scholarwatch/api/fetchTeacherInsights.php', {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((resData) => {
        const course = resData.courses?.[0] || {};
        const emotions = course.emotions || { awake_time: 0, drowsy_time: 0 };
        const attention = course.attention || { focused_time: 0, unfocused_time: 0 };

        setData({
          totalStudents: resData.all_students ?? 0,
          totalLectures: resData.total_lectures, 
          invalidationCount: resData.invalidation_count,
          emotions,
          attention,
        });
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  const slideData = {
    English: [15, 25, 10, 15, 20],
    History: [10, 18, 12, 20, 14],
  };

  const averageTimeData = {
    labels: ['January', 'February', 'March', 'April', 'June'],
    datasets: [
      {
        label: 'English',
        data: [15, 20, 25, 18, 22],
        borderColor: THEME_ORANGE,
        backgroundColor: 'rgba(246, 165, 35, 0.18)',
        fill: true,
      },
      {
        label: 'History',
        data: [10, 18, 20, 15, 17],
        borderColor: THEME_DARK,
        backgroundColor: 'rgba(44, 24, 16, 0.13)',
        fill: true,
      },
    ],
  };

  const quizData = {
    1: [60, 65, 75, 80, 90],
    2: [70, 75, 80, 85, 92],
  };

  const lectureViewData = {
    labels: ['Viewed Lectures', 'Not Viewed'],
    datasets: [
      {
        data: [25, 15],
        backgroundColor: [THEME_ORANGE, THEME_GOLD],
        borderColor: [THEME_ORANGE, THEME_GOLD],
        borderWidth: 1,
      },
    ],
  };

  const insights = [
    {
      title: 'Emotions',
      data: [
        {
          name: 'Awake',
          value: data.emotions?.awake_time ?? emotionResults.awake_time,
        },
        {
          name: 'Drowsy',
          value: data.emotions?.drowsy_time ?? emotionResults.drowsy_time,
        },
      ],
      chartType: 'bar',
    },
    {
      title: 'Attention',
      data: [
        {
          name: 'Focused',
          value: data.attention?.focused_time ?? gazeResults.focused_time,
        },
        {
          name: 'Unfocused',
          value: data.attention?.unfocused_time ?? gazeResults.unfocused_time,
        },
      ],
      chartType: 'doughnut',
    },
  ];


  const createChartData = (data) => ({
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: 'Time (minutes)',
        data: data.map((d) => d.value),
        backgroundColor: [THEME_ORANGE, THEME_GOLD],
        borderColor: [THEME_ORANGE, THEME_GOLD],
        borderWidth: 1,
      },
    ],
  });

  const averageTimePerSlideData = {
    labels: ['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4', 'Slide 5'],
    datasets: [
      {
        label: 'Average Time (minutes)',
        data: slideData[selectedCourse],
        backgroundColor: THEME_ORANGE,
        borderColor: THEME_ORANGE,
        borderWidth: 2,
      },
    ],
  };

  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const courseAttendanceData = attendanceData[selectedCourse] || {};
    const attendanceInfo =
      courseAttendanceData[dateString] || { present: 0, absent: 0 };
    setAttendance(attendanceInfo);
  }, [selectedCourse, selectedDate]);

  const selectedQuizData = quizData[selectedQuiz];

  // --- Dashboard Cards Data ---
  const statsCards = useMemo(() => [
    { label: 'Total Courses', value: 2 }, // TODO: Make dynamic if you have course count
    { label: 'Total Students', value: data.totalStudents },
    { label: 'Total Lectures', value: data.totalLectures },
    { label: 'Quiz Invalidations', value: data.invalidationCount },
  ], [data]);

  // --- Dynamic Pie Chart: Viewed vs Not Viewed Lectures ---
  const lectureViewPieData = useMemo(() => ({
    labels: ['Viewed Lectures', 'Not Viewed'],
    datasets: [
      {
        data: [25, 15], // TODO: Replace with dynamic value
        backgroundColor: [THEME_ORANGE, THEME_GOLD],
        borderColor: [THEME_ORANGE, THEME_GOLD],
        borderWidth: 1,
      },
    ],
  }), [THEME_ORANGE, THEME_GOLD]);

  // --- Dynamic Bar Chart: Quiz Scores ---
  const quizScoreData = useMemo(() => ({
    labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'],
    datasets: [
      {
        label: 'Quiz Scores',
        data: [60, 65, 75, 80, 90], // TODO: Replace with dynamic values
        backgroundColor: THEME_ORANGE,
        borderColor: THEME_ORANGE,
        borderWidth: 1,
      },
    ],
  }), [THEME_ORANGE]);

  // --- Dynamic Doughnut Chart: Attention ---
  const attentionDoughnutData = useMemo(() => ({
    labels: ['Focused', 'Unfocused'],
    datasets: [
      {
        data: [data.attention?.focused_time ?? 0, data.attention?.unfocused_time ?? 0],
        backgroundColor: [THEME_ORANGE, THEME_GOLD],
        borderWidth: 1,
      },
    ],
  }), [data.attention, THEME_ORANGE, THEME_GOLD]);

  // --- Dynamic Bar Chart: Emotions ---
  const emotionBarData = useMemo(() => ({
    labels: ['Awake', 'Drowsy'],
    datasets: [
      {
        label: 'Time (minutes)',
        data: [data.emotions?.awake_time ?? 0, data.emotions?.drowsy_time ?? 0],
        backgroundColor: [THEME_ORANGE, THEME_GOLD],
        borderColor: [THEME_ORANGE, THEME_GOLD],
        borderWidth: 1,
      },
    ],
  }), [data.emotions, THEME_ORANGE, THEME_GOLD]);

  // --- Dynamic Line Chart: Average Time Spent Reading Lectures ---
  const averageTimeLineData = useMemo(() => ({
    labels: ['January', 'February', 'March', 'April', 'June'],
    datasets: [
      {
        label: 'English',
        data: [15, 20, 25, 18, 22], // TODO: Replace with dynamic values
        borderColor: THEME_ORANGE,
        backgroundColor: 'rgba(246, 165, 35, 0.18)',
        fill: true,
      },
      {
        label: 'History',
        data: [10, 18, 20, 15, 17], // TODO: Replace with dynamic values
        borderColor: THEME_DARK,
        backgroundColor: 'rgba(44, 24, 16, 0.13)',
        fill: true,
      },
    ],
  }), [THEME_ORANGE, THEME_DARK]);

  // Add this style object for chart containers
  const chartContainerStyle = {
    height: '260px',
    maxHeight: '260px',
    minHeight: '220px',
    width: '100%',
    margin: '0 auto',
  };

  return (
    <div style={{ background: THEME_PEACH, minHeight: '100vh', padding: '32px 0' }}>
      <h2 style={{ color: THEME_DARK, fontWeight: 800, fontSize: '2rem', marginBottom: '32px', letterSpacing: '1px', textAlign: 'center' }}>Insights Dashboard</h2>
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '4fr 1fr', gap: '32px', alignItems: 'flex-start', padding: '0 24px' }}>
        <div className="main-charts" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
          {/* Pie: Viewed vs Not Viewed Lectures */}
          <div className="dashboard-card" style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 8px rgba(246, 166, 35, 0.08)', padding: '22px', textAlign: 'center' }}>
            <h3 style={{ color: THEME_DARK, fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px' }}>Lecture Views</h3>
            <div className="chart-container" style={chartContainerStyle}>
              <Pie data={lectureViewPieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: THEME_DARK, font: { weight: 600 } } } } }} />
            </div>
          </div>
          {/* Bar: Quiz Scores */}
          <div className="dashboard-card" style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 8px rgba(246, 166, 35, 0.08)', padding: '22px', textAlign: 'center' }}>
            <h3 style={{ color: THEME_DARK, fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px' }}>Quiz Scores</h3>
            <div className="chart-container" style={chartContainerStyle}>
              <Bar data={quizScoreData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: THEME_DARK } } }, scales: { x: { grid: { display: false }, title: { display: true, text: 'Quizzes', color: THEME_DARK } }, y: { grid: { display: false }, beginAtZero: true, title: { display: true, text: 'Scores', color: THEME_DARK } } } }} />
            </div>
          </div>
          {/* Doughnut: Attention */}
          <div className="dashboard-card" style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 8px rgba(246, 166, 35, 0.08)', padding: '22px', textAlign: 'center' }}>
            <h3 style={{ color: THEME_DARK, fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px' }}>Attention</h3>
            <div className="chart-container" style={chartContainerStyle}>
              <Pie data={attentionDoughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: THEME_DARK } } }, cutout: '50%' }} />
            </div>
          </div>
          {/* Bar: Emotions */}
          <div className="dashboard-card" style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 8px rgba(246, 166, 35, 0.08)', padding: '22px', textAlign: 'center' }}>
            <h3 style={{ color: THEME_DARK, fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px' }}>Emotions</h3>
            <div className="chart-container" style={chartContainerStyle}>
              <Bar data={emotionBarData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: THEME_DARK } }, y: { grid: { display: false }, beginAtZero: true, ticks: { color: THEME_DARK } } } }} />
            </div>
          </div>
          {/* Line: Average Time Spent Reading Lectures */}
          <div className="dashboard-card wide-chart" style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 8px rgba(246, 166, 35, 0.08)', padding: '22px', textAlign: 'center', gridColumn: 'span 2' }}>
            <h3 style={{ color: THEME_DARK, fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px' }}>Average Time Spent Reading Lectures</h3>
            <div className="chart-container" style={chartContainerStyle}>
              <Line data={averageTimeLineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: THEME_DARK } } }, scales: { x: { grid: { display: false }, title: { display: true, text: 'Months', color: THEME_DARK } }, y: { grid: { display: false }, beginAtZero: true, title: { display: true, text: 'Minutes', color: THEME_DARK } } } }} />
            </div>
          </div>
          {/* Attendance Section */}
          <div className="dashboard-card" style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 8px rgba(246, 166, 35, 0.08)', padding: '22px', textAlign: 'center' }}>
            <h3 style={{ color: THEME_DARK, fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px' }}>Attendance</h3>
            <label style={{ color: THEME_DARK, fontWeight: 600, marginBottom: '8px' }}>Select Date:</label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              style={{ padding: '8px 14px', border: `1.5px solid ${THEME_ORANGE}`, borderRadius: '6px', fontSize: '1rem', background: '#fff', color: THEME_DARK, fontWeight: 500, marginBottom: '10px' }}
            />
            <div className="attendance-numbers" style={{ marginTop: '10px' }}>
              <p style={{ color: THEME_DARK, fontWeight: 700 }}>Present Students: {attendance.present}</p>
              <p style={{ color: THEME_DARK, fontWeight: 700 }}>Absent Students: {attendance.absent}</p>
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="right-section" style={{ display: 'grid', gap: '18px', alignContent: 'start' }}>
          {statsCards.map((card, idx) => (
            <div key={idx} className="dashboard-card compact-card" style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 8px rgba(246, 166, 35, 0.08)', padding: '16px', textAlign: 'center', fontSize: '1rem' }}>
              <h3 style={{ color: THEME_DARK, fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>{card.label}</h3>
              <p style={{ color: THEME_ORANGE, fontWeight: 700, fontSize: '1.1rem' }}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Insights;
