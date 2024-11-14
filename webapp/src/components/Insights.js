import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, ArcElement, Tooltip, Legend, PointElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, ArcElement, Tooltip, Legend, PointElement);

const Insights = ({ results, gazeResults, invalidationCount, totalStudents }) => {
  const [data, setData] = useState({
    totalStudents: 0,
    totalLectures: 0,
    invalidationCount: 0,
    emotions: { awake_time: 0, drowsy_time: 0 },
    attention: { focused_time: 0, unfocused_time: 0 },
  });
  const [selectedCourse, setSelectedCourse] = useState('Course 1');

  useEffect(() => {
    fetch("http://localhost/scholarwatch/fetchInsights.php")
        .then(response => response.json())
        .then(data => {
            setData({
                totalStudents: data.total_students,
                totalLectures: data.total_lectures,
                invalidationCount: data.invalidation_count,
                emotions: data.emotions,
                attention: data.attention,
            });
        })
        .catch(error => console.error("Error fetching data:", error));
  }, []);


  // Sample slide data for two courses
  const slideData = {
    'English': [15, 25, 10, 15, 20],
    'History': [10, 18, 12, 20, 14],
  };

  const lectureViewData = {
    labels: ['Viewed Lectures', 'Not Viewed'],
    datasets: [
      {
        data: [25, 15], // 25 viewed out of 40
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
        { name: 'Awake', value: results.awake_time },
        { name: 'Drowsy', value: results.drowsy_time },
      ],
      chartType: 'bar',
    },
    {
      title: 'Attention',
      data: [
        { name: 'Focused', value: gazeResults.focused_time },
        { name: 'Unfocused', value: gazeResults.unfocused_time },
      ],
      chartType: 'doughnut',
    },
  ];

  const createChartData = (data) => ({
    labels: data.map(d => d.name),
    datasets: [
      {
        label: 'Time (minutes)',
        data: data.map(d => d.value),
        backgroundColor: ['#0671B7', '#e64072'],
        borderColor: ['#0671B7', '#e64072'],
        borderWidth: 1,
      },
    ],
  });

  // Average time per slide data based on the selected course
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

  return (
    <div>
      <h2>Insights Dashboard</h2>

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
                        y: { grid: { display: false }, beginAtZero: true, ticks: { display: false } },
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
                      cutout: '50%',      //Making it a donut chart
                    }} 
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="right-section">
          <div className="dashboard-card compact-card">
            <h3>Total Courses:</h3>
            <p className='compact-card-font'>2</p>
          </div>

          <div className="dashboard-card compact-card">
            <h3>Total Enrolled Students</h3>
            <p className='compact-card-font'>{data.totalStudents}</p>
          </div>

          <div className="dashboard-card compact-card">
            <h3>Total Uploaded Lectures:</h3>
            <p className='compact-card-font'>{data.totalLectures}</p>
          </div>

          <div className="dashboard-card compact-card">
            <h3>Quiz Invalidations</h3>
            <p className='compact-card-font'>{invalidationCount.length}</p>
          </div>
        </div>

        <div className="dashboard-card middle-section">
          <h3>Average Time Spent on Each Slide</h3>
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
          <div className="chart-container bar-chart">
            <Bar 
              data={averageTimePerSlideData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, title: { display: true, text: 'Slides' } },
                  y: { grid: { display: false }, beginAtZero: true, title: { display: true, text: 'Average Time (minutes)' } },
                },
              }} 
            />
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
                  x: { grid: { display: false }, title: { display: true, text: 'Days' } },
                  y: { grid: { display: false }, beginAtZero: true, title: { display: true, text: 'Average Time (minutes)' } },
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
      `}</style>
    </div>
  );
};

export default Insights;
