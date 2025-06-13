import React, { useState, useEffect } from 'react';
import './KnowledgeGraph.css';

const NodeEditor = ({ node, onUpdate, onClose }) => {
  const [nodeData, setNodeData] = useState({
    label: '',
    type: 'LECTURE',
    description: '',
  });

  useEffect(() => {
    if (node) {
      setNodeData({
        label: node.data.label || '',
        type: node.data.type || 'LECTURE',
        description: node.data.description || '',
      });
    }
  }, [node]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      id: node.id,
      data: nodeData,
    });
    onClose();
  };

  return (
    <div className="node-editor">
      <h3>Edit Node</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="label">Name:</label>
          <input
            type="text"
            id="label"
            value={nodeData.label}
            onChange={(e) => setNodeData({ ...nodeData, label: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Type:</label>
          <select
            id="type"
            value={nodeData.type}
            onChange={(e) => setNodeData({ ...nodeData, type: e.target.value })}
          >
            <option value="LECTURE">Lecture</option>
            <option value="TOPIC">Topic</option>
            <option value="CONCEPT">Concept</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={nodeData.description}
            onChange={(e) => setNodeData({ ...nodeData, description: e.target.value })}
            rows="4"
          />
        </div>

        <div className="button-group">
          <button type="submit" className="save-button">
            Save
          </button>
          <button type="button" onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NodeEditor; 