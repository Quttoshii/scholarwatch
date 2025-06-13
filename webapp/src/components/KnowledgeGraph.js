import React, { useState, useEffect, useCallback } from 'react';
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
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Tooltip as ReactTooltip } from 'react-tooltip';


const levelColors = [
  { background: '#f6a623', border: '#e6951a' }, // Level 0 - Orange
  { background: '#1976d2', border: '#115293' }, // Level 1 - Blue
  { background: '#43a047', border: '#2e7031' }, // Level 2 - Green
  { background: '#8e24aa', border: '#5c007a' }, // Level 3 - Purple
  { background: '#f44336', border: '#b71c1c' }, // Level 4 - Red
];

const KnowledgeGraph = ({ courseId: initialCourseId, isTeacher = false, teacherId = 1 }) => {
  // All hooks must be called at the top level
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showLegend, setShowLegend] = useState(true);
  const [showAddNode, setShowAddNode] = useState(false);
  const [showEditNode, setShowEditNode] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [newNode, setNewNode] = useState({ label: '', description: '' });
  const [newNodePrereqs, setNewNodePrereqs] = useState([]);
  const [graphId, setGraphId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || null);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

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
      const response = await axios.get(`http://localhost/scholarwatch/knowledge-graph.php?action=get&courseId=${selectedCourseId}`);
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
  }, [selectedCourseId]);

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

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    if (isTeacher) {
      setSelectedNode(node);
      setShowEditNode(true);
    }
  }, [isTeacher]);

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
      setShowEditNode(false);
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
      setShowEditNode(false);
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

  // Node color with safe fallback
  const nodeColor = (node) => {
    if (!node || !node.style || !node.style.background) {
      return levelColors[0].border; // Default to first color if no style
    }
    const level = getNodeLevel(node.id);
    return levelColors[Math.min(level, levelColors.length - 1)].border;
  };

  // Node style for students (status only)
  const getStudentNodeStyle = (node) => {
    if (!node) return {};
    
    let style = { ...node.style } || {};
    if (node.data && node.data.status === 'completed') {
      style.background = levelColors[0].background;
      style.borderColor = levelColors[0].border;
      style.color = '#fff';
    }
    if (node.data && node.data.status === 'in-progress') {
      style.background = levelColors[0].background;
      style.borderColor = levelColors[0].border;
      style.opacity = '0.8';
      style.color = '#fff';
    }
    if (node.data && node.data.status === 'locked') {
      style.background = '#f8f9fa';
      style.borderColor = '#dee2e6';
      style.color = '#6c757d';
    }
    style.transition = 'border-color 0.3s, background 0.3s, color 0.3s, opacity 0.3s';
    return style;
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
        <div className="header-right">
          <button className="legend-toggle" onClick={() => setShowLegend(!showLegend)}>
            {showLegend ? 'Hide Legend' : 'Show Legend'}
          </button>
        </div>
      </div>
      {/* Floating Action Button for Add Topic */}
      {isTeacher && (
        <button
          className="fab-add-topic"
          onClick={() => setShowAddNode(true)}
          title="Add Topic"
        >
          <FaPlus size={22} />
        </button>
      )}
      <div style={{ height: 'calc(100% - 70px)', width: '100%' }}>
        <ReactFlow
          nodes={isTeacher ? styledNodes.map(n => ({ ...n, style: getStudentNodeStyle(n) })) : styledNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={isTeacher ? onConnect : undefined}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          fitView
          onEdgeClick={onEdgeClick}
          panOnScroll
          zoomOnScroll
        >
          <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} style={{ borderRadius: 8 }} />
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
            <span className="legend-color in-progress"></span>
            <span>In Progress</span>
          </div>
          <div className="legend-item">
            <span className="legend-color locked"></span>
            <span>Locked</span>
          </div>
        </div>
      )}
      {showAddNode && (
        <div className="node-details fade-in-modal">
          <div className="node-details-content">
            <h3>Add Lecture/Topic</h3>
            <input type="text" placeholder="Label" value={newNode.label} onChange={e => setNewNode({ ...newNode, label: e.target.value })} />
            <input type="text" placeholder="Description" value={newNode.description} onChange={e => setNewNode({ ...newNode, description: e.target.value })} />
            <div style={{ margin: '12px 0 8px 0', fontWeight: 500 }}>Prerequisites:</div>
            <select multiple value={newNodePrereqs} onChange={e => setNewNodePrereqs(Array.from(e.target.selectedOptions, o => o.value))} style={{ minHeight: 60, minWidth: 180, marginBottom: 8 }}>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.data.label}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button className="edit-button" style={{ minWidth: 110 }} onClick={handleAddNode}>Add</button>
              <button className="edit-button" style={{ minWidth: 110 }} onClick={() => { setShowAddNode(false); setNewNodePrereqs([]); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showEditNode && selectedNode && (
        <div className="node-details fade-in-modal">
          <div className="node-details-content">
            <h3>Edit Lecture/Topic</h3>
            <input type="text" placeholder="Label" value={selectedNode.data.label} onChange={e => setSelectedNode({
              ...selectedNode,
              data: { ...selectedNode.data, label: e.target.value }
            })} />
            <input type="text" placeholder="Description" value={selectedNode.data.description} onChange={e => setSelectedNode({
              ...selectedNode,
              data: { ...selectedNode.data, description: e.target.value }
            })} />
            <div className="modal-actions">
              <button className="edit-button" style={{ minWidth: 110 }} onClick={handleUpdateNode}>Save</button>
              <button className="edit-button" style={{ minWidth: 110 }} onClick={handleDeleteNode}>Delete</button>
              <button className="edit-button" style={{ minWidth: 110 }} onClick={() => { setShowEditNode(false); setSelectedNode(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {selectedNode && !isTeacher && (
        <div className="node-details fade-in-modal">
          <div className="node-details-content">
            <h3>{selectedNode.data.label}</h3>
            <p>{selectedNode.data.description}</p>
            <div className="node-status">
              Status: <b>{selectedNode.data.status}</b>
            </div>
            <button className="close-details" style={{ minWidth: 110 }} onClick={() => setSelectedNode(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph; 