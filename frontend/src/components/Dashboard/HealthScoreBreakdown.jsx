import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiHeartPulseLine, 
  RiCalendarCheckLine, 
  RiMicroscopeLine, 
  RiLightbulbLine,
  RiCheckLine,
  RiAlertLine
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import './HealthScoreBreakdown.css';

const HealthScoreBreakdown = ({ plants = [], tasks = [], diagnoses = [], score = 100 }) => {
  const { t } = useTranslation();

  const todayStr = new Date().toISOString().split('T')[0];
  const totalPlants = plants.length;
  const healthyCount = plants.filter(p => !p.health || p.health === 'healthy').length;
  
  // Overdue or due today
  const overdueOrDueTasks = (tasks || []).filter(t => {
    if (t.completed) return false;
    const dueDateStr = new Date(t.dueDate).toISOString().split('T')[0];
    return dueDateStr <= todayStr;
  });

  // Recent unresolved disease diagnoses (last 7 days)
  const activeDiagnoses = (diagnoses || []).filter(d => {
    if (d.isResolved) return false;
    if (d.isHealthy) return false;
    if (d.diseaseName && /healthy|સ્વસ્થ|स्वस्थ/i.test(d.diseaseName)) return false;
    const ageInDays = (Date.now() - new Date(d.createdAt).getTime()) / (24 * 60 * 60 * 1000);
    return ageInDays <= 7;
  });

  const factors = [
    {
      id: 'plants',
      icon: <TbPlant2 className="factor-icon plant" />,
      titleKey: 'dashboard.factor1Title',
      weightKey: 'dashboard.factor1Weight',
      descKey: 'dashboard.factor1Desc',
      weightColor: '#2d6a4f',
      weightBg: '#dcfce7',
      liveStat: totalPlants > 0 ? `${healthyCount}/${totalPlants} ${t('dashboard.plantsCount', 'plants')}` : t('dashboard.noPlantsYet', 'No plants yet')
    },
    {
      id: 'tasks',
      icon: <RiCalendarCheckLine className="factor-icon task" />,
      titleKey: 'dashboard.factor2Title',
      weightKey: 'dashboard.factor2Weight',
      descKey: 'dashboard.factor2Desc',
      weightColor: '#d97706',
      weightBg: '#fef3c7',
      liveStat: overdueOrDueTasks.length > 0 ? `${overdueOrDueTasks.length} ${t('dashboard.tasksCount', 'tasks')}` : (t('dashboard.dueToday') === 'Today' ? 'Caught up' : 'બધું પૂર્ણ!')
    },
    {
      id: 'diagnoses',
      icon: <RiMicroscopeLine className="factor-icon disease" />,
      titleKey: 'dashboard.factor3Title',
      weightKey: 'dashboard.factor3Weight',
      descKey: 'dashboard.factor3Desc',
      weightColor: '#0284c7',
      weightBg: '#e0f2fe',
      liveStat: activeDiagnoses.length > 0 ? `${activeDiagnoses.length} ${t('diagnose.title', 'Issues')}` : t('dashboard.healthGood', 'Clear')
    }
  ];

  return (
    <div className="health-breakdown-card">
      <div className="breakdown-header">
        <div className="breakdown-title-wrap">
          <RiHeartPulseLine className="breakdown-header-icon" />
          <div>
            <h4>{t('dashboard.healthBreakdownTitle')}</h4>
            <p className="breakdown-subtitle">{t('dashboard.healthBreakdownSub')}</p>
          </div>
        </div>
      </div>

      <div className="factors-list">
        {factors.map((factor) => (
          <div key={factor.id} className="factor-item">
            <div className="factor-header-row">
              <div className="factor-title-group">
                {factor.icon}
                <span className="factor-title">{t(factor.titleKey)}</span>
              </div>
              <div className="factor-badges-group">
                <span 
                  className="factor-weight-badge" 
                  style={{ color: factor.weightColor, background: factor.weightBg }}
                >
                  {t(factor.weightKey)}
                </span>
                <span className="factor-live-stat">{factor.liveStat}</span>
              </div>
            </div>
            <p className="factor-desc">{t(factor.descKey)}</p>
          </div>
        ))}
      </div>

      <div className="breakdown-tip-box">
        <RiLightbulbLine className="tip-icon" />
        <p>{t('dashboard.healthBreakdownTip')}</p>
      </div>
    </div>
  );
};

export default HealthScoreBreakdown;
