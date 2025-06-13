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
  }, []);

  const onEdgeClick = useCallback((_, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
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

  if (isLoading) {
    return <div className="loading">Loading knowledge graph...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="knowledge-graph-editor">
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
          {isInstructor && (
            <div className="node-actions">
              <button onClick={() => {/* Add edit functionality */}}>
                Edit Node
              </button>
              <button onClick={() => {/* Add delete functionality */}}>
                Delete Node
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
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphEditor; 