import React, { useState, useEffect } from 'react';
import './KnowledgeGraph.css';

const EdgeEditor = ({ edge, onUpdate, onClose }) => {
  const [edgeData, setEdgeData] = useState({
    type: 'PREREQUISITE',
    weight: 1.0,
  });

  useEffect(() => {
    if (edge) {
      setEdgeData({
        type: edge.type || 'PREREQUISITE',
        weight: edge.weight || 1.0,
      });
    }
  }, [edge]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      id: edge.id,
      ...edgeData,
    });
    onClose();
  };

  return (
    <div className="edge-editor">
      <h3>Edit Relationship</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type">Type:</label>
          <select
            id="type"
            value={edgeData.type}
            onChange={(e) => setEdgeData({ ...edgeData, type: e.target.value })}
          >
            <option value="PREREQUISITE">Prerequisite</option>
            <option value="RELATED_TO">Related To</option>
            <option value="PART_OF">Part Of</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight:</label>
          <input
            type="number"
            id="weight"
            min="0"
            max="1"
            step="0.1"
            value={edgeData.weight}
            onChange={(e) => setEdgeData({ ...edgeData, weight: parseFloat(e.target.value) })}
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

export default EdgeEditor; 