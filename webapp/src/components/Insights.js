import React, { useEffect, useState } from 'react';
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
        borderColor: '#0671B7',
        backgroundColor: '#0671B7',
        fill: false,
      },
      {
        label: 'History',
        data: [10, 18, 20, 15, 17],
        borderColor: '#e64072',
        backgroundColor: '#e64072',
        fill: false,
      },
    ],
  };

  // Updated quiz data to be arrays of scores for box and whisker plot
  const quizData = {
    1: [60, 65, 75, 80, 90], // Example quiz scores
    2: [70, 75, 80, 85, 92],
  };

  const lectureViewData = {
    labels: ['Viewed Lectures', 'Not Viewed'],
    datasets: [
      {
        data: [25, 15],
        backgroundColor: ['#0671B7', '#e64072'],
        borderColor: ['#0671B7', '#e64072'],
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
          value: emotionResults.awake_time,
        },
        {
          name: 'Drowsy',
          value: emotionResults.drowsy_time,
        },
      ],
      chartType: 'bar',
    },
    {
      title: 'Attention',
      data: [
        {
          name: 'Focused',
          value: gazeResults.focused_time,
        },
        {
          name: 'Unfocused',
          value: gazeResults.unfocused_time,
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
        backgroundColor: ['#0671B7', '#e64072'],
        borderColor: ['#0671B7', '#e64072'],
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
        backgroundColor: '#0671B7',
        borderColor: '#0671B7',
        borderWidth: 1,
      },
    ],
  };

  // Update attendance when selectedCourse or selectedDate changes
  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const courseAttendanceData = attendanceData[selectedCourse] || {};
    const attendanceInfo =
      courseAttendanceData[dateString] || { present: 0, absent: 0 };
    setAttendance(attendanceInfo);
  }, [selectedCourse, selectedDate]);

  const selectedQuizData = quizData[selectedQuiz];

  return (
    <div>
      <h2>Insights Dashboard</h2>

      <div className="dropdown-container">
        <label htmlFor="courseSelect">Select Course: </label>
        <select
          id="courseSelect"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="English">English</option>
          <option value="History">History</option>
        </select>
      </div>

      <div className="dashboard-grid">
        <div className="top-section">
          <div className="dashboard-card">
            <h3>Lecture Views</h3>
            <div className="chart-container">
              <Pie
                data={lectureViewData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' } },
                }}
              />
            </div>
          </div>

          {insights.map((insight, index) => (
            <div key={index} className="dashboard-card">
              <h3>{insight.title}</h3>
              <div className="chart-container">
                {insight.chartType === 'bar' ? (
                  <Bar
                    data={createChartData(insight.data)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false } },
                        y: {
                          grid: { display: false },
                          beginAtZero: true,
                          ticks: { display: false },
                        },
                      },
                    }}
                  />
                ) : (
                  <Pie
                    data={createChartData(insight.data)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top' } },
                      cutout: '50%',
                    }}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Attendance Section */}
          <div className="dashboard-card">
            <h3>Attendance</h3>
            <div className="attendance-container">
              <label>Select Date: </label>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
              <div className="attendance-numbers">
                <p>Present Students: {attendance.present}</p>
                <p>Absent Students: {attendance.absent}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="dashboard-card compact-card">
            <h3>Total Courses:</h3>
            <p className="compact-card-font">2</p>
          </div>

          <div className="dashboard-card compact-card">
            <h3>Total Enrolled Students</h3>
            <p className="compact-card-font">{data.totalStudents}</p>
          </div>

          <div className="dashboard-card compact-card">
            <h3>Total Uploaded Lectures:</h3>
            <p className="compact-card-font">2</p>
          </div>

          <div className="dashboard-card compact-card">
            <h3>Quiz Invalidations</h3>
            <p className="compact-card-font">1</p>
          </div>
        </div>

        <div className="dashboard-card middle-section">
          <h3>Average Time Spent on Each Lecture</h3>
          <div className="chart-container bar-chart">
            <Bar
              data={averageTimePerSlideData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    grid: { display: false },
                    title: { display: true, text: 'Lecture' },
                  },
                  y: {
                    grid: { display: false },
                    beginAtZero: true,
                    title: { display: true, text: 'Average Time (minutes)' },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* QUIZ STATISTICS SECTION (REPLACED WITH BOX AND WHISKER PLOT) */}
        <div className="dashboard-card middle-section">
          <h3>Quiz Statistics</h3>
          <div className="top-section">
            <label htmlFor="quizSelect">Select Quiz: </label>
            <select
              id="quizSelect"
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(Number(e.target.value))}
            >
              {Object.keys(quizData).map((quiz) => (
                <option key={quiz} value={quiz}>
                  Quiz {quiz}
                </option>
              ))}
            </select>
          </div>
          <div className="chart-container">
            <Plot
              data={[
                {
                  y: selectedQuizData,
                  type: 'box',
                  name: `Quiz ${selectedQuiz}`,
                  // boxpoints: 'all',
                  jitter: 0.5,
                  marker: { color: '#0671B7' },
                  line: { width: 2 },
                },
              ]}
              layout={{
                title: `Quiz ${selectedQuiz} Scores`,
                yaxis: { title: 'Scores', zeroline: false },
                xaxis: { title: 'Quiz', zeroline: false },
                autosize: true,
                showlegend: false,
              }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
        {/* END QUIZ STATISTICS SECTION */}

        <div className="dashboard-card bottom-section">
          <h3>Average Time Spent Reading Lectures</h3>
          <div className="chart-container bar-chart">
            <Line
              data={averageTimeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                  x: {
                    grid: { display: false },
                    title: { display: true, text: 'Days' },
                  },
                  y: {
                    grid: { display: false },
                    beginAtZero: true,
                    title: { display: true, text: 'Average Time (minutes)' },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: 4fr 1fr;
          gap: 10px;
        }

        .top-section {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 10px;
        }

        .right-section {
          display: grid;
          gap: 10px;
          align-content: start;
        }

        .middle-section {
          grid-column: span 2;
        }

        .bottom-section {
          grid-column: span 2;
        }

        .dashboard-card {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f9f9f9;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
          font-size: 14px;
        }

        .dropdown-container {
          margin-bottom: 10px;
          text-align: left;
        }

        .chart-container {
          width: 100%;
          height: 100%;
          max-height: 250px;
        }

        .chart-container.bar-chart {
          width: 100%;
          height: 100%;
          max-height: 250px;
          padding: 0;
          margin: 0;
          display: block;
        }

        .compact-card {
          padding: 5px;
          font-size: 12px;
        }

        .compact-card-font {
          color: #e64072;
        }

        h3 {
          font-size: 14px;
          margin: 0 0 8px;
        }

        p {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin: 0;
        }

        .attendance-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .attendance-numbers {
          margin-top: 10px;
        }

        .attendance-numbers p {
          margin: 5px 0;
          font-size: 16px;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default Insights;
