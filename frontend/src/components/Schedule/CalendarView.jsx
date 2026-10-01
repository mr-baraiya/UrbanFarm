import React, { useState } from 'react';
import { formatDate } from '../../utils/helpers';
import './CalendarView.css';

const CalendarView = ({ tasks, onComplete, onSnooze, onEdit, onDelete }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);

  const getTasksForDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const isToday = (day) => {
    const today = new Date();
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toDateString() === today.toDateString();
  };

  const getDayTasks = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button className="month-nav" onClick={() => changeMonth(-1)}>◀</button>
        <h3>
          {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
        </h3>
        <button className="month-nav" onClick={() => changeMonth(1)}>▶</button>
      </div>

      <div className="calendar-grid">
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}

        {/* Empty days */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty"></div>
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayTasks = getTasksForDate(day);
          const hasTasks = dayTasks.length > 0;
          const isTodayDay = isToday(day);

          return (
            <div 
              key={day} 
              className={`calendar-day ${isTodayDay ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}`}
              onClick={() => setSelectedDate(selectedDate === day ? null : day)}
            >
              <span className="day-number">{day}</span>
              {hasTasks && (
                <div className="day-task-indicators">
                  {dayTasks.slice(0, 3).map((task, idx) => (
                    <span key={idx} className={`task-dot ${task.priority}`} title={task.title}></span>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="task-more">+{dayTasks.length - 3}</span>
                  )}
                </div>
              )}
              {selectedDate === day && (
                <div className="day-tasks-popup">
                  <div className="popup-header">
                    <span>{formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}</span>
                    <button className="popup-close" onClick={() => setSelectedDate(null)}>✕</button>
                  </div>
                  {dayTasks.map(task => (
                    <div key={task._id} className="popup-task">
                      <span className="popup-task-icon">{getTypeIcon(task.type)}</span>
                      <span className="popup-task-title">{task.title}</span>
                      <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                    </div>
                  ))}
                  {dayTasks.length === 0 && (
                    <div className="popup-empty">No tasks</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function
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

export default CalendarView;