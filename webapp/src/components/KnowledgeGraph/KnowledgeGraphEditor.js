import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodeEditor from './NodeEditor';
import EdgeEditor from './EdgeEditor';
import './KnowledgeGraph.css';
import './KnowledgeGraphEditor.css';

const KnowledgeGraphEditor = ({ courseId, isInstructor }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // New state for add mode
  const [isAddMode, setIsAddMode] = useState(false);
  // New state for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // New state for legend visibility
  const [showLegend, setShowLegend] = useState(true);
  // New state for node status
  const [nodeStatus, setNodeStatus] = useState('LOCKED');

  // Load graph data
  useEffect(() => {
    fetchKnowledgeGraph();
  }, [courseId]);

  const fetchKnowledgeGraph = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost/scholarwatch/knowledge-graph.php?courseId=${courseId}`);
      const data = await response.json();
      
      if (data.success) {
        const { nodes: graphNodes, edges: graphEdges } = data;
        setNodes(graphNodes);
        setEdges(graphEdges);
      } else {
        throw new Error(data.message || 'Failed to fetch knowledge graph');
      }
    } catch (error) {
      setError('Error loading knowledge graph: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setIsAddMode(false);
    setNodeStatus(node.data.status || 'LOCKED');
  }, []);

  const onEdgeClick = useCallback((_, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setIsAddMode(false);
  }, []);

  const onNodeDragStop = useCallback(async (event, node) => {
    try {
      const response = await fetch('http://localhost/scholarwatch/knowledge-graph.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateNodePosition',
          nodeId: node.id,
          position: node.position,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update node position');
      }
    } catch (error) {
      console.error('Error updating node position:', error);
    }
  }, []);

  const onNodeUpdate = useCallback((updatedNode) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === updatedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updatedNode.data,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onEdgeUpdate = useCallback((updatedEdge) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === updatedEdge.id) {
          return {
            ...edge,
            ...updatedEdge,
          };
        }
        return edge;
      })
    );
  }, [setEdges]);

  const onSave = async () => {
    try {
      const response = await fetch('http://localhost/scholarwatch/knowledge-graph.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          graphData: {
            nodes,
            edges,
          },
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Knowledge graph saved successfully!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      alert('Error saving knowledge graph: ' + error.message);
    }
  };

  // New function to handle adding a new topic
  const handleAddTopic = () => {
    setIsAddMode(true);
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  // New function to handle saving a new topic
  const handleSaveNewTopic = (newNodeData) => {
    const newNode = {
      id: 'new-' + Date.now(),
      type: 'default',
      position: { x: 100, y: 100 },
      data: { ...newNodeData, status: 'LOCKED' },
    };
    setNodes((nds) => [...nds, newNode]);
    setIsAddMode(false);
  };

  // New function to handle deleting a topic
  const handleDeleteTopic = () => {
    if (selectedNode) {
      setShowDeleteConfirm(true);
    }
  };

  // New function to confirm deletion
  const confirmDelete = () => {
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNode(null);
    setShowDeleteConfirm(false);
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setNodeStatus(newStatus);
    if (selectedNode) {
      onNodeUpdate({
        id: selectedNode.id,
        data: { ...selectedNode.data, status: newStatus },
      });
    }
  };

  if (isLoading) {
    return <div className="loading">Loading knowledge graph...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="knowledge-graph-editor">
      <div className="toolbar">
        {isInstructor && (
          <button onClick={handleAddTopic} className="toolbar-button">
            Add Topic
          </button>
        )}
        <button onClick={() => setShowLegend(!showLegend)} className="toolbar-button">
          {showLegend ? 'Hide Legend' : 'Show Legend'}
        </button>
      </div>

      <div className="graph-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onNodeDragStop={onNodeDragStop}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
          
          {isInstructor && (
            <Panel position="top-right">
              <button onClick={onSave} className="save-button">
                Save Graph
              </button>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {selectedNode && (
        <div className="node-details">
          <h3>{selectedNode.data.label}</h3>
          <p>Type: {selectedNode.data.type}</p>
          {selectedNode.data.description && (
            <p>Description: {selectedNode.data.description}</p>
          )}
          <div className="node-status">
            <label htmlFor="status">Status:</label>
            <select id="status" value={nodeStatus} onChange={handleStatusChange}>
              <option value="LOCKED">Locked</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          {isInstructor && (
            <div className="node-actions">
              <button onClick={() => {/* Edit functionality */}}>
                Edit Node
              </button>
              <button onClick={handleDeleteTopic}>
                Delete Topic
              </button>
            </div>
          )}
        </div>
      )}

      {isInstructor && (
        <div className="editor-panel">
          {selectedNode && (
            <NodeEditor
              node={selectedNode}
              onUpdate={onNodeUpdate}
              onClose={() => setSelectedNode(null)}
            />
          )}
          {selectedEdge && (
            <EdgeEditor
              edge={selectedEdge}
              onUpdate={onEdgeUpdate}
              onClose={() => setSelectedEdge(null)}
            />
          )}
          {isAddMode && (
            <NodeEditor
              node={{ id: 'new', data: { label: '', type: 'TOPIC', description: '' } }}
              onUpdate={handleSaveNewTopic}
              onClose={() => setIsAddMode(false)}
            />
          )}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this topic?</p>
            <div className="delete-confirm-actions">
              <button onClick={confirmDelete} className="confirm-button">Yes, Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphEditor; 