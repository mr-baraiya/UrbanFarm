import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { getGardens, getPlants, getTasks, getDiagnosisHistory } from '../../services/plantService';
import { getWeather } from '../../services/weatherService';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import { 
  RiPlantLine, 
  RiCalendarEventLine, 
  RiMicroscopeLine, 
  RiHistoryLine 
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import WeatherWidget from './WeatherWidget';
import AIInsights from './AIInsights';
import PlantGallery from './PlantGallery';
import TodayTasks from './TodayTasks';
import GardenHealth from './GardenHealth';
import HealthScoreBreakdown from './HealthScoreBreakdown';
import IoTSummaryWidget from './IoTSummaryWidget';
import './Dashboard.css';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({ gardens: 0, plants: 0, tasks: 0, diagnoses: 0 });
  const [activities, setActivities] = useState([]);
  const [plants, setPlants] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [gardens, setGardens] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
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
      setDiagnoses(diagnosesData || []);

      setStats({
        gardens: gardensData?.length || 0,
        plants: plantsData?.length || 0,
        tasks: tasksData?.length || 0,
        diagnoses: diagnosesData?.length || 0,
      });

      calculateHealthScore(gardensData, plantsData, tasksData, diagnosesData);

      const recent = [
        ...(plantsData?.slice(0, 3).map(p => ({ 
          type: 'plant', 
          actionKey: 'dashboard.actAdded',
          entityName: p.name,
          date: p.createdAt,
          icon: '🌱'
        })) || []),
        ...(tasksData?.slice(0, 3).map(t => ({ 
          type: 'task', 
          rawTitle: t.title,
          date: t.createdAt,
          icon: '📌'
        })) || []),
        ...(diagnosesData?.slice(0, 2).map(d => ({ 
          type: 'diagnosis', 
          actionKey: 'dashboard.actDiagnosed',
          entityName: d.diseaseName,
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

  const calculateHealthScore = (gardensData, plantsData, tasksData, diagnosesData) => {
    if (!plantsData || plantsData.length === 0) {
      setHealthScore(100);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Plant Health Vitality (50% weight)
    const totalPlants = plantsData.length;
    const healthyCount = plantsData.filter(p => !p.health || p.health === 'healthy').length;
    const warningCount = plantsData.filter(p => p.health === 'warning').length;
    const unhealthyCount = plantsData.filter(p => p.health === 'unhealthy').length;
    // Healthy: 1.0, Warning: 0.75, Unhealthy: 0.3
    const plantHealthWeight = ((healthyCount * 1.0) + (warningCount * 0.75) + (unhealthyCount * 0.3)) / totalPlants;
    const plantScore = plantHealthWeight * 50;

    // 2. Task Care & Timeliness (30% weight) - Only penalize overdue/due-today incomplete tasks
    const overdueOrDueTasks = (tasksData || []).filter(t => {
      if (t.completed) return false;
      const dueDateStr = new Date(t.dueDate).toISOString().split('T')[0];
      return dueDateStr <= todayStr;
    });
    const taskPenalty = Math.min(overdueOrDueTasks.length * 6, 30);
    const taskScore = Math.max(0, 30 - taskPenalty);

    // 3. Active Disease Outbreaks (20% weight) - Unresolved disease issues diagnosed in past 7 days
    const activeDiseaseDiagnoses = (diagnosesData || []).filter(d => {
      if (d.isResolved) return false;
      if (d.isHealthy) return false;
      if (d.diseaseName && /healthy|સ્વસ્થ|स्वस्थ/i.test(d.diseaseName)) return false;
      const ageInDays = (Date.now() - new Date(d.createdAt).getTime()) / (24 * 60 * 60 * 1000);
      return ageInDays <= 7;
    });
    const diseasePenalty = Math.min(activeDiseaseDiagnoses.length * 4, 20);
    const diagnosisScore = Math.max(0, 20 - diseasePenalty);

    const totalScore = Math.round(plantScore + taskScore + diagnosisScore);
    setHealthScore(Math.max(10, Math.min(100, totalScore)));
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header with Welcome and Weather */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>{t('dashboard.welcomeBack')}{user?.name ? `, ${getLocalizedDynamicText(user.name, i18n.language)}` : ''}!</h1>
            <p className="header-subtitle">{t('dashboard.subtitle')}</p>
          </div>
          <div className="header-right">
            <WeatherWidget weather={weather} loading={loadingWeather} />
          </div>
        </div>

        {/* Garden Health Score */}
        <GardenHealth score={healthScore} />

        {/* IoT Monitoring Summary Widget */}
        <div className="my-5">
          <IoTSummaryWidget />
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatsCard title={t('dashboard.totalGardens')} value={stats.gardens} icon={<RiPlantLine />} color="#6b9080" />
          <StatsCard title={t('dashboard.totalPlants')} value={stats.plants} icon={<TbPlant2 />} color="#2d6a4f" />
          <StatsCard title={t('dashboard.activeTasks')} value={stats.tasks} icon={<RiCalendarEventLine />} color="#d97706" />
          <StatsCard title={t('diagnose.title')} value={stats.diagnoses} icon={<RiMicroscopeLine />} color="#0284c7" />
        </div>

        {/* Two-column layout for main content */}
        <div className="dashboard-main">
          {/* Left Column */}
          <div className="dashboard-left">
            <QuickActions onActionComplete={fetchDashboardData} />
            <AIInsights plants={plants} weather={weather} />
            <PlantGallery plants={plants} />
            <HealthScoreBreakdown plants={plants} tasks={tasks} diagnoses={diagnoses} score={healthScore} />
          </div>

          {/* Right Column */}
          <div className="dashboard-right">
            <TodayTasks tasks={tasks} onTaskUpdate={fetchDashboardData} />
            <div className="recent-activity-section">
              <h3><RiHistoryLine className="section-title-icon" /> {t('dashboard.recentActivity')}</h3>
              <RecentActivity activities={activities} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;