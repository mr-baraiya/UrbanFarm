import React from 'react';
import { completeTask } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import './TodayTasks.css';

const TodayTasks = ({ tasks, onTaskUpdate }) => {
  const { addNotification } = useNotification();

  const handleComplete = async (taskId) => {
    try {
      await completeTask(taskId);
      addNotification('Task completed! ✅', 'success');
      onTaskUpdate();
    } catch (error) {
      addNotification('Failed to complete task', 'error');
    }
  };

  const getPriorityEmoji = (priority) => {
    const map = {
      high: '🔴',
      medium: '🟡',
      low: '🟢',
    };
    return map[priority] || '🟢';
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
        <h3>📋 Today's Tasks</h3>
        <div className="no-tasks">
          <span className="no-tasks-icon">✅</span>
          <p>All caught up! No tasks due today.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="today-tasks">
      <div className="tasks-header">
        <h3>📋 Today's Priorities</h3>
        <span className="task-count">{todayTasks.length} tasks</span>
      </div>
      <ul className="task-list">
        {todayTasks.map((task) => (
          <li key={task._id} className="task-item">
            <div className="task-info">
              <span className="task-priority">{getPriorityEmoji(task.priority)}</span>
              <span className="task-title">{task.title}</span>
              {task.plantId?.name && (
                <span className="task-plant">🌱 {task.plantId.name}</span>
              )}
            </div>
            <div className="task-actions">
              <span className="task-due">
                {new Date(task.dueDate).toISOString().split('T')[0] === today 
                  ? 'Today' 
                  : 'Overdue'}
              </span>
              <button 
                className="task-complete-btn"
                onClick={() => handleComplete(task._id)}
              >
                ✓
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodayTasks;