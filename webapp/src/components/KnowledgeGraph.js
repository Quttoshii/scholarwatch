import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import './KnowledgeGraph.css';
import { FaPlus } from 'react-icons/fa';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import ForceGraph2D from "react-force-graph-2d";


const levelColors = [
  { background: '#f6a623', border: '#e6951a' }, // Level 0 - Original Orange
  { background: '#e67e22', border: '#d35400' }, // Level 1 - Dark Orange
  { background: '#c0392b', border: '#a93226' }, // Level 2 - Red-Orange
  { background: '#a93226', border: '#922b21' }, // Level 3 - Dark Red-Orange
  { background: '#8B0000', border: '#660000' }, // Level 4 - Dark Red
];

// Simple Toast implementation
const Toast = ({ message, type, onClose }) => (
  <div style={{
    position: 'fixed',
    top: 24,
    right: 24,
    background: type === 'success' ? '#4CAF50' : '#F44336',
    color: '#fff',
    padding: '14px 28px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 16,
    zIndex: 9999,
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    minWidth: 180,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  }}>
    {message}
    <span style={{ marginLeft: 12, cursor: 'pointer', fontWeight: 700 }} onClick={onClose}>×</span>
  </div>
);

const KnowledgeGraph = ({ courseId: initialCourseId, isTeacher = false, teacherId = 1, studentId = null }) => {
  // All hooks must be called at the top level
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showLegend, setShowLegend] = useState(true);
  const [showAddNode, setShowAddNode] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [newNode, setNewNode] = useState({ label: '', description: '' });
  const [newNodePrereqs, setNewNodePrereqs] = useState([]);
  const [graphId, setGraphId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || null);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  // Add new state for tooltip
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Hardcoded lecture data for testing
  const [hardcodedLectures, setHardcodedLectures] = useState([
    { id: 1, title: "Introduction to React", status: "completed", description: "Learn the basics of React" },
    { id: 2, title: "State Management", status: "in_progress", description: "Understanding state in React" },
    { id: 3, title: "Hooks", status: "locked", description: "Using React Hooks" },
    { id: 4, title: "Routing", status: "locked", description: "React Router basics" }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [newLecture, setNewLecture] = useState({ title: "", status: "locked", description: "" });

  // 1. Tooltip logic for node hover
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredNodePos, setHoveredNodePos] = useState({ x: 0, y: 0 });

  // Add handler for status change in popup
  const [popupStatus, setPopupStatus] = useState(null);

  // Add new state for toast
  const [toast, setToast] = useState(null);
  const toastTimeout = useRef();

  // Add new state for tracking last edited node id
  const [lastEditedNodeId, setLastEditedNodeId] = useState(null);

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      setCoursesError(null);
      try {
        let response;
        if (isTeacher) {
          response = await axios.get(`http://localhost/scholarwatch/getTeacherCourses.php?teacherId=${teacherId}`);
        } else {
          response = await axios.get(`http://localhost/scholarwatch/getAllCourses.php`);
        }
        if (response.data.success) {
          setCourses(response.data.courses);
          if (!selectedCourseId && response.data.courses.length > 0) {
            setSelectedCourseId(response.data.courses[0].CourseID);
          }
        } else {
          setCoursesError('Failed to fetch courses.');
        }
      } catch (err) {
        setCoursesError('Error fetching courses.');
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
    // eslint-disable-next-line
  }, [teacherId, isTeacher]);

  // Fetch graph data
  const fetchGraphData = useCallback(async () => {
    if (!selectedCourseId) {
      setError('No course selected for Knowledge Graph.');
      return;
    }

    try {
      let url = `http://localhost/scholarwatch/knowledge-graph.php?action=get&courseId=${selectedCourseId}`;
      if (!isTeacher && studentId) {
        url += `&studentId=${studentId}`;
      }
      const response = await axios.get(url);
      if (response.data.success) {
        setNodes(response.data.nodes);
        setEdges(response.data.edges);
        setGraphId(response.data.graphId);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching graph data:', error);
      setError('Error loading knowledge graph data.');
    }
  }, [selectedCourseId, isTeacher, studentId]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Handle node position updates
  const onNodeDragStop = useCallback(async (event, node) => {
    try {
      await axios.post('http://localhost/scholarwatch/knowledge-graph.php?action=updateNodePosition', {
        nodeId: node.id,
        x: node.position.x,
        y: node.position.y
      });
    } catch (error) {
      console.error('Error updating node position:', error);
    }
  }, []);

  // Update onNodeClick
  const onNodeClick = useCallback((event, node) => {
    console.log('Node clicked:', node);
    setSelectedNode(node);
  }, []);

  // Handle adding new node
  const handleAddNode = async () => {
    try {
      const response = await axios.post('http://localhost/scholarwatch/knowledge-graph.php?action=addNode', {
        graphId,
        name: newNode.label,
        type: 'TOPIC',
        description: newNode.description,
        x: 0,
        y: 0
      });

      if (response.data.success) {
        // Add edges for prerequisites
        for (const prereqId of newNodePrereqs) {
          await axios.post('http://localhost/scholarwatch/knowledge-graph.php?action=addEdge', {
            graphId,
            sourceId: prereqId,
            targetId: response.data.nodeId,
            type: 'PREREQUISITE'
          });
        }

        // Refresh graph data
        fetchGraphData();
        setShowAddNode(false);
        setNewNode({ label: '', description: '' });
        setNewNodePrereqs([]);
      }
    } catch (error) {
      console.error('Error adding node:', error);
    }
  };

  // Handle updating node
  const handleUpdateNode = async () => {
    try {
      await axios.post('http://localhost/scholarwatch/knowledge-graph.php?action=updateNode', {
        nodeId: selectedNode.id,
        name: selectedNode.data.label,
        description: selectedNode.data.description,
        type: selectedNode.type,
        lectureId: selectedNode.data.lectureId
      });

      fetchGraphData();
      setSelectedNode(null);
    } catch (error) {
      console.error('Error updating node:', error);
    }
  };

  // Handle deleting node
  const handleDeleteNode = async () => {
    try {
      await axios.post('http://localhost/scholarwatch/knowledge-graph.php?action=deleteNode', {
        nodeId: selectedNode.id
      });

      fetchGraphData();
      setSelectedNode(null);
    } catch (error) {
      console.error('Error deleting node:', error);
    }
  };

  // Handle adding edge
  const onConnect = useCallback(async (params) => {
    try {
      const response = await axios.post('http://localhost/scholarwatch/knowledge-graph.php?action=addEdge', {
        graphId,
        sourceId: params.source,
        targetId: params.target,
        type: 'PREREQUISITE'
      });

      if (response.data.success) {
        setEdges((eds) => addEdge(params, eds));
      }
    } catch (error) {
      console.error('Error adding edge:', error);
    }
  }, [graphId, setEdges]);

  // Edge click (delete for teacher)
  const onEdgeClick = async (event, edge) => {
    if (isTeacher) {
      if (window.confirm('Delete this connection?')) {
        try {
          await axios.post('http://localhost/scholarwatch/knowledge-graph.php?action=deleteEdge', {
            edgeId: edge.id
          });
          fetchGraphData();
        } catch (error) {
          console.error('Error deleting edge:', error);
        }
      }
    }
  };

  // Helper: get level by prerequisites (recursive)
  const getNodeLevel = (nodeId, visited = new Set()) => {
    if (!nodeId || visited.has(nodeId)) return 0;
    visited.add(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.data || !node.data.prerequisites || node.data.prerequisites.length === 0) return 0;
    
    let maxLevel = 0;
    for (const pid of node.data.prerequisites) {
      maxLevel = Math.max(maxLevel, getNodeLevel(pid, visited));
    }
    return maxLevel + 1;
  };

  // Assign colors to nodes based on their level
  const getNodeStyleByLevel = (level) => {
    const idx = Math.min(level, levelColors.length - 1);
    return {
      background: levelColors[idx].background,
      borderColor: levelColors[idx].border,
      color: '#fff',
      transition: 'border-color 0.3s, background 0.3s, color 0.3s, opacity 0.3s',
    };
  };

  // When building nodes, assign style based on level
  const styledNodes = nodes.map(node => {
    const level = getNodeLevel(node.id);
    return {
      ...node,
      style: {
        ...getNodeStyleByLevel(level),
        ...(node.style || {}), // allow custom overrides if any
      },
    };
  });

  // Update getNodeColor to use backend values directly
  const getNodeColor = (node) => {
    const status = node.data?.status || 'LOCKED';
    switch (status) {
      case 'COMPLETED':
        return '#f6a623'; // Original Orange
      case 'UNLOCKED':
        return '#e67e22'; // Dark Orange
      case 'LOCKED':
      default:
        return '#2C1810'; // Dark Brown
    }
  };

  // Node style for students (status only)
  const getStudentNodeStyle = (node) => {
    if (!node) return {};
    
    const status = node.data?.status || 'LOCKED';
    let style = { ...node.style } || {};
    
    switch (status) {
      case 'COMPLETED':
        style.background = '#f6a623';
        style.borderColor = '#e6951a';
        style.color = '#fff';
        break;
      case 'UNLOCKED':
        style.background = '#e67e22';
        style.borderColor = '#d35400';
        style.color = '#fff';
        break;
      case 'LOCKED':
      default:
        style.background = '#2C1810';
        style.borderColor = '#1A0F0A';
        style.color = '#fff';
        break;
    }
    
    style.transition = 'border-color 0.3s, background 0.3s, color 0.3s, opacity 0.3s';
    return style;
  };

  // Update getNodeBorderColor to use backend values directly
  const getNodeBorderColor = (node) => {
    const status = node.data?.status || 'LOCKED';
    switch (status) {
      case 'COMPLETED':
        return '#e6951a';
      case 'UNLOCKED':
        return '#d35400';
      case 'LOCKED':
      default:
        return '#1A0F0A';
    }
  };

  const getNodeTextColor = (node) => {
    const status = node.data?.status || node.status || 'LOCKED';
    return status === 'LOCKED' ? '#fff' : '#333';
  };

  // Render nodes/edges depending on mode
  const renderNodes = styledNodes.map(n => ({
    ...n,
    style: {
      ...n.style,
      background: getNodeColor(n),
      border: `3px solid ${getNodeBorderColor(n)}`,
      color: getNodeTextColor(n),
      boxShadow: '0 4px 16px rgba(139, 0, 0, 0.08)',
      transition: 'background 0.3s, border 0.3s, box-shadow 0.3s, color 0.3s',
    },
  }));
  const renderEdges = edges;

  // 1. Tooltip logic for node hover
  const onNodeMouseEnter = (event, node) => {
    setHoveredNode(node);
    setHoveredNodePos({ x: event.clientX, y: event.clientY });
  };
  const onNodeMouseLeave = () => setHoveredNode(null);

  // When a node is selected, set popupStatus to the backend value
  useEffect(() => {
    if (selectedNode) {
      let status = selectedNode.data?.status;
      if (status === 'in_progress') status = 'UNLOCKED';
      console.log('Setting popupStatus:', status, selectedNode);
      setPopupStatus(status && typeof status === 'string' ? status : 'LOCKED');
    }
  }, [selectedNode]);

  // Dropdown for status uses backend values
  const statusOptions = [
    { value: 'LOCKED', label: 'Locked' },
    { value: 'UNLOCKED', label: 'Unlocked' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const handlePopupStatusChange = (e) => setPopupStatus(e.target.value);

  const handlePopupStatusSave = async () => {
    if (!selectedNode) return;
    console.log('Saving status:', { nodeId: selectedNode.id, status: popupStatus });

    try {
      let payload = {
        nodeId: selectedNode.id,
        status: popupStatus
      };
      if (!isTeacher && studentId) {
        payload.studentId = studentId;
      }
      const response = await axios.post('http://localhost/scholarwatch/knowledge-graph.php?action=updateNodeStatus', payload);

      if (response.data.success) {
        // Update local state immediately for better UX
        setNodes(nodes.map(node => 
          node.id === selectedNode.id 
            ? { ...node, data: { ...node.data, status: popupStatus } }
            : node
        ));
        setToast({ message: 'Status updated successfully!', type: 'success' });
        clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setToast(null), 2000);
        // Optionally, refetch the graph to update unlocked nodes
        fetchGraphData();
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setToast({ message: error.message || 'Failed to update status', type: 'error' });
      clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToast(null), 2500);
    }
  };

  // Show loading or error for courses
  if (coursesLoading) {
    return <div className="knowledge-graph"><div>Loading courses...</div></div>;
  }
  if (coursesError) {
    return <div className="knowledge-graph"><div className="error">{coursesError}</div></div>;
  }
  if (!selectedCourseId) {
    return <div className="knowledge-graph"><div className="error">No course selected for Knowledge Graph.</div></div>;
  }

  // Show error if there's an error state
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="knowledge-graph" style={{ height: '80vh', width: '100%', background: '#FFF5EE', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', position: 'relative' }}>
      <div className="graph-header">
        <div className="header-left">
          <h2>Knowledge Graph</h2>
          {/* Course selection dropdown */}
          <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(Number(e.target.value))}
            style={{ marginLeft: 16, padding: '4px 8px', borderRadius: 6 }}
          >
            {courses.map(course => (
              isTeacher
                ? <option key={course.CourseID} value={course.CourseID}>{course.CourseName}</option>
                : <option key={course.CourseID} value={course.CourseID}>{course.CourseName} (Teacher: {course.TeacherName})</option>
            ))}
          </select>
        </div>
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="legend-toggle" onClick={() => setShowLegend(!showLegend)}>
            {showLegend ? 'Hide Legend' : 'Show Legend'}
          </button>
        </div>
      </div>
      <div style={{ height: 'calc(100% - 70px)', width: '100%' }}>
        <ReactFlow
          nodes={renderNodes}
          edges={renderEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          fitView
          onEdgeClick={onEdgeClick}
          panOnScroll
          zoomOnScroll
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
        >
          <MiniMap nodeColor={getNodeColor} nodeStrokeWidth={3} style={{ borderRadius: 8 }} />
          <Controls />
          <Background gap={16} color="#f6a62322" />
        </ReactFlow>
      </div>
      {showLegend && (
        <div className="graph-legend">
          <h4>Legend</h4>
          <div className="legend-item">
            <span className="legend-color completed"></span>
            <span>Completed</span>
          </div>
          <div className="legend-item">
            <span className="legend-color unlocked"></span>
            <span>Unlocked</span>
          </div>
          <div className="legend-item">
            <span className="legend-color locked"></span>
            <span>Locked</span>
          </div>
        </div>
      )}
      {selectedNode && isTeacher && (
        <div className="node-details fade-in-modal" style={{ zIndex: 10000, position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="node-details-content" style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.13)' }}>
            <h3 style={{ marginBottom: 12 }}>{selectedNode.data.label}</h3>
            <p style={{ color: '#666', marginBottom: 18 }}>{selectedNode.data.description}</p>
            <div className="node-status" style={{ marginBottom: 18 }}>
              <span style={{ fontWeight: 500 }}>Status:</span>
              <select value={popupStatus || 'LOCKED'} onChange={handlePopupStatusChange} style={{ marginLeft: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}>
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions" style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <button className="edit-button" style={{ minWidth: 110, background: 'linear-gradient(135deg, #f6a623, #e6951a)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 16 }} onClick={handlePopupStatusSave}>Save</button>
              <button className="edit-button" style={{ minWidth: 110, background: '#ffffff', color: '#2C1810', border: '2px solid #e0e0e0', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 16 }} onClick={() => setSelectedNode(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Enhanced Tooltip */}
      {tooltipContent && (
        <div
          className="graph-tooltip"
          style={{
            position: 'absolute',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateY(-100%)',
            zIndex: 1000
          }}
        >
          <h4>{tooltipContent.title}</h4>
          <p>{tooltipContent.description}</p>
          {tooltipContent.lectureDetails && (
            <div className="lecture-details">
              <p><strong>Duration:</strong> {tooltipContent.lectureDetails.duration} minutes</p>
              <p><strong>Difficulty:</strong> {tooltipContent.lectureDetails.difficulty}</p>
              {tooltipContent.lectureDetails.topics && (
                <p><strong>Topics:</strong> {tooltipContent.lectureDetails.topics.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      )}
      {isTeacher && (
        <button className="add-lecture-button" onClick={() => {
          setEditingLecture(null);
          setNewLecture({ title: "", status: "locked", description: "" });
          setIsModalOpen(true);
        }}>Add Lecture</button>
      )}
      {isModalOpen && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="modal-content" style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            <h2 style={{
              margin: '0 0 24px 0',
              color: '#2C1810',
              fontSize: '24px',
              fontWeight: '600'
            }}>{editingLecture ? "Edit Lecture" : "Add Lecture"}</h2>
            <input
              type="text"
              placeholder="Title"
              value={newLecture.title}
              onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
            />
            <select
              value={newLecture.status}
              onChange={(e) => setNewLecture({ ...newLecture, status: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <option value="locked">Locked</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <textarea
              placeholder="Description"
              value={newLecture.description}
              onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '24px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                minHeight: '120px',
                resize: 'vertical',
                transition: 'all 0.3s ease'
              }}
            />
            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => {
                  if (editingLecture) {
                    setHardcodedLectures(hardcodedLectures.map(lecture =>
                      lecture.id === editingLecture.id ? { ...lecture, ...newLecture } : lecture
                    ));
                  } else {
                    const newId = Math.max(...hardcodedLectures.map(l => l.id)) + 1;
                    setHardcodedLectures([...hardcodedLectures, { ...newLecture, id: newId }]);
                  }
                  setIsModalOpen(false);
                }}
                style={{
                  flex: 1,
                  padding: '14px 28px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #f6a623, #e6951a)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(246, 166, 35, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >Save</button>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '14px 28px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: 'white',
                  color: '#2C1810',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Tooltip rendering (after ReactFlow) */}
      {hoveredNode && (
        <div
          className="graph-tooltip"
          style={{
            position: 'fixed',
            left: hoveredNodePos.x + 16,
            top: hoveredNodePos.y - 16,
            zIndex: 10000,
            minWidth: 200,
            maxWidth: 320,
            pointerEvents: 'none',
          }}
        >
          <h4>{hoveredNode.data?.label || hoveredNode.label}</h4>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>{hoveredNode.data?.description || hoveredNode.description}</div>
          <div style={{ fontWeight: 500, color: '#f6a623' }}>Status: {hoveredNode.status || hoveredNode.data?.status}</div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default KnowledgeGraph; 