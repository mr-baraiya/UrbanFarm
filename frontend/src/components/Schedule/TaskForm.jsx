import React, { useState, useEffect } from 'react';
import { TASK_TYPES, TASK_PRIORITIES } from '../../utils/constants';
import { useNotification } from '../../hooks/useNotification';
import './TaskForm.css';

const TaskForm = ({ task, onClose, onSubmit, plants, gardens }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'other',
    priority: 'medium',
    dueDate: '',
    plantId: '',
    gardenId: '',
    recurring: false,
    recurringInterval: 3,
    recurringUnit: 'days',
  });
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        type: task.type || 'other',
        priority: task.priority || 'medium',
        dueDate: task.dueDate?.slice(0, 10) || '',
        plantId: task.plantId?._id || task.plantId || '',
        gardenId: task.gardenId?._id || task.gardenId || '',
        recurring: task.recurring || false,
        recurringInterval: task.recurringInterval || 3,
        recurringUnit: task.recurringUnit || 'days',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      addNotification('Task title is required', 'error');
      return;
    }

    if (!formData.dueDate) {
      addNotification('Due date is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        priority: formData.priority,
        dueDate: formData.dueDate,
        plantId: formData.plantId || undefined,
        gardenId: formData.gardenId || undefined,
        recurring: formData.recurring,
        recurringInterval: formData.recurring ? formData.recurringInterval : undefined,
        recurringUnit: formData.recurring ? formData.recurringUnit : undefined,
      };
      
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-form" onClick={(e) => e.stopPropagation()}>
        <h3>{task ? 'Edit Task' : 'Create New Task'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details..."
              rows="2"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                {TASK_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Due Date *</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {gardens && gardens.length > 0 && (
            <div className="form-group">
              <label>Garden (optional)</label>
              <select name="gardenId" value={formData.gardenId} onChange={handleChange}>
                <option value="">None</option>
                {gardens.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {plants && plants.length > 0 && (
            <div className="form-group">
              <label>Plant (optional)</label>
              <select name="plantId" value={formData.plantId} onChange={handleChange}>
                <option value="">None</option>
                {plants.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group recurring-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="recurring"
                checked={formData.recurring}
                onChange={handleChange}
              />
              <span>🔄 Recurring Task</span>
            </label>
          </div>

          {formData.recurring && (
            <div className="form-row">
              <div className="form-group">
                <label>Repeat Every</label>
                <input
                  type="number"
                  name="recurringInterval"
                  value={formData.recurringInterval}
                  onChange={handleChange}
                  min="1"
                  max="30"
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select name="recurringUnit" value={formData.recurringUnit} onChange={handleChange}>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;