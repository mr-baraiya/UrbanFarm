import React, { useState } from 'react';
import { 
  RiShoppingBasketLine, 
  RiCloseLine, 
  RiStarFill, 
  RiStarLine,
  RiCheckLine
} from 'react-icons/ri';
import { addTimelineEntry, updatePlant } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import './HarvestTrackerModal.css';

const HarvestTrackerModal = ({ plant, onClose, onHarvestLogged }) => {
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('kg');
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [markHarvested, setMarkHarvested] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      addNotification('Please enter a valid harvest amount', 'error');
      return;
    }
    setLoading(true);
    try {
      const entryNote = `Harvest Logged: ${amount} ${unit} | Quality: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}${notes ? ` | ${notes}` : ''}`;
      
      await addTimelineEntry(plant._id, {
        height: 0,
        notes: entryNote,
      });

      if (markHarvested) {
        await updatePlant(plant._id, { status: 'harvested' });
      }

      addNotification(`Harvest of ${amount} ${unit} recorded successfully!`, 'success');
      if (onHarvestLogged) onHarvestLogged();
      onClose();
    } catch (err) {
      addNotification('Failed to record harvest', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="harvest-modal-overlay" onClick={onClose}>
      <div className="harvest-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="harvest-modal-header">
          <h3>
            <RiShoppingBasketLine className="harvest-header-icon" /> Record Harvest - {plant?.name}
          </h3>
          <button className="harvest-close-btn" onClick={onClose} aria-label="Close">
            <RiCloseLine />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="harvest-modal-body">
          <div className="form-group-row">
            <div className="form-group flex-2">
              <label>Harvest Yield / Amount *</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 1.5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group flex-1">
              <label>Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="lbs">Pounds (lbs)</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="bunch">Bunches</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Quality Rating</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`star-btn ${star <= rating ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} star`}
                >
                  {star <= rating ? <RiStarFill /> : <RiStarLine />}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Notes / Taste & Appearance</label>
            <textarea
              placeholder="e.g. Juicy and sweet! Picked fresh at peak ripeness."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
            />
          </div>

          <div className="form-group checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={markHarvested}
                onChange={(e) => setMarkHarvested(e.target.checked)}
              />
              <span>Mark plant status as "Harvested"</span>
            </label>
          </div>

          <div className="harvest-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <RiShoppingBasketLine /> Save Harvest Log
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HarvestTrackerModal;
