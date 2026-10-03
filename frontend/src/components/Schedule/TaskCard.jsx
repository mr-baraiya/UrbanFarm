import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
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
  const { t, i18n } = useTranslation();

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
      high: { label: t('schedule.priorityHigh', 'High'), className: 'high' },
      medium: { label: t('schedule.priorityMedium', 'Medium'), className: 'medium' },
      low: { label: t('schedule.priorityLow', 'Low'), className: 'low' },
    };
    return map[priority] || map.medium;
  };

  const getTypeLabel = (type) => {
    const map = {
      watering: t('schedule.typeWatering', 'Watering'),
      fertilizing: t('schedule.typeFertilizing', 'Fertilizing'),
      planting: t('schedule.typePlanting', 'Planting'),
      harvesting: t('schedule.typeHarvesting', 'Harvesting'),
      pruning: t('schedule.typePruning', 'Pruning'),
      pest_check: t('schedule.typePestCheck', 'Pest Check'),
      other: t('schedule.typeOther', 'Other'),
    };
    return map[type] || t('schedule.typeOther', 'Task');
  };

  const getPlantName = (plantId) => {
    if (!plantId) return null;
    const pidStr = (typeof plantId === 'object' ? plantId._id : plantId)?.toString();
    const plant = plants?.find(p => p._id?.toString() === pidStr);
    const rawName = plant?.name || (typeof plantId === 'object' ? plantId.name : null);
    return rawName ? getLocalizedDynamicText(rawName, i18n.language) : null;
  };

  const getGardenName = (gardenId) => {
    if (!gardenId) return null;
    const gidStr = (typeof gardenId === 'object' ? gardenId._id : gardenId)?.toString();
    const garden = gardens?.find(g => g._id?.toString() === gidStr);
    const rawName = garden?.name || (typeof gardenId === 'object' ? gardenId.name : null);
    return rawName ? getLocalizedDynamicText(rawName, i18n.language) : null;
  };

  const priority = getPriorityLabel(task.priority);
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const isFuture = !isCompleted && task.dueDate && new Date(task.dueDate) > todayEnd;
  const isOverdue = !isCompleted && !isFuture && new Date(task.dueDate) < now;
  const formattedDueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  const localizedTitle = getLocalizedDynamicText(task.title, i18n.language);
  const localizedDesc = task.description ? getLocalizedDynamicText(task.description, i18n.language) : '';

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
              ? t('schedule.restoreTask', 'Restore task') 
              : isFuture 
              ? t('schedule.futureTaskScheduled', { date: formattedDueDate, defaultValue: `Future task scheduled for ${formattedDueDate} (cannot complete ahead of time)` })
              : t('schedule.completeTask', 'Complete task')
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
              {localizedTitle}
            </span>
            <span className={`priority-badge ${priority.className}`}>
              {priority.label}
            </span>
          </div>
          {localizedDesc && (
            <p className="task-description">{localizedDesc}</p>
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
              <RiCalendarEventLine /> {formattedDueDate}
              {isOverdue && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#ef4444', marginLeft: '4px' }}>
                  <RiAlertLine /> {t('schedule.overdue', 'Overdue')}
                </span>
              )}
            </span>
            {task.recurring && (
              <span className="task-recurring" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <RiRepeatLine /> {t('schedule.recurring', 'Recurring')}
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
            title={t('schedule.snooze1day', 'Snooze +1 day')}
            aria-label={t('schedule.snooze1day', 'Snooze +1 day')}
          >
            <RiTimerLine />
          </button>
        )}
        <button 
          className="action-icon-btn edit-btn" 
          onClick={() => onEdit(task)}
          title={t('schedule.editTask', 'Edit Task')}
          aria-label={t('schedule.editTask', 'Edit Task')}
        >
          <RiEditLine />
        </button>
        <button 
          className="action-icon-btn delete-btn" 
          onClick={() => onDelete(task._id)}
          title={t('schedule.deleteTask', 'Delete Task')}
          aria-label={t('schedule.deleteTask', 'Delete Task')}
        >
          <RiDeleteBinLine />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;