import React, { useState } from 'react';
import { formatDate } from '../../utils/helpers';
import './TaskCard.css';

const TaskCard = ({ 
  task, 
  onComplete, 
  onSnooze, 
  onEdit, 
  onDelete, 
  onRestore,
  plants,
  gardens,
  isCompleted 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getTypeIcon = (type) => {
    const map = {
      watering: '💧',
      fertilizing: '🧪',
      planting: '🌱',
      harvesting: '🍅',
      pruning: '✂️',
      pest_check: '🐛',
      other: '📋',
    };
    return map[type] || '📋';
  };

  const getPriorityLabel = (priority) => {
    const map = {
      high: { label: '🔴 High', className: 'high' },
      medium: { label: '🟡 Medium', className: 'medium' },
      low: { label: '🟢 Low', className: 'low' },
    };
    return map[priority] || map.medium;
  };

  const getTypeLabel = (type) => {
    const map = {
      watering: 'Watering',
      fertilizing: 'Fertilizing',
      planting: 'Planting',
      harvesting: 'Harvesting',
      pruning: 'Pruning',
      pest_check: 'Pest Check',
      other: 'Other',
    };
    return map[type] || 'Task';
  };

  const getPlantName = (plantId) => {
    if (!plantId) return null;
    const plant = plants.find(p => p._id === plantId);
    return plant?.name;
  };

  const getGardenName = (gardenId) => {
    if (!gardenId) return null;
    const garden = gardens.find(g => g._id === gardenId);
    return garden?.name;
  };

  const priority = getPriorityLabel(task.priority);
  const isOverdue = !isCompleted && new Date(task.dueDate) < new Date();

  return (
    <div className={`task-card ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
      <div className="task-card-left">
        <button 
          className={`complete-btn ${isCompleted ? 'checked' : ''}`}
          onClick={() => isCompleted ? onRestore?.(task._id) : onComplete(task._id)}
          title={isCompleted ? 'Restore task' : 'Complete task'}
        >
          {isCompleted ? '↩️' : '✓'}
        </button>
        <div className="task-content">
          <div className="task-header">
            <span className="task-icon">{getTypeIcon(task.type)}</span>
            <span className={`task-title ${isCompleted ? 'strikethrough' : ''}`}>
              {task.title}
            </span>
            <span className={`priority-badge ${priority.className}`}>
              {priority.label}
            </span>
          </div>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          <div className="task-meta">
            <span className="task-type">{getTypeLabel(task.type)}</span>
            {getPlantName(task.plantId) && (
              <span className="task-plant">🌱 {getPlantName(task.plantId)}</span>
            )}
            {getGardenName(task.gardenId) && (
              <span className="task-garden">📍 {getGardenName(task.gardenId)}</span>
            )}
            <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
              📅 {formatDate(task.dueDate)}
              {isOverdue && ' ⚠️ Overdue'}
            </span>
            {task.recurring && (
              <span className="task-recurring">🔄 Recurring</span>
            )}
          </div>
        </div>
      </div>

      <div className="task-card-right">
        {!isCompleted && (
          <button 
            className="snooze-btn"
            onClick={() => onSnooze(task._id)}
            title="Snooze +1 day"
          >
            ⏰
          </button>
        )}
        <div className="task-menu">
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
            ⋮
          </button>
          {showMenu && (
            <div className="menu-dropdown">
              <button onClick={() => { onEdit(task); setShowMenu(false); }}>
                ✏️ Edit
              </button>
              <button onClick={() => { onDelete(task._id); setShowMenu(false); }} className="danger">
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;