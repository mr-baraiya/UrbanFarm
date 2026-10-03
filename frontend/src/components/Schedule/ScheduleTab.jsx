import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiCalendarEventLine, 
  RiCalendar2Line, 
  RiAddLine, 
  RiAlertLine, 
  RiSearchLine, 
  RiListCheck2, 
  RiDashboardLine, 
  RiCheckDoubleLine, 
  RiCheckLine,
  RiTimeLine,
  RiLoader4Line
} from 'react-icons/ri';
import { getTasks, completeTask, deleteTask, createTask, updateTask } from '../../services/plantService';
import { getPlants, getGardens } from '../../services/plantService';
import { useNotification } from '../../hooks/useNotification';
import ConfirmModal from '../Common/ConfirmModal';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import CalendarView from './CalendarView';
import './ScheduleTab.css';

const ScheduleTab = () => {
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'kanban'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'today', 'week', 'upcoming'
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [plants, setPlants] = useState([]);
  const [gardens, setGardens] = useState([]);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filterStatus, filterPriority, filterType, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, plantsData, gardensData] = await Promise.all([
        getTasks(),
        getPlants(),
        getGardens(),
      ]);
      
      const activeTasks = tasksData?.filter(t => !t.completed) || [];
      const completed = tasksData?.filter(t => t.completed) || [];
      
      setTasks(activeTasks);
      setCompletedTasks(completed);
      setPlants(plantsData || []);
      setGardens(gardensData || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      addNotification(t('schedule.failedLoadTasks', 'Failed to load tasks'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
      );
    }
    
    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }
    
    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }
    
    // Status filter (date based)
    const today = new Date();
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    if (filterStatus === 'today') {
      filtered = filtered.filter(t => {
        const dueDate = new Date(t.dueDate);
        return dueDate.toDateString() === today.toDateString();
      });
    } else if (filterStatus === 'week') {
      filtered = filtered.filter(t => {
        const dueDate = new Date(t.dueDate);
        return dueDate >= today && dueDate <= weekEnd;
      });
    } else if (filterStatus === 'upcoming') {
      filtered = filtered.filter(t => {
        const dueDate = new Date(t.dueDate);
        return dueDate > weekEnd;
      });
    }
    
    // Sort by due date
    filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    setFilteredTasks(filtered);
  };

  const getCalendarTasks = () => {
    let list = showCompleted ? [...tasks, ...completedTasks] : [...tasks];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(t => 
        t.title?.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
      );
    }
    if (filterPriority !== 'all') {
      list = list.filter(t => t.priority === filterPriority);
    }
    if (filterType !== 'all') {
      list = list.filter(t => t.type === filterType);
    }
    return list;
  };

  const handleComplete = async (id) => {
    try {
      const task = tasks.find(t => t._id === id);
      if (task && task.dueDate) {
        const now = new Date();
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        if (new Date(task.dueDate) > todayEnd) {
          addNotification(t('schedule.cannotCompleteFuture', 'Cannot complete future tasks ahead of time'), 'warning');
          return;
        }
      }
      await completeTask(id);
      setTasks(tasks.filter(t => t._id !== id));
      if (task) {
        setCompletedTasks([...completedTasks, { ...task, completed: true }]);
      }
      addNotification(t('schedule.taskCompletedSuccess', 'Task completed successfully'), 'success');
    } catch (error) {
      const msg = error.response?.data?.message || t('schedule.taskCompleteFailed', 'Failed to complete task');
      addNotification(msg, 'error');
    }
  };

  const handleSnooze = async (id) => {
    try {
      const task = tasks.find(t => t._id === id);
      if (!task) return;
      
      const newDate = new Date(task.dueDate);
      newDate.setDate(newDate.getDate() + 1);
      
      await updateTask(id, { dueDate: newDate.toISOString() });
      task.dueDate = newDate.toISOString();
      setTasks([...tasks]);
      addNotification(t('schedule.taskSnoozed', 'Task snoozed for 1 day'), 'info');
    } catch (error) {
      addNotification(t('schedule.taskSnoozeFailed', 'Failed to snooze task'), 'error');
    }
  };

  // Custom Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const promptDeleteTask = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: t('schedule.deleteTaskTitle', 'Delete Task'),
      message: t('schedule.deleteTaskConfirm', 'Are you sure you want to delete this scheduled task?'),
      onConfirm: async () => {
        try {
          await deleteTask(id);
          setTasks(tasks.filter((t) => t._id !== id));
          setCompletedTasks(completedTasks.filter((t) => t._id !== id));
          addNotification(t('schedule.taskDeleted', 'Task deleted'), 'success');
        } catch (error) {
          addNotification(t('schedule.taskDeleteFailed', 'Failed to delete task'), 'error');
        }
      },
    });
  };

  const handleRestore = async (id) => {
    try {
      await updateTask(id, { completed: false });
      const task = completedTasks.find(t => t._id === id);
      setCompletedTasks(completedTasks.filter(t => t._id !== id));
      if (task) {
        setTasks([...tasks, { ...task, completed: false }]);
      }
      addNotification(t('schedule.taskRestored', 'Task restored'), 'success');
    } catch (error) {
      addNotification(t('schedule.taskRestoreFailed', 'Failed to restore task'), 'error');
    }
  };

  const getTaskStats = () => {
    const total = tasks.length + completedTasks.length;
    const completed = completedTasks.length;
    const overdue = tasks.filter(t => new Date(t.dueDate) < new Date()).length;
    return { total, completed, overdue };
  };

  const stats = getTaskStats();

  return (
    <div className="schedule-tab">
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
      {/* Header */}
      <div className="schedule-header">
        <div className="header-left">
          <h2>
            <RiCalendarEventLine className="header-icon" /> {t('schedule.title', 'Tasks & Schedule')}
          </h2>
          <span className="task-count">{t('schedule.activeTasksCount', { count: tasks.length, defaultValue: `${tasks.length} active tasks` })}</span>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <RiAddLine /> {t('schedule.addTask', 'Add Task')}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">{t('schedule.totalTasks', 'Total Tasks')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">{t('schedule.completed', 'Completed')}</span>
        </div>
        <div className={`stat-card ${stats.overdue > 0 ? 'warning' : ''}`}>
          <span className="stat-value">{stats.overdue}</span>
          <span className="stat-label">
            {stats.overdue > 0 ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#dc2626', fontWeight: 600 }}>
                <RiAlertLine /> {t('schedule.overdue', 'Overdue')}
              </span>
            ) : (
              t('schedule.overdue', 'Overdue')
            )}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{Math.round((stats.completed / (stats.total || 1)) * 100)}%</span>
          <span className="stat-label">{t('schedule.completionRate', 'Completion Rate')}</span>
        </div>
      </div>

      {/* Controls - All in One Unified Line */}
      <div className="schedule-controls">
        <div className="search-bar">
          <span className="search-icon">
            <RiSearchLine />
          </span>
          <input
            type="text"
            placeholder={t('schedule.searchPlaceholder', 'Search tasks...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title={t('schedule.viewListTitle', 'List View')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RiListCheck2 /> {t('schedule.viewList', 'List')}
          </button>
          <button 
            className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
            title={t('schedule.viewCalendarTitle', 'Calendar View')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RiCalendar2Line /> {t('schedule.viewCalendar', 'Calendar')}
          </button>
          <button 
            className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
            title={t('schedule.viewBoardTitle', 'Kanban Board')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RiDashboardLine /> {t('schedule.viewBoard', 'Board')}
          </button>
        </div>

        <div className="filter-group">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t('schedule.filterAllTasks', 'All Tasks')}</option>
            <option value="today">{t('schedule.filterToday', 'Today')}</option>
            <option value="week">{t('schedule.filterThisWeek', 'This Week')}</option>
            <option value="upcoming">{t('schedule.filterUpcoming', 'Upcoming')}</option>
          </select>
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t('schedule.filterAllPriorities', 'All Priorities')}</option>
            <option value="high">{t('schedule.priorityHigh', 'High')}</option>
            <option value="medium">{t('schedule.priorityMedium', 'Medium')}</option>
            <option value="low">{t('schedule.priorityLow', 'Low')}</option>
          </select>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t('schedule.filterAllTypes', 'All Types')}</option>
            <option value="watering">{t('schedule.typeWatering', 'Watering')}</option>
            <option value="fertilizing">{t('schedule.typeFertilizing', 'Fertilizing')}</option>
            <option value="planting">{t('schedule.typePlanting', 'Planting')}</option>
            <option value="harvesting">{t('schedule.typeHarvesting', 'Harvesting')}</option>
            <option value="pruning">{t('schedule.typePruning', 'Pruning')}</option>
            <option value="pest_check">{t('schedule.typePestCheck', 'Pest Check')}</option>
            <option value="other">{t('schedule.typeOther', 'Other')}</option>
          </select>
        </div>

        <button 
          className={`toggle-completed ${showCompleted ? 'active' : ''}`}
          onClick={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted ? t('schedule.hideCompleted', 'Hide Completed') : t('schedule.showCompletedCount', { count: completedTasks.length, defaultValue: `Show Completed (${completedTasks.length})` })}
        </button>
      </div>

      {/* Task Views */}
      <div className="schedule-content">
        {loading ? (
          <div className="schedule-loading">
            <RiLoader4Line className="schedule-spin-icon" />
            <p>{t('schedule.loadingTasks', 'Loading tasks & schedule...')}</p>
          </div>
        ) : viewMode === 'calendar' ? (
           <CalendarView 
            tasks={getCalendarTasks()}
            onComplete={handleComplete}
            onSnooze={handleSnooze}
            onEdit={setEditingTask}
            onDelete={promptDeleteTask}
          />
        ) : viewMode === 'kanban' ? (
          <div className="kanban-board">
            <div className="kanban-column">
              <h4>
                <RiListCheck2 /> {t('schedule.toDo', 'To Do')}
              </h4>
              {filteredTasks.filter(t => !t.completed).map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onComplete={handleComplete}
                  onSnooze={handleSnooze}
                  onEdit={setEditingTask}
                  onDelete={promptDeleteTask}
                  plants={plants}
                  gardens={gardens}
                />
              ))}
              {filteredTasks.filter(t => !t.completed).length === 0 && (
                <div className="kanban-empty">{t('schedule.noTasks', 'No tasks')}</div>
              )}
            </div>
            <div className="kanban-column">
              <h4>
                <RiCheckLine /> {t('schedule.completedHeader', 'Completed')}
              </h4>
              {completedTasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onComplete={handleComplete}
                  onSnooze={handleSnooze}
                  onEdit={setEditingTask}
                  onDelete={promptDeleteTask}
                  onRestore={handleRestore}
                  plants={plants}
                  gardens={gardens}
                  isCompleted={true}
                />
              ))}
              {completedTasks.length === 0 && (
                <div className="kanban-empty">{t('schedule.noCompletedTasks', 'No completed tasks')}</div>
              )}
            </div>
          </div>
        ) : (
          // List View
          <div className="task-list">
            {/* Group by date */}
            {groupTasksByDate(filteredTasks, t).map(({ label, tasks: groupedTasks }) => (
              <div key={label} className="task-group">
                <h3 className="group-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <RiCalendarEventLine /> {label}
                </h3>
                {groupedTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onComplete={handleComplete}
                    onSnooze={handleSnooze}
                    onEdit={setEditingTask}
                    onDelete={promptDeleteTask}
                    plants={plants}
                    gardens={gardens}
                  />
                ))}
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="empty-tasks">
                <span className="empty-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RiCheckDoubleLine style={{ color: '#10b981' }} />
                </span>
                <h3>{t('schedule.allCaughtUp', 'All caught up!')}</h3>
                <p>{t('schedule.noTasksMatchingFilters', 'No tasks matching your filters')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Completed Tasks Drawer */}
      {showCompleted && completedTasks.length > 0 && viewMode === 'list' && (
        <div className="completed-drawer">
          <div className="drawer-header">
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <RiCheckLine /> {t('schedule.completedTasks', 'Completed Tasks')}
            </h3>
            <span className="drawer-count">{t('schedule.tasksCount', { count: completedTasks.length, defaultValue: `${completedTasks.length} tasks` })}</span>
          </div>
          {completedTasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onComplete={handleComplete}
              onSnooze={handleSnooze}
              onEdit={setEditingTask}
              onDelete={promptDeleteTask}
              onRestore={handleRestore}
              plants={plants}
              gardens={gardens}
              isCompleted={true}
            />
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          onSubmit={async (data) => {
            try {
              if (editingTask) {
                await updateTask(editingTask._id, data);
                addNotification(t('schedule.taskUpdated', 'Task updated!'), 'success');
              } else {
                await createTask(data);
                addNotification(t('schedule.taskCreated', 'Task created!'), 'success');
              }
              setShowForm(false);
              setEditingTask(null);
              loadData();
            } catch (error) {
              addNotification(t('schedule.taskSaveFailed', 'Failed to save task'), 'error');
            }
          }}
          plants={plants}
          gardens={gardens}
        />
      )}
    </div>
  );
};

// Helper function to group tasks by date
const groupTasksByDate = (tasks, t) => {
  const groups = [];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const todayTasks = tasks.filter(t => new Date(t.dueDate).toDateString() === today.toDateString());
  const tomorrowTasks = tasks.filter(t => new Date(t.dueDate).toDateString() === tomorrow.toDateString());
  const weekTasks = tasks.filter(t => {
    const dueDate = new Date(t.dueDate);
    return dueDate > tomorrow && dueDate <= weekEnd;
  });
  const futureTasks = tasks.filter(t => {
    const dueDate = new Date(t.dueDate);
    return dueDate > weekEnd;
  });

  if (todayTasks.length > 0) groups.push({ label: t ? t('schedule.groupToday', 'Today') : 'Today', tasks: todayTasks });
  if (tomorrowTasks.length > 0) groups.push({ label: t ? t('schedule.groupTomorrow', 'Tomorrow') : 'Tomorrow', tasks: tomorrowTasks });
  if (weekTasks.length > 0) groups.push({ label: t ? t('schedule.groupThisWeek', 'This Week') : 'This Week', tasks: weekTasks });
  if (futureTasks.length > 0) groups.push({ label: t ? t('schedule.groupUpcoming', 'Upcoming') : 'Upcoming', tasks: futureTasks });

  return groups;
};

export default ScheduleTab;