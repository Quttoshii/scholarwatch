import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./WeakAreasAnalysis.css";

const generateColors = (length) => {
  const baseColors = [
    '#FF6700', // Main orange
    '#FF8533', // Light orange
    '#FF4500', // Orange red
    '#FFB366', // Peach
    '#FF7F0E', // Dark orange
    '#FFA500', // Orange
    '#FF9933', // Medium orange
    '#FFD700', // Gold
    '#F3C44D', // Yellow gold
    '#FF8C00'  // Dark orange
  ];
  return Array.from({ length }, (_, i) => baseColors[i % baseColors.length]);
};

const TeacherWeakAreaAnalysis = ({ aggregatedWeakAreas }) => {
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedSlide, setSelectedSlide] = useState(null);

  const lectureData = Object.entries(aggregatedWeakAreas.lectures || {}).map(([lecture, data]) => {
    let total = 0;
    Object.values(data.Slides || {}).forEach(slide => {
      Object.values(slide.Topics || {}).forEach(count => {
        total += count;
      });
    });
    return { name: lecture, value: total };
  });

  const slideData = selectedLecture ? Object.entries(aggregatedWeakAreas.lectures[selectedLecture]?.Slides || {}).map(([slide, slideDataObj]) => {
    let slideTotal = 0;
    Object.entries(slideDataObj.Topics || {}).forEach(([_, count]) => {
      slideTotal += count;
    });
    return { name: `Slide ${slide}`, rawName: slide, value: slideTotal };
  }) : [];

  const topicCounts = {};
  const topicPerSlide = {};
  Object.entries(aggregatedWeakAreas.lectures || {}).forEach(([lecture, data]) => {
    Object.entries(data.Slides || {}).forEach(([slide, slideDataObj]) => {
      Object.entries(slideDataObj.Topics || {}).forEach(([topic, count]) => {
        topicCounts[topic] = (topicCounts[topic] || 0) + count;
        if (!topicPerSlide[lecture]) topicPerSlide[lecture] = {};
        if (!topicPerSlide[lecture][slide]) topicPerSlide[lecture][slide] = {};
        topicPerSlide[lecture][slide][topic] = count;
      });
    });
  });

  const selectedSlideTopics = selectedLecture && selectedSlide && topicPerSlide[selectedLecture]?.[selectedSlide] ?
    Object.entries(topicPerSlide[selectedLecture][selectedSlide]).map(([name, value]) => ({ name, value })) : [];

  const topicData = Object.entries(topicCounts).map(([topic, value]) => ({ name: topic, value }));
  const topicColors = generateColors(topicData.length);

  const hasData = lectureData.length > 0;

  return (
    <div className="weak-areas-container">
      <h2>Aggregated Student Weakness Analysis</h2>

      {!hasData ? (
        <p style={{ color: "gray", fontStyle: "italic" }}>No data available yet.</p>
      ) : (
        <>
          <div className="chart-section">
            <h3>Lecture-wise Weakness</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={lectureData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                onClick={(data) => {
                  if (data?.activeLabel) {
                    setSelectedLecture(data.activeLabel);
                    setSelectedSlide(null);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {selectedLecture && (
            <div className="chart-section">
              <h3>Slide-wise Weakness in "{selectedLecture}"</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={slideData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  onClick={(data) => {
                    const clicked = slideData.find(slide => slide.name === data?.activeLabel);
                    if (clicked) setSelectedSlide(clicked.rawName);
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {selectedSlide && (
            <div className="chart-section">
              <h3>Topics in Slide {selectedSlide} of "{selectedLecture}"</h3>
              {selectedSlideTopics.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={selectedSlideTopics}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={200} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#c6b9cd" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: "gray", fontStyle: "italic" }}>No topic data for this slide.</p>
              )}
            </div>
          )}

          <div className="chart-section">
            <h3>Overall Topic-wise Weakness (All Students)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topicData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#ffc658"
                  label
                >
                  {topicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={topicColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherWeakAreaAnalysis;
