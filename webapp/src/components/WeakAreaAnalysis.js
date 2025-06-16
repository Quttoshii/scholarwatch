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
  // const baseColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a4de6c", "#d0ed57", "#8dd1e1", "#ffb6b9", "#c6b9cd", "#ffcc99"];
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
  const colors = [];
  for (let i = 0; i < length; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

const WeakAreasAnalysis = ({ weakAreas }) => {
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedSlide, setSelectedSlide] = useState(null);

  const lectureData = Object.entries(weakAreas.lectures || {}).map(([lecture, data]) => {
    let total = 0;
    Object.values(data.Slides || {}).forEach(slide => {
      Object.values(slide.Topics || {}).forEach(count => {
        total += count;
      });
    });
    return { name: lecture, value: total };
  });

  const slideData = selectedLecture ? Object.entries(weakAreas.lectures[selectedLecture]?.Slides || {}).map(([slide, data]) => {
    let total = 0;
    Object.values(data.Topics || {}).forEach(count => {
      total += count;
    });
    return { name: `Slide ${slide}`, rawName: slide, value: total };
  }) : [];

  const topicCounts = {};
  const topicPerSlide = {};
  if (selectedLecture) {
    const slides = weakAreas.lectures[selectedLecture]?.Slides || {};
    Object.entries(slides).forEach(([slideNum, slide]) => {
      Object.entries(slide.Topics || {}).forEach(([topic, count]) => {
        topicCounts[topic] = (topicCounts[topic] || 0) + count;
        if (!topicPerSlide[slideNum]) topicPerSlide[slideNum] = {};
        topicPerSlide[slideNum][topic] = count;
      });
    });
  }

  const topicData = Object.entries(topicCounts).map(([topic, count]) => ({ name: topic, value: count }));
  const selectedSlideTopics = selectedSlide && topicPerSlide[selectedSlide] ? Object.entries(topicPerSlide[selectedSlide]).map(([name, value]) => ({ name, value })) : [];

  const topicColors = generateColors(topicData.length);
  const hasData = lectureData.length > 0;

  return (
    <div className="weak-areas-container">
      <h2>Weak Area Analysis</h2>

      {!hasData ? (
        <p style={{ color: "gray", fontStyle: "italic" }}>No weaknesses recorded so far. Keep up the good work!</p>
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
            <>
              <div className="chart-section">
                <h3>Slide-wise Weakness for "{selectedLecture}"</h3>
                {slideData.length > 0 ? (
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
                ) : (
                  <p style={{ color: "gray", fontStyle: "italic" }}>No slide data available for this lecture.</p>
                )}
              </div>

              <div className="chart-section" style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <h3>Topic-wise Weakness in "{selectedLecture}"</h3>
                  {topicData.length > 0 ? (
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
                  ) : (
                    <p style={{ color: "gray", fontStyle: "italic" }}>No topic data available for this lecture.</p>
                  )}
                </div>

                {selectedSlide && (
                  <div style={{ flex: 1 }}>
                    <h3>Topics in Slide {selectedSlide}</h3>
                    {selectedSlideTopics.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={selectedSlideTopics} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default WeakAreasAnalysis;
