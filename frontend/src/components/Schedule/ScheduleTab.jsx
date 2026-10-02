import React, { useState, useEffect } from 'react';
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
      addNotification('Failed to load tasks', 'error');
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
      await completeTask(id);
      const task = tasks.find(t => t._id === id);
      setTasks(tasks.filter(t => t._id !== id));
      if (task) {
        setCompletedTasks([...completedTasks, { ...task, completed: true }]);
      }
      addNotification('Task completed successfully', 'success');
    } catch (error) {
      addNotification('Failed to complete task', 'error');
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
      addNotification('Task snoozed for 1 day', 'info');
    } catch (error) {
      addNotification('Failed to snooze task', 'error');
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
      title: 'Delete Task',
      message: 'Are you sure you want to delete this scheduled task?',
      onConfirm: async () => {
        try {
          await deleteTask(id);
          setTasks(tasks.filter((t) => t._id !== id));
          setCompletedTasks(completedTasks.filter((t) => t._id !== id));
          addNotification('Task deleted', 'success');
        } catch (error) {
          addNotification('Failed to delete task', 'error');
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
      addNotification('Task restored', 'success');
    } catch (error) {
      addNotification('Failed to restore task', 'error');
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
            <RiCalendarEventLine className="header-icon" /> Tasks & Schedule
          </h2>
          <span className="task-count">{tasks.length} active tasks</span>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <RiAddLine /> Add Task
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className={`stat-card ${stats.overdue > 0 ? 'warning' : ''}`}>
          <span className="stat-value">{stats.overdue}</span>
          <span className="stat-label">
            {stats.overdue > 0 ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#dc2626', fontWeight: 600 }}>
                <RiAlertLine /> Overdue
              </span>
            ) : (
              'Overdue'
            )}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{Math.round((stats.completed / (stats.total || 1)) * 100)}%</span>
          <span className="stat-label">Completion Rate</span>
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
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RiListCheck2 /> List
          </button>
          <button 
            className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
            title="Calendar View"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RiCalendar2Line /> Calendar
          </button>
          <button 
            className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
            title="Kanban Board"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RiDashboardLine /> Board
          </button>
        </div>

        <div className="filter-group">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Tasks</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="upcoming">Upcoming</option>
          </select>
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="watering">Watering</option>
            <option value="fertilizing">Fertilizing</option>
            <option value="planting">Planting</option>
            <option value="harvesting">Harvesting</option>
            <option value="pruning">Pruning</option>
            <option value="pest_check">Pest Check</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button 
          className={`toggle-completed ${showCompleted ? 'active' : ''}`}
          onClick={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted ? 'Hide Completed' : `Show Completed (${completedTasks.length})`}
        </button>
      </div>

      {/* Task Views */}
      <div className="schedule-content">
        {loading ? (
          <div className="schedule-loading">
            <RiLoader4Line className="schedule-spin-icon" />
            <p>Loading tasks & schedule...</p>
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
                <RiListCheck2 /> To Do
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
                <div className="kanban-empty">No tasks</div>
              )}
            </div>
            <div className="kanban-column">
              <h4>
                <RiCheckLine /> Completed
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
                <div className="kanban-empty">No completed tasks</div>
              )}
            </div>
          </div>
        ) : (
          // List View
          <div className="task-list">
            {/* Group by date */}
            {groupTasksByDate(filteredTasks).map(({ label, tasks: groupedTasks }) => (
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
                <h3>All caught up!</h3>
                <p>No tasks matching your filters</p>
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
              <RiCheckLine /> Completed Tasks
            </h3>
            <span className="drawer-count">{completedTasks.length} tasks</span>
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
                addNotification('Task updated!', 'success');
              } else {
                await createTask(data);
                addNotification('Task created!', 'success');
              }
              setShowForm(false);
              setEditingTask(null);
              loadData();
            } catch (error) {
              addNotification('Failed to save task', 'error');
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
const groupTasksByDate = (tasks) => {
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

  if (todayTasks.length > 0) groups.push({ label: 'Today', tasks: todayTasks });
  if (tomorrowTasks.length > 0) groups.push({ label: 'Tomorrow', tasks: tomorrowTasks });
  if (weekTasks.length > 0) groups.push({ label: 'This Week', tasks: weekTasks });
  if (futureTasks.length > 0) groups.push({ label: 'Upcoming', tasks: futureTasks });

  return groups;
};

export default ScheduleTab;