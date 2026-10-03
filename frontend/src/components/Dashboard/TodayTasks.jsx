import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiCalendarCheckLine, RiCheckLine, RiCheckboxCircleLine } from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { completeTask } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './TodayTasks.css';

const TodayTasks = ({ tasks, onTaskUpdate }) => {
  const { t, i18n } = useTranslation();
  const { addNotification } = useNotification();

  const handleComplete = async (taskId) => {
    try {
      await completeTask(taskId);
      addNotification(t('messages.savedSuccessfully') || 'Task completed successfully!', 'success');
      onTaskUpdate();
    } catch (error) {
      addNotification(t('messages.operationFailed') || 'Failed to complete task', 'error');
    }
  };

  // Filter tasks due today or overdue
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => {
    const dueDate = new Date(t.dueDate).toISOString().split('T')[0];
    return dueDate <= today;
  }).slice(0, 5);

  if (todayTasks.length === 0) {
    return (
      <div className="today-tasks">
        <h3>
          <RiCalendarCheckLine className="tasks-header-icon" /> {t('dashboard.todaysTasks')}
        </h3>
        <div className="no-tasks">
          <div className="no-tasks-icon-wrap">
            <RiCheckboxCircleLine />
          </div>
          <p>{t('dashboard.noPendingTasks')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="today-tasks">
      <div className="tasks-header">
        <h3>
          <RiCalendarCheckLine className="tasks-header-icon" /> {t('dashboard.todaysPriorities')}
        </h3>
        <span className="task-count">{todayTasks.length} {t('dashboard.tasksCount')}</span>
      </div>
      <ul className="task-list">
        {todayTasks.map((task) => (
          <li key={task._id} className="task-item">
            <div className="task-info">
              <span className={`task-priority-dot ${task.priority || 'medium'}`} title={`${t('common.priority')}: ${task.priority || 'medium'}`} />
              <span className="task-title">{getLocalizedDynamicText(task.title, i18n.language)}</span>
              {task.plantId?.name && (
                <span className="task-plant">
                  <TbPlant2 className="plant-tag-icon" /> {getLocalizedDynamicText(task.plantId.name, i18n.language)}
                </span>
              )}
            </div>
            <div className="task-actions">
              <span className={`task-due ${new Date(task.dueDate).toISOString().split('T')[0] === today ? 'due-today' : 'overdue'}`}>
                {new Date(task.dueDate).toISOString().split('T')[0] === today ? t('dashboard.dueToday') : t('dashboard.overdue')}
              </span>
              <button 
                className="task-complete-btn"
                onClick={() => handleComplete(task._id)}
                title={t('common.confirm') || 'Mark as completed'}
              >
                <RiCheckLine />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodayTasks;