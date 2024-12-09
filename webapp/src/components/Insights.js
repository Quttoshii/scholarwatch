import React, { useEffect, useState } from 'react';
import { Pie, Line, Bar } from 'react-chartjs-2'; // If you use Bar charts, keep this import
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement
} from 'chart.js';
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

const Insights = () => {
  const [coursesData, setCoursesData] = useState([]);
  const [selectedCourseID, setSelectedCourseID] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState({ present: 0, absent: 0 });
  const [selectedQuiz, setSelectedQuiz] = useState(null); // moved hook to top-level

  useEffect(() => {
    fetch('http://localhost/scholarwatch/fetchTeacherInsights.php')
      .then((response) => response.json())
      .then((fetchedData) => {
        const { courses } = fetchedData;
        setCoursesData(courses || []);
        if (courses && courses.length > 0) {
          setSelectedCourseID(courses[0].CourseID);
          // Set quiz after we know selected course
          const defaultCourse = courses[0];
          const quizIDs = defaultCourse.quiz_data ? Object.keys(defaultCourse.quiz_data) : [];
          if (quizIDs.length > 0) {
            setSelectedQuiz(quizIDs[0]);
          }
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  // Get current selectedCourse after coursesData is set
  const selectedCourse = coursesData.find(c => c.CourseID === selectedCourseID);

  // Update attendance when selectedCourse or selectedDate changes
  useEffect(() => {
    if (selectedCourse) {
      const dateString = selectedDate.toISOString().split('T')[0];
      const att = selectedCourse.attendance[dateString] || { present: 0, absent: 0 };
      setAttendance(att);

      // Also update selectedQuiz if needed (e.g. if selectedCourse changes)
      const quizIDs = selectedCourse.quiz_data ? Object.keys(selectedCourse.quiz_data) : [];
      if (quizIDs.length > 0 && (!selectedQuiz || !quizIDs.includes(selectedQuiz))) {
        setSelectedQuiz(quizIDs[0]);
      }
    }
  }, [selectedCourse, selectedDate, selectedQuiz]);

  // Now we can handle the loading state safely AFTER the hooks
  if (!selectedCourse) {
    return <div>Loading...</div>;
  }

  // Extract data
  const {
    total_students,
    total_lectures,
    invalidation_count,
    emotions,
    attention,
    slides,
    quiz_data,
    lectureEngagement
  } = selectedCourse;

  const quizIDs = quiz_data ? Object.keys(quiz_data) : [];
  const selectedQuizData = selectedQuiz && quiz_data[selectedQuiz] ? quiz_data[selectedQuiz] : [];

  // Dummy lecture view data (modify if needed)
  const lectureViewData = {
    labels: ['Viewed Lectures', 'Not Viewed'],
    datasets: [
      {
        data: [30, 10],
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
        { name: 'Awake', value: emotions.awake_time },
        { name: 'Drowsy', value: emotions.drowsy_time },
      ],
      chartType: 'bar',
    },
    {
      title: 'Attention',
      data: [
        { name: 'Focused', value: attention.focused_time },
        { name: 'Unfocused', value: attention.unfocused_time },
      ],
      chartType: 'doughnut',
    },
  ];

  const createChartData = (chartData) => ({
    labels: chartData.map((d) => d.name),
    datasets: [
      {
        label: 'Time (minutes)',
        data: chartData.map((d) => d.value),
        backgroundColor: ['#0671B7', '#e64072'],
        borderColor: ['#0671B7', '#e64072'],
        borderWidth: 1,
      },
    ],
  });

  const averageTimePerSlideData = {
    labels: slides.map((_, idx) => `Slide ${idx + 1}`),
    datasets: [
      {
        label: 'Average Time (minutes)',
        data: slides,
        backgroundColor: '#0671B7',
        borderColor: '#0671B7',
        borderWidth: 1,
      },
    ],
  };

  const averageTimeData = {
    labels: lectureEngagement.map((e) => e.date),
    datasets: [
      {
        label: 'Engagement (minutes)',
        data: lectureEngagement.map((e) => e.time),
        borderColor: '#0671B7',
        backgroundColor: '#0671B7',
        fill: false,
      },
    ],
  };

  return (
    <div>
      <h2>Insights Dashboard</h2>

      <div className="dropdown-container">
        <label htmlFor="courseSelect">Select Course: </label>
        <select
          id="courseSelect"
          value={selectedCourseID || ''}
          onChange={(e) => setSelectedCourseID(parseInt(e.target.value))}
        >
          {coursesData.map((course) => (
            <option key={course.CourseID} value={course.CourseID}>
              {course.Name}
            </option>
          ))}
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
            <p className="compact-card-font">{coursesData.length}</p>
          </div>

          <div className="dashboard-card compact-card">
            <h3>Total Enrolled Students</h3>
            <p className="compact-card-font">{total_students}</p>
          </div>

          <div className="dashboard-card compact-card">
            <h3>Total Uploaded Lectures:</h3>
            <p className="compact-card-font">{total_lectures}</p>
          </div>

          <div className="dashboard-card compact-card">
            <h3>Quiz Invalidations</h3>
            <p className="compact-card-font">{invalidation_count}</p>
          </div>
        </div>

        <div className="dashboard-card middle-section">
          <h3>Average Time Spent on Each Slide</h3>
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
                    title: { display: true, text: 'Slides' },
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

        {/* QUIZ STATISTICS SECTION */}
        <div className="dashboard-card middle-section">
          <h3>Quiz Statistics</h3>
          <div className="top-section">
            <label htmlFor="quizSelect">Select Quiz: </label>
            <select
              id="quizSelect"
              value={selectedQuiz || ''}
              onChange={(e) => setSelectedQuiz(e.target.value)}
            >
              {quizIDs.map((quiz) => (
                <option key={quiz} value={quiz}>
                  Quiz {quiz}
                </option>
              ))}
            </select>
          </div>
          <div className="chart-container">
            {selectedQuizData && selectedQuizData.length > 0 ? (
              <Plot
                data={[
                  {
                    y: selectedQuizData,
                    type: 'box',
                    name: `Quiz ${selectedQuiz}`,
                    boxpoints: 'all',
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
            ) : (
              <p>No quiz data available</p>
            )}
          </div>
        </div>

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
                    title: { display: true, text: 'Date' },
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
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
