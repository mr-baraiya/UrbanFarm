import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
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
  const { t, i18n } = useTranslation();
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

  const getTranslatedTypeLabel = (type) => {
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

  const getTranslatedPriorityLabel = (priority) => {
    const map = {
      high: t('schedule.priorityHigh', 'High'),
      medium: t('schedule.priorityMedium', 'Medium'),
      low: t('schedule.priorityLow', 'Low'),
    };
    return map[priority] || priority;
  };

  // Generate localized weekday headers
  const baseSunday = new Date(2026, 0, 4); // Sunday
  const weekdayNames = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(baseSunday);
    d.setDate(baseSunday.getDate() + i);
    return d.toLocaleDateString(i18n.language, { weekday: 'short' });
  });

  return (
    <div className="calendar-view">
      {/* Calendar Header with Navigation and Scale Switcher */}
      <div className="calendar-header">
        <div className="cal-nav-left">
          <button className="cal-nav-btn" onClick={() => changeDate(-1)} aria-label={t('schedule.calPrev', 'Prev')}>
            <RiArrowLeftSLine /> {t('schedule.calPrev', 'Prev')}
          </button>
          <button className="cal-nav-btn today-btn" onClick={() => setCurrentDate(new Date())}>
            {t('schedule.calToday', 'Today')}
          </button>
          <button className="cal-nav-btn" onClick={() => changeDate(1)} aria-label={t('schedule.calNext', 'Next')}>
            {t('schedule.calNext', 'Next')} <RiArrowRightSLine />
          </button>
        </div>

        <h3 className="cal-title">
          {calendarScale === 'month' && (
            currentDate.toLocaleString(i18n.language, { month: 'long', year: 'numeric' })
          )}
          {calendarScale === 'week' && (
            `${weekDates[0].toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' })}`
          )}
          {calendarScale === 'day' && (
            currentDate.toLocaleDateString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
          )}
        </h3>

        <div className="cal-scale-switcher">
          <button 
            className={`scale-btn ${calendarScale === 'month' ? 'active' : ''}`}
            onClick={() => setCalendarScale('month')}
          >
            {t('schedule.calMonth', 'Month')}
          </button>
          <button 
            className={`scale-btn ${calendarScale === 'week' ? 'active' : ''}`}
            onClick={() => setCalendarScale('week')}
          >
            {t('schedule.calWeek', 'Week')}
          </button>
          <button 
            className={`scale-btn ${calendarScale === 'day' ? 'active' : ''}`}
            onClick={() => setCalendarScale('day')}
          >
            {t('schedule.calDay', 'Day')}
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {calendarScale === 'month' && (
        <div className="calendar-grid">
          {weekdayNames.map((day, idx) => (
            <div key={idx} className="calendar-weekday">{day}</div>
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
                    {dayTasks.slice(0, 3).map((task) => {
                      const taskTitle = getLocalizedDynamicText(task.title, i18n.language);
                      return (
                        <div 
                          key={task._id || task.title} 
                          className={`cal-task-chip type-${task.type || 'other'} ${task.priority || 'medium'} ${task.completed ? 'completed' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEdit) onEdit(task);
                          }}
                          title={`${taskTitle} (${getTranslatedPriorityLabel(task.priority || 'medium')})${task.completed ? ` - ${t('schedule.statusCompleted', 'Completed')}` : ''}`}
                        >
                          <span className="chip-icon">{getTypeIcon(task.type)}</span>
                          <span className="chip-title">{taskTitle}</span>
                          {onComplete && !task.completed && (
                            <button 
                              className="chip-quick-check" 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isFutureTask(task.dueDate)) onComplete(task._id);
                              }}
                              disabled={isFutureTask(task.dueDate)}
                              title={isFutureTask(task.dueDate) ? t('schedule.futureTaskTooltip', 'Future task (cannot complete ahead of time)') : t('schedule.completeTask', 'Complete task')}
                            >
                              <RiCheckLine />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <div 
                        className="cal-more-chip"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(dayNum);
                        }}
                      >
                        +{dayTasks.length - 3} {t('schedule.more', 'more')}
                      </div>
                    )}
                  </div>
                )}

                {selectedDate === dayNum && (
                  <div className="day-tasks-popup" onClick={(e) => e.stopPropagation()}>
                    <div className="popup-header">
                      <span className="popup-date-title">{dateObj.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <button className="popup-close" onClick={() => setSelectedDate(null)} aria-label="Close">
                        <RiCloseLine />
                      </button>
                    </div>
                    <div className="popup-tasks-list">
                      {dayTasks.map(task => {
                        const taskTitle = getLocalizedDynamicText(task.title, i18n.language);
                        const plantName = task.plantId?.name ? getLocalizedDynamicText(task.plantId.name, i18n.language) : null;
                        const desc = task.description ? getLocalizedDynamicText(task.description, i18n.language) : null;
                        return (
                          <div key={task._id || task.title} className={`popup-task-item type-${task.type || 'other'} ${task.priority || 'medium'} ${task.completed ? 'completed' : ''}`}>
                            <span className="popup-task-icon">{getTypeIcon(task.type)}</span>
                            <div className="popup-task-info">
                              <span className="popup-task-title">{taskTitle}</span>
                              {plantName && <span className="popup-task-plant">{plantName}</span>}
                              {desc && <span className="popup-task-desc">{desc}</span>}
                            </div>
                            <div className="popup-task-actions">
                              {onComplete && !task.completed && (
                                <button 
                                  className="btn-done-mini" 
                                  onClick={() => !isFutureTask(task.dueDate) && onComplete(task._id)} 
                                  disabled={isFutureTask(task.dueDate)}
                                  title={isFutureTask(task.dueDate) ? t('schedule.futureTaskTooltip', 'Future task (cannot complete ahead of time)') : t('schedule.completeTask', 'Complete')}
                                >
                                  <RiCheckLine />
                                </button>
                              )}
                              {onEdit && (
                                <button className="btn-edit-mini" onClick={() => onEdit(task)} title={t('schedule.edit', 'Edit')}>
                                  <RiEditLine />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {dayTasks.length === 0 && (
                      <div className="popup-empty">{t('schedule.noTasksForDay', 'No tasks scheduled for this day')}</div>
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
                  <span className="week-day-name">{dayDate.toLocaleDateString(i18n.language, { weekday: 'short' })}</span>
                  <span className={`week-day-num ${isTodayDay ? 'today-num' : ''}`}>{dayDate.getDate()}</span>
                </div>
                <div className="week-col-tasks">
                  {dayTasks.map(task => {
                    const taskTitle = getLocalizedDynamicText(task.title, i18n.language);
                    const desc = task.description ? getLocalizedDynamicText(task.description, i18n.language) : null;
                    return (
                      <div 
                        key={task._id} 
                        className={`week-task-card type-${task.type || 'other'} ${task.priority || 'medium'} ${task.completed ? 'completed' : ''}`}
                        onClick={() => onEdit && onEdit(task)}
                      >
                        <span className="task-type-badge">{getTypeIcon(task.type)}</span>
                        <div className="week-task-content">
                          <h5 className="week-task-title">{taskTitle}</h5>
                          {desc && <p className="week-task-desc">{desc}</p>}
                        </div>
                        {onComplete && !task.completed && (
                          <button 
                            className="btn-check-task" 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isFutureTask(task.dueDate)) onComplete(task._id);
                            }} 
                            disabled={isFutureTask(task.dueDate)}
                            title={isFutureTask(task.dueDate) ? t('schedule.futureTaskTooltip', 'Future task (cannot complete ahead of time)') : t('schedule.completeTask', 'Complete task')}
                          >
                            <RiCheckLine />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {dayTasks.length === 0 && (
                    <div className="week-empty-slot">{t('schedule.noTasks', 'No tasks')}</div>
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
            <h4>{t('schedule.tasksForDate', { date: currentDate.toLocaleDateString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric' }), defaultValue: `Tasks for ${currentDate.toLocaleDateString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric' })}` })}</h4>
            <span className="day-task-count">{t('schedule.tasksScheduledCount', { count: getTasksForDate(currentDate).length, defaultValue: `${getTasksForDate(currentDate).length} tasks scheduled` })}</span>
          </div>
          <div className="day-tasks-container">
            {getTasksForDate(currentDate).map(task => {
              const taskTitle = getLocalizedDynamicText(task.title, i18n.language);
              const desc = task.description ? getLocalizedDynamicText(task.description, i18n.language) : null;
              return (
                <div key={task._id} className={`day-task-card ${task.priority}`}>
                  <div className="day-task-main">
                    <span className="day-task-icon">{getTypeIcon(task.type)}</span>
                    <div className="day-task-info">
                      <h4>{taskTitle}</h4>
                      {desc && <p>{desc}</p>}
                      <div className="day-task-badges">
                        <span className={`badge-priority ${task.priority}`}>{getTranslatedPriorityLabel(task.priority)} {t('schedule.priorityLabel', 'Priority')}</span>
                        <span className="badge-type">{getTranslatedTypeLabel(task.type)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="day-task-actions">
                    {onComplete && !task.completed && (
                      <button 
                        className="btn-primary" 
                        onClick={() => !isFutureTask(task.dueDate) && onComplete(task._id)}
                        disabled={isFutureTask(task.dueDate)}
                        title={isFutureTask(task.dueDate) ? t('schedule.futureTaskTooltip', 'Future task (cannot complete ahead of time)') : t('schedule.completeTask', 'Complete')}
                      >
                        {t('schedule.markCompleted', 'Mark Completed')}
                      </button>
                    )}
                    {onSnooze && !task.completed && (
                      <button className="btn-secondary" onClick={() => onSnooze(task._id)}>{t('schedule.snooze1d', 'Snooze +1d')}</button>
                    )}
                    {onEdit && (
                      <button className="btn-secondary" onClick={() => onEdit(task)}>{t('schedule.edit', 'Edit')}</button>
                    )}
                    {onDelete && (
                      <button className="btn-danger" onClick={() => onDelete(task._id)}>{t('schedule.delete', 'Delete')}</button>
                    )}
                  </div>
                </div>
              );
            })}
            {getTasksForDate(currentDate).length === 0 && (
              <div className="day-empty-state">
                <div className="day-empty-icon">
                  <RiCheckboxCircleLine />
                </div>
                <h3>{t('schedule.noTasksForDayTitle', 'No tasks scheduled for this day!')}</h3>
                <p>{t('schedule.noTasksForDayDesc', 'Enjoy your gardening or take time to relax and inspect your plants.')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;