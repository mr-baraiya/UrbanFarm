import React, { useState } from 'react';
import { 
  RiDropLine, 
  RiShoppingBasketLine, 
  RiScissorsCutLine, 
  RiBugLine, 
  RiCalendarEventLine, 
  RiCheckLine, 
  RiEditLine, 
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCheckboxCircleLine
} from 'react-icons/ri';
import { TbPlant2, TbFlask } from 'react-icons/tb';
import { formatDate } from '../../utils/helpers';
import './CalendarView.css';

const getTypeIcon = (type) => {
  switch (type) {
    case 'watering':
      return <RiDropLine className="task-type-icon water" />;
    case 'fertilizing':
      return <TbFlask className="task-type-icon fert" />;
    case 'planting':
      return <TbPlant2 className="task-type-icon plant" />;
    case 'harvesting':
      return <RiShoppingBasketLine className="task-type-icon harvest" />;
    case 'pruning':
      return <RiScissorsCutLine className="task-type-icon prune" />;
    case 'pest_check':
      return <RiBugLine className="task-type-icon bug" />;
    case 'other':
    default:
      return <RiCalendarEventLine className="task-type-icon other" />;
  }
};

const CalendarView = ({ tasks, onComplete, onSnooze, onEdit, onDelete }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarScale, setCalendarScale] = useState('month'); // 'month', 'week', 'day'

  const isFutureTask = (dueDate) => {
    if (!dueDate) return false;
    const taskDate = new Date(dueDate);
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return taskDate > todayEnd;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);

  const getTasksForDate = (dateObj) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getFullYear() === dateObj.getFullYear() &&
        taskDate.getMonth() === dateObj.getMonth() &&
        taskDate.getDate() === dateObj.getDate()
      );
    });
  };

  const changeDate = (delta) => {
    const newDate = new Date(currentDate);
    if (calendarScale === 'month') {
      newDate.setMonth(newDate.getMonth() + delta);
    } else if (calendarScale === 'week') {
      newDate.setDate(newDate.getDate() + delta * 7);
    } else {
      newDate.setDate(newDate.getDate() + delta);
    }
    setCurrentDate(newDate);
  };

  const isToday = (dateObj) => {
    const today = new Date();
    return (
      dateObj.getFullYear() === today.getFullYear() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getDate() === today.getDate()
    );
  };

  // Get days of the current week
  const getWeekDates = () => {
    const curr = new Date(currentDate);
    const firstDay = curr.getDate() - curr.getDay();
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr);
      d.setDate(firstDay + i);
      week.push(d);
    }
    return week;
  };

  const weekDates = getWeekDates();

  return (
    <div className="calendar-view">
      {/* Calendar Header with Navigation and Scale Switcher */}
      <div className="calendar-header">
        <div className="cal-nav-left">
          <button className="cal-nav-btn" onClick={() => changeDate(-1)} aria-label="Previous">
            <RiArrowLeftSLine /> Prev
          </button>
          <button className="cal-nav-btn today-btn" onClick={() => setCurrentDate(new Date())}>
            Today
          </button>
          <button className="cal-nav-btn" onClick={() => changeDate(1)} aria-label="Next">
            Next <RiArrowRightSLine />
          </button>
        </div>

        <h3 className="cal-title">
          {calendarScale === 'month' && (
            `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`
          )}
          {calendarScale === 'week' && (
            `Week of ${weekDates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
          )}
          {calendarScale === 'day' && (
            `${currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`
          )}
        </h3>

        <div className="cal-scale-switcher">
          <button 
            className={`scale-btn ${calendarScale === 'month' ? 'active' : ''}`}
            onClick={() => setCalendarScale('month')}
          >
            Month
          </button>
          <button 
            className={`scale-btn ${calendarScale === 'week' ? 'active' : ''}`}
            onClick={() => setCalendarScale('week')}
          >
            Week
          </button>
          <button 
            className={`scale-btn ${calendarScale === 'day' ? 'active' : ''}`}
            onClick={() => setCalendarScale('day')}
          >
            Day
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {calendarScale === 'month' && (
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
            const dayTasks = getTasksForDate(dateObj);
            const hasTasks = dayTasks.length > 0;
            const isTodayDay = isToday(dateObj);
            const dayOfWeek = (firstDayOfMonth + i) % 7;
            const isRightAligned = dayOfWeek >= 4;

            return (
              <div 
                key={dayNum} 
                className={`calendar-day ${isTodayDay ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''} ${selectedDate === dayNum ? 'selected' : ''} ${isRightAligned ? 'align-popup-right' : ''}`}
                onClick={() => setSelectedDate(selectedDate === dayNum ? null : dayNum)}
              >
                <div className="calendar-day-header">
                  <span className={`day-number ${isTodayDay ? 'today-num' : ''}`}>{dayNum}</span>
                  {hasTasks && (
                    <span className="day-task-count-pill">{dayTasks.length}</span>
                  )}
                </div>

                {hasTasks && (
                  <div className="cal-day-tasks-list">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div 
                        key={task._id || task.title} 
                        className={`cal-task-chip type-${task.type || 'other'} ${task.priority || 'medium'} ${task.completed ? 'completed' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEdit) onEdit(task);
                        }}
                        title={`${task.title} (${task.priority || 'medium'} priority)${task.completed ? ' - Completed' : ''}`}
                      >
                        <span className="chip-icon">{getTypeIcon(task.type)}</span>
                        <span className="chip-title">{task.title}</span>
                        {onComplete && !task.completed && (
                          <button 
                            className="chip-quick-check" 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isFutureTask(task.dueDate)) onComplete(task._id);
                            }}
                            disabled={isFutureTask(task.dueDate)}
                            title={isFutureTask(task.dueDate) ? 'Future task (cannot complete ahead of time)' : 'Complete task'}
                          >
                            <RiCheckLine />
                          </button>
                        )}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div 
                        className="cal-more-chip"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(dayNum);
                        }}
                      >
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                )}

                {selectedDate === dayNum && (
                  <div className="day-tasks-popup" onClick={(e) => e.stopPropagation()}>
                    <div className="popup-header">
                      <span className="popup-date-title">{formatDate(dateObj)}</span>
                      <button className="popup-close" onClick={() => setSelectedDate(null)} aria-label="Close">
                        <RiCloseLine />
                      </button>
                    </div>
                    <div className="popup-tasks-list">
                      {dayTasks.map(task => (
                        <div key={task._id || task.title} className={`popup-task-item type-${task.type || 'other'} ${task.priority || 'medium'} ${task.completed ? 'completed' : ''}`}>
                          <span className="popup-task-icon">{getTypeIcon(task.type)}</span>
                          <div className="popup-task-info">
                            <span className="popup-task-title">{task.title}</span>
                            {task.plantId?.name && <span className="popup-task-plant">{task.plantId.name}</span>}
                            {task.description && <span className="popup-task-desc">{task.description}</span>}
                          </div>
                          <div className="popup-task-actions">
                            {onComplete && !task.completed && (
                              <button 
                                className="btn-done-mini" 
                                onClick={() => !isFutureTask(task.dueDate) && onComplete(task._id)} 
                                disabled={isFutureTask(task.dueDate)}
                                title={isFutureTask(task.dueDate) ? 'Future task (cannot complete ahead of time)' : 'Complete'}
                              >
                                <RiCheckLine />
                              </button>
                            )}
                            {onEdit && (
                              <button className="btn-edit-mini" onClick={() => onEdit(task)} title="Edit">
                                <RiEditLine />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {dayTasks.length === 0 && (
                      <div className="popup-empty">No tasks scheduled for this day</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* WEEK VIEW */}
      {calendarScale === 'week' && (
        <div className="week-view-grid">
          {weekDates.map((dayDate, idx) => {
            const dayTasks = getTasksForDate(dayDate);
            const isTodayDay = isToday(dayDate);

            return (
              <div key={idx} className={`week-day-col ${isTodayDay ? 'today' : ''}`}>
                <div className="week-col-header">
                  <span className="week-day-name">{dayDate.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                  <span className={`week-day-num ${isTodayDay ? 'today-num' : ''}`}>{dayDate.getDate()}</span>
                </div>
                <div className="week-col-tasks">
                  {dayTasks.map(task => (
                    <div 
                      key={task._id} 
                      className={`week-task-card type-${task.type || 'other'} ${task.priority || 'medium'} ${task.completed ? 'completed' : ''}`}
                      onClick={() => onEdit && onEdit(task)}
                    >
                      <span className="task-type-badge">{getTypeIcon(task.type)}</span>
                      <div className="week-task-content">
                        <h5 className="week-task-title">{task.title}</h5>
                        {task.description && <p className="week-task-desc">{task.description}</p>}
                      </div>
                      {onComplete && !task.completed && (
                        <button 
                          className="btn-check-task" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isFutureTask(task.dueDate)) onComplete(task._id);
                          }} 
                          disabled={isFutureTask(task.dueDate)}
                          title={isFutureTask(task.dueDate) ? 'Future task (cannot complete ahead of time)' : 'Complete task'}
                        >
                          <RiCheckLine />
                        </button>
                      )}
                    </div>
                  ))}
                  {dayTasks.length === 0 && (
                    <div className="week-empty-slot">No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DAY VIEW */}
      {calendarScale === 'day' && (
        <div className="day-schedule-view">
          <div className="day-schedule-header">
            <h4>Tasks for {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
            <span className="day-task-count">{getTasksForDate(currentDate).length} tasks scheduled</span>
          </div>
          <div className="day-tasks-container">
            {getTasksForDate(currentDate).map(task => (
              <div key={task._id} className={`day-task-card ${task.priority}`}>
                <div className="day-task-main">
                  <span className="day-task-icon">{getTypeIcon(task.type)}</span>
                  <div className="day-task-info">
                    <h4>{task.title}</h4>
                    {task.description && <p>{task.description}</p>}
                    <div className="day-task-badges">
                      <span className={`badge-priority ${task.priority}`}>{task.priority} priority</span>
                      <span className="badge-type">{task.type}</span>
                    </div>
                  </div>
                </div>
                <div className="day-task-actions">
                  {onComplete && !task.completed && (
                    <button 
                      className="btn-primary" 
                      onClick={() => !isFutureTask(task.dueDate) && onComplete(task._id)}
                      disabled={isFutureTask(task.dueDate)}
                      title={isFutureTask(task.dueDate) ? 'Future task (cannot complete ahead of time)' : 'Complete'}
                    >
                      Mark Completed
                    </button>
                  )}
                  {onSnooze && !task.completed && (
                    <button className="btn-secondary" onClick={() => onSnooze(task._id)}>Snooze +1d</button>
                  )}
                  {onEdit && (
                    <button className="btn-secondary" onClick={() => onEdit(task)}>Edit</button>
                  )}
                  {onDelete && (
                    <button className="btn-danger" onClick={() => onDelete(task._id)}>Delete</button>
                  )}
                </div>
              </div>
            ))}
            {getTasksForDate(currentDate).length === 0 && (
              <div className="day-empty-state">
                <div className="day-empty-icon">
                  <RiCheckboxCircleLine />
                </div>
                <h3>No tasks scheduled for this day!</h3>
                <p>Enjoy your gardening or take time to relax and inspect your plants.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;