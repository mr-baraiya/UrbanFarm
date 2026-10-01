import React, { useState } from 'react';
import { addTimelineEntry } from '../../services/plantService';
import { formatDate } from '../../utils/helpers';
import { useNotification } from '../../hooks/useNotification';
import './TimelineView.css';

const TimelineView = ({ plant, onUpdate }) => {
  const [height, setHeight] = useState('');
  const [notes, setNotes] = useState('');
  const { addNotification } = useNotification();

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      await addTimelineEntry(plant._id, { height: parseFloat(height), notes });
      addNotification('Timeline entry added', 'success');
      setHeight('');
      setNotes('');
      onUpdate();
    } catch (error) {
      addNotification('Failed to add entry', 'error');
    }
  };

  return (
    <div className="timeline-view">
      <h3>Growth Timeline for {plant.name}</h3>
      <div className="timeline-entries">
        {plant.growthTimeline?.length === 0 && <p>No entries yet.</p>}
        {plant.growthTimeline?.map((entry, idx) => (
          <div key={idx} className="timeline-entry">
            <span className="entry-date">{formatDate(entry.date)}</span>
            <span className="entry-height">📏 {entry.height} cm</span>
            <span className="entry-notes">{entry.notes}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddEntry} className="add-entry-form">
        <input
          type="number"
          placeholder="Height (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          step="0.1"
          required
        />
        <input
          type="text"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button type="submit" className="btn-primary">Add Entry</button>
      </form>
    </div>
  );
};

export default TimelineView;