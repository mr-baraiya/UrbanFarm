import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getGardens, getPlants, getTasks, getDiagnosisHistory } from '../../services/plantService';
import { getWeather } from '../../services/weatherService';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import WeatherWidget from './WeatherWidget';
import AIInsights from './AIInsights';
import PlantGallery from './PlantGallery';
import TodayTasks from './TodayTasks';
import GardenHealth from './GardenHealth';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ gardens: 0, plants: 0, tasks: 0, diagnoses: 0 });
  const [activities, setActivities] = useState([]);
  const [plants, setPlants] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [gardens, setGardens] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState(85);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (user?.location?.city) {
      fetchWeather();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [gardensData, plantsData, tasksData, diagnosesData] = await Promise.all([
        getGardens(),
        getPlants(),
        getTasks({ completed: 'false' }),
        getDiagnosisHistory(),
      ]);

      setGardens(gardensData || []);
      setPlants(plantsData || []);
      setTasks(tasksData || []);

      setStats({
        gardens: gardensData?.length || 0,
        plants: plantsData?.length || 0,
        tasks: tasksData?.length || 0,
        diagnoses: diagnosesData?.length || 0,
      });

      // Calculate health score
      calculateHealthScore(plantsData, tasksData, diagnosesData);

      // Prepare recent activity
      const recent = [
        ...(plantsData?.slice(0, 3).map(p => ({ 
          type: 'plant', 
          text: `Added ${p.name}`, 
          date: p.createdAt,
          icon: '🌱'
        })) || []),
        ...(tasksData?.slice(0, 3).map(t => ({ 
          type: 'task', 
          text: t.title, 
          date: t.createdAt,
          icon: '📌'
        })) || []),
        ...(diagnosesData?.slice(0, 2).map(d => ({ 
          type: 'diagnosis', 
          text: `Diagnosed: ${d.diseaseName}`, 
          date: d.createdAt,
          icon: '🔬'
        })) || [])
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setActivities(recent.slice(0, 8));
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    setLoadingWeather(true);
    try {
      const city = user?.location?.city || 'London';
      const weatherData = await getWeather(city);
      setWeather(weatherData);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const calculateHealthScore = (plantsData, tasksData, diagnosesData) => {
    let score = 85; // Start with base score
    
    // Deduct for pending tasks
    if (tasksData?.length > 3) {
      score -= Math.min(tasksData.length * 2, 20);
    }
    
    // Deduct for unhealthy plants
    const unhealthyPlants = plantsData?.filter(p => p.health === 'unhealthy' || p.health === 'warning') || [];
    if (unhealthyPlants.length > 0) {
      score -= unhealthyPlants.length * 5;
    }
    
    // Deduct for recent disease diagnoses
    const recentDiagnoses = diagnosesData?.filter(d => 
      new Date(d.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ) || [];
    if (recentDiagnoses.length > 0) {
      score -= recentDiagnoses.length * 3;
    }
    
    // Bonus for having a garden
    if (gardens.length > 0) score += 5;
    
    // Ensure score stays between 0-100
    setHealthScore(Math.max(0, Math.min(100, score)));
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your garden...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header with Welcome and Weather */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🌱 Welcome back{user?.name ? `, ${user.name}` : ''}!</h1>
          <p className="header-subtitle">Here's what's happening in your urban garden today</p>
        </div>
        <div className="header-right">
          <WeatherWidget weather={weather} loading={loadingWeather} />
        </div>
      </div>

      {/* Garden Health Score */}
      <GardenHealth score={healthScore} />

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatsCard title="Gardens" value={stats.gardens} icon="🌿" color="#b8a9c9" />
        <StatsCard title="Plants" value={stats.plants} icon="🌱" color="#a8d5ba" />
        <StatsCard title="Pending Tasks" value={stats.tasks} icon="📋" color="#f0d5c0" />
        <StatsCard title="Diagnoses" value={stats.diagnoses} icon="🔬" color="#d6eaf8" />
      </div>

      {/* Two-column layout for main content */}
      <div className="dashboard-main">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Quick Actions */}
          <QuickActions onActionComplete={fetchDashboardData} />

          {/* AI Insights */}
          <AIInsights plants={plants} weather={weather} />

          {/* Plant Gallery */}
          <PlantGallery plants={plants} />
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Today's Tasks */}
          <TodayTasks tasks={tasks} onTaskUpdate={fetchDashboardData} />

          {/* Recent Activity */}
          <div className="recent-activity-section">
            <h3>📊 Recent Activity</h3>
            <RecentActivity activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;