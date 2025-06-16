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
  // Updated color palette to match the orange theme
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
  const slideTopicColors = generateColors(selectedSlideTopics.length);
  const hasData = lectureData.length > 0;

  const chartContainerStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0',
    marginBottom: '20px'
  };

  return (
    <div className="weak-areas-container">
      <h2>Weak Area Analysis</h2>

      {!hasData ? (
        <div style={chartContainerStyle}>
          <p style={{ color: "#666", fontStyle: "italic", textAlign: "center", margin: 0 }}>
            No weaknesses recorded so far. Keep up the good work!
          </p>
        </div>
      ) : (
        <>
          <div className="chart-section" style={chartContainerStyle}>
            <h3 style={{ color: '#FF6700', marginBottom: '20px' }}>Lecture-wise Weakness</h3>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#666' }}
                  axisLine={{ stroke: '#ddd' }}
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fill: '#666' }}
                  axisLine={{ stroke: '#ddd' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #FF6700',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#FF6700"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {selectedLecture && (
            <>
              <div className="chart-section" style={chartContainerStyle}>
                <h3 style={{ color: '#FF6700', marginBottom: '20px' }}>
                  Slide-wise Weakness for "{selectedLecture}"
                </h3>
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#666' }}
                        axisLine={{ stroke: '#ddd' }}
                      />
                      <YAxis 
                        allowDecimals={false} 
                        tick={{ fill: '#666' }}
                        axisLine={{ stroke: '#ddd' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #FF8533',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#FF8533"
                        radius={[4, 4, 0, 0]}
                        cursor="pointer"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ color: "#666", fontStyle: "italic", textAlign: "center", margin: 0 }}>
                    No slide data available for this lecture.
                  </p>
                )}
              </div>

              <div className="chart-section" style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, ...chartContainerStyle }}>
                  <h3 style={{ color: '#FF6700', marginBottom: '20px' }}>
                    Topic-wise Weakness in "{selectedLecture}"
                  </h3>
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
                          innerRadius={40}
                          paddingAngle={3}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {topicData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={topicColors[index]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #FF6700',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          wrapperStyle={{ paddingTop: '20px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p style={{ color: "#666", fontStyle: "italic", textAlign: "center", margin: 0 }}>
                      No topic data available for this lecture.
                    </p>
                  )}
                </div>

                {selectedSlide && (
                  <div style={{ flex: 1, ...chartContainerStyle }}>
                    <h3 style={{ color: '#FF6700', marginBottom: '20px' }}>
                      Topics in Slide {selectedSlide}
                    </h3>
                    {selectedSlideTopics.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart 
                          data={selectedSlideTopics} 
                          layout="vertical" 
                          margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            type="number" 
                            allowDecimals={false} 
                            tick={{ fill: '#666' }}
                            axisLine={{ stroke: '#ddd' }}
                          />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            width={120}
                            tick={{ fill: '#666', fontSize: 12 }}
                            axisLine={{ stroke: '#ddd' }}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #FF4500',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {selectedSlideTopics.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={slideTopicColors[index]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p style={{ color: "#666", fontStyle: "italic", textAlign: "center", margin: 0 }}>
                        No topic data for this slide.
                      </p>
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