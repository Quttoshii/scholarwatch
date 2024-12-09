import React, { useEffect, useState } from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, ArcElement, Tooltip, Legend, PointElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, ArcElement, Tooltip, Legend, PointElement);

const StudentsInsights = () => {
  const [data, setData] = useState({
    totalLectures: 0,
    attention: { focused_time: 0, unfocused_time: 0 },
    totalStudents: 50,
    attendance: "90%",
  });
  const [selectedCourse, setSelectedCourse] = useState("English");

  useEffect(() => {
    const fetchCourseData = (course) => {
      const courseData = {
        English: {
          totalLectures: 40,
          viewedLectures: 25,
          notViewedLectures: 15,
          quizScores: [85, 78, 90, 88, 92],
          totalStudents: 50,
          attendance: "90%",
          attention: { focused_time: 70, unfocused_time: 30 },
        },
        Math: {
          totalLectures: 35,
          viewedLectures: 30,
          notViewedLectures: 5,
          quizScores: [80, 82, 85, 87, 89],
          totalStudents: 45,
          attendance: "95%",
          attention: { focused_time: 80, unfocused_time: 20 },
        },
        History: {
          totalLectures: 50,
          viewedLectures: 40,
          notViewedLectures: 10,
          quizScores: [88, 75, 85, 92, 80],
          totalStudents: 60,
          attendance: "85%",
          attention: { focused_time: 65, unfocused_time: 35 },
        },
      };
      return courseData[course];
    };

    const fetchedData = fetchCourseData(selectedCourse);
    setData(fetchedData);
  }, [selectedCourse]);

  const lectureViewData = {
    labels: ["Viewed Lectures", "Not Viewed"],
    datasets: [
      {
        data: [data.viewedLectures, data.notViewedLectures],
        backgroundColor: ['#FF7F0E', '#993333'], // Autumn orange and peach tones
        borderColor: ['#FF7F0E', '#FDBF6F'],
        borderWidth: 1,
      },
    ],
  };

  const quizScoreData = {
    labels: ["Quiz 1", "Quiz 2", "Quiz 3", "Quiz 4", "Quiz 5"],
    datasets: [
      {
        label: "Quiz Scores",
        data: data.quizScores,
        backgroundColor: "#F3C44D", // Orange
        //borderColor: "#FFD700", // Yellow
        borderWidth: 1,
      },
    ],
  };

  const attentionData = {
    labels: ["Focused", "Unfocused"],
    datasets: [
      {
        data: [data.attention.focused_time, data.attention.unfocused_time],
        backgroundColor: ['#FF6700', '#FDD1A6'], // Autumn peach and yellow
        borderWidth: 0,
      },
    ],
  };

  const averageTimeData = {
    labels: ["January", "February", "March", "April", "June"],
    datasets: [
      {
        label: "English",
        data: [15, 20, 25, 18, 22],
        borderColor: "#FF4500", // Orange-red
        backgroundColor: "rgba(255, 69, 0, 0.3)", // Transparent Orange-red
        fill: true,
      },
      {
        label: "History",
        data: [10, 18, 20, 15, 17],
        borderColor: "#FFD700", // Yellow
        backgroundColor: "rgba(255, 215, 0, 0.3)", // Transparent Yellow
        fill: true,
      },
    ],
  };

  return (
    <div>
      <h2>Insights Dashboard</h2>
      <div className="dropdown-container">
        <label>Course: </label>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          <option>English</option>
          <option>Math</option>
          <option>History</option>
        </select>
      </div>

      <div className="dashboard-grid">
        <div className="top-section">
          <div className="dashboard-card">
            <h3>Total Lectures VS Viewed</h3>
            <div className="chart-container">
              <Pie
                data={lectureViewData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "top" } },
                }}
              />
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Quiz Scores</h3>
            <div className="chart-container bar-chart">
              <Bar
                data={quizScoreData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "top" } },
                  scales: {
                    x: { grid: { display: false }, title: { display: true, text: "Quizzes" } },
                    y: { grid: { display: false }, beginAtZero: true, title: { display: true, text: "Scores" } },
                  },
                }}
              />
            </div>
          </div>

          

          <div className="dashboard-card">
            <h3>Attention</h3>
            <div className="chart-container">
              <Doughnut
                data={attentionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "top" } },
                }}
              />
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="dashboard-card compact-card">
            <h3>
              <span role="img" aria-label="student">
                🎓
              </span>{" "}
              Student Name
            </h3>
            <p className="compact-card-font">John Doe</p>
          </div>
          <div className="dashboard-card compact-card">
            <h3>Total Courses:</h3>
            <p className="compact-card-font">3</p>
          </div>
          <div className="dashboard-card compact-card">
            <h3>Class Strength</h3>
            <p className="compact-card-font">{data.totalStudents}</p>
          </div>
          <div className="dashboard-card compact-card">
            <h3>Attendance</h3>
            <p className="compact-card-font">{data.attendance}</p>
          </div>
        </div>

        <div className="dashboard-card bottom-section wide-chart">
          <h3>Average Time Spent Reading Lectures</h3>
          <div className="chart-container bar-chart">
            <Line
              data={averageTimeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top" } },
                scales: {
                  x: { grid: { display: false }, title: { display: true, text: "Months" } },
                  y: { grid: { display: false }, beginAtZero: true, title: { display: true, text: "Minutes" } },
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
          gap: 20px;
          font-size: 16px;
          align-content: start;
        }

        .dashboard-card {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #FFF5EE; /* Peach background */
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
          font-size: 14px;
        }

        .dropdown-container {
          margin-bottom: 20px;
          text-align: left;
        }

        .chart-container {
          width: 100%;
          height: 100%;
          max-height: 250px;
        }

        .wide-chart {
          grid-column: span 2;
        }

        .compact-card-font {
          color: #FF8C00; /* Autumn Font Color */
        }

        h3 {
          font-size: 14px;
          margin: 0 0 8px;
        }

        p {
          font-size: 16px;
          font-weight: bold;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default StudentsInsights;
