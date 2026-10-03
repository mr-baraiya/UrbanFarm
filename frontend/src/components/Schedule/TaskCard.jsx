import React from 'react';
import { 
  RiDropLine, 
  RiShoppingBasketLine, 
  RiScissorsCutLine, 
  RiBugLine, 
  RiCalendarEventLine, 
  RiCheckLine, 
  RiRestartLine, 
  RiMapPinLine, 
  RiAlertLine, 
  RiRepeatLine, 
  RiTimerLine, 
  RiEditLine, 
  RiDeleteBinLine 
} from 'react-icons/ri';
import { TbPlant2, TbFlask } from 'react-icons/tb';
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
  const getTypeIcon = (type) => {
    switch (type) {
      case 'watering':
        return <RiDropLine style={{ color: '#0ea5e9' }} />;
      case 'fertilizing':
        return <TbFlask style={{ color: '#8b5cf6' }} />;
      case 'planting':
        return <TbPlant2 style={{ color: '#10b981' }} />;
      case 'harvesting':
        return <RiShoppingBasketLine style={{ color: '#f59e0b' }} />;
      case 'pruning':
        return <RiScissorsCutLine style={{ color: '#64748b' }} />;
      case 'pest_check':
        return <RiBugLine style={{ color: '#ef4444' }} />;
      case 'other':
      default:
        return <RiCalendarEventLine style={{ color: '#2d6a4f' }} />;
    }
  };

  const getPriorityLabel = (priority) => {
    const map = {
      high: { label: 'High', className: 'high' },
      medium: { label: 'Medium', className: 'medium' },
      low: { label: 'Low', className: 'low' },
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
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const isFuture = !isCompleted && task.dueDate && new Date(task.dueDate) > todayEnd;
  const isOverdue = !isCompleted && !isFuture && new Date(task.dueDate) < now;

  return (
    <div className={`task-card ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isFuture ? 'future-task' : ''}`}>
      <div className="task-card-left">
        <button 
          className={`complete-btn ${isCompleted ? 'checked' : ''} ${isFuture ? 'future-disabled' : ''}`}
          onClick={() => {
            if (isCompleted) {
              onRestore?.(task._id);
            } else if (!isFuture) {
              onComplete(task._id);
            }
          }}
          disabled={isFuture}
          title={
            isCompleted 
              ? 'Restore task' 
              : isFuture 
              ? `Future task scheduled for ${formatDate(task.dueDate)} (cannot complete ahead of time)` 
              : 'Complete task'
          }
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isCompleted ? <RiRestartLine /> : <RiCheckLine />}
        </button>
        <div className="task-content">
          <div className="task-header">
            <span className="task-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
              {getTypeIcon(task.type)}
            </span>
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
              <span className="task-plant" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <TbPlant2 /> {getPlantName(task.plantId)}
              </span>
            )}
            {getGardenName(task.gardenId) && (
              <span className="task-garden" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <RiMapPinLine /> {getGardenName(task.gardenId)}
              </span>
            )}
            <span className={`task-due ${isOverdue ? 'overdue' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <RiCalendarEventLine /> {formatDate(task.dueDate)}
              {isOverdue && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#ef4444', marginLeft: '4px' }}>
                  <RiAlertLine /> Overdue
                </span>
              )}
            </span>
            {task.recurring && (
              <span className="task-recurring" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <RiRepeatLine /> Recurring
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="task-card-right">
        {!isCompleted && (
          <button 
            className="action-icon-btn snooze-btn"
            onClick={() => onSnooze(task._id)}
            title="Snooze +1 day"
            aria-label="Snooze +1 day"
          >
            <RiTimerLine />
          </button>
        )}
        <button 
          className="action-icon-btn edit-btn" 
          onClick={() => onEdit(task)}
          title="Edit Task"
          aria-label="Edit Task"
        >
          <RiEditLine />
        </button>
        <button 
          className="action-icon-btn delete-btn" 
          onClick={() => onDelete(task._id)}
          title="Delete Task"
          aria-label="Delete Task"
        >
          <RiDeleteBinLine />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;