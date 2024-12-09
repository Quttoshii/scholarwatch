import React, { useEffect, useState } from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
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
} from "chart.js";

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

const StudentsInsights = () => {
  const [coursesData, setCoursesData] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    fetch("http://localhost/scholarwatch/fetchStudentInsights.php")
      .then((response) => response.json())
      .then((fetchedData) => {
        const { courses, studentName } = fetchedData;
        setCoursesData(courses || []);
        setStudentName(studentName || "Student");
        if (courses && courses.length > 0) {
          setSelectedCourse(courses[0].Name); // default select first course by name
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const currentCourse = coursesData.find((c) => c.Name === selectedCourse);

  if (!currentCourse) {
    return <div>Loading...</div>;
  }

  const {
    totalLectures,
    viewedLectures,
    notViewedLectures,
    quizScores,
    totalStudents,
    attendance,
    attention,
  } = currentCourse;

  // Lecture view data
  const lectureViewData = {
    labels: ["Viewed Lectures", "Not Viewed"],
    datasets: [
      {
        data: [viewedLectures, notViewedLectures],
        backgroundColor: ['#FF7F0E', '#993333'],
        borderColor: ['#FF7F0E', '#FDBF6F'],
        borderWidth: 1,
      },
    ],
  };

  // If no quiz scores, provide a dummy array to avoid errors
  const quizLabelCount = quizScores.length > 0 ? quizScores.length : 5;
  const quizLabels = Array.from({ length: quizLabelCount }, (_, i) => `Quiz ${i + 1}`);

  const quizScoreData = {
    labels: quizLabels,
    datasets: [
      {
        label: "Quiz Scores",
        data: quizScores.length > 0 ? quizScores : [0, 0, 0, 0, 0],
        backgroundColor: "#F3C44D",
        borderWidth: 1,
      },
    ],
  };

  const attentionData = {
    labels: ["Focused", "Unfocused"],
    datasets: [
      {
        data: [attention.focused_time, attention.unfocused_time],
        backgroundColor: ['#FF6700', '#FDD1A6'],
        borderWidth: 0,
      },
    ],
  };

  // In the original code, averageTimeData was static dummy data.
  // If needed, fetch from DB and format similarly. For now, we keep it static or remove it.
  // Let's keep it static since no instructions were given on how to fetch it:
  const averageTimeData = {
    labels: ["January", "February", "March", "April", "June"],
    datasets: [
      {
        label: selectedCourse,
        data: [15, 20, 25, 18, 22],
        borderColor: "#FF4500",
        backgroundColor: "rgba(255, 69, 0, 0.3)",
        fill: true,
      }
    ],
  };

  return (
    <div>
      <h2>Insights Dashboard</h2>
      <div className="dropdown-container">
        <label>Course: </label>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          {coursesData.map((course) => (
            <option key={course.CourseID} value={course.Name}>
              {course.Name}
            </option>
          ))}
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
                    x: {
                      grid: { display: false },
                      title: { display: true, text: "Quizzes" },
                    },
                    y: {
                      grid: { display: false },
                      beginAtZero: true,
                      title: { display: true, text: "Scores" },
                    },
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
            <p className="compact-card-font">{studentName}</p>
          </div>
          <div className="dashboard-card compact-card">
            <h3>Total Courses:</h3>
            <p className="compact-card-font">{coursesData.length}</p>
          </div>
          <div className="dashboard-card compact-card">
            <h3>Class Strength</h3>
            <p className="compact-card-font">{totalStudents}</p>
          </div>
          <div className="dashboard-card compact-card">
            <h3>Attendance</h3>
            <p className="compact-card-font">{attendance}</p>
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
                  x: {
                    grid: { display: false },
                    title: { display: true, text: "Months" },
                  },
                  y: {
                    grid: { display: false },
                    beginAtZero: true,
                    title: { display: true, text: "Minutes" },
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
          gap: 20px;
          font-size: 16px;
          align-content: start;
        }

        .dashboard-card {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #FFF5EE;
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
          color: #FF8C00;
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
