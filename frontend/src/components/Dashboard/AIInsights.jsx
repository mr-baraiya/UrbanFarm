import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiSparklingLine, 
  RiShoppingBasketLine, 
  RiSunLine, 
  RiRainyLine, 
  RiSnowyLine, 
  RiLeafLine 
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import './AIInsights.css';

const AIInsights = ({ plants, weather }) => {
  const { t } = useTranslation();
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    generateInsight();
  }, [plants, weather, t]);

  const generateInsight = () => {
    const insights = [];

    // Plant-based insights
    if (plants && plants.length > 0) {
      const growingPlants = plants.filter(p => p.status === 'growing');
      const maturePlants = plants.filter(p => p.status === 'mature');
      
      if (growingPlants.length > 0) {
        const plant = growingPlants[0];
        insights.push({
          icon: <TbPlant2 className="insight-svg-icon growing" />,
          text: `${plant.name} ${t('dashboard.growingWell')} ${plant.waterFrequency ? `${t('dashboard.waterEvery')} ${plant.waterFrequency} ${t('dashboard.days')}` : ''}`,
          priority: 'info'
        });
      }
      
      if (maturePlants.length > 0) {
        const plant = maturePlants[0];
        insights.push({
          icon: <RiShoppingBasketLine className="insight-svg-icon harvest" />,
          text: `${plant.name} ${t('dashboard.readyForHarvest')}`,
          priority: 'success'
        });
      }
    }

    // Weather-based insights
    if (weather) {
      const temp = weather.main?.temp;
      const condition = weather.weather?.[0]?.description || '';
      
      if (temp > 30) {
        insights.push({
          icon: <RiSunLine className="insight-svg-icon heat" />,
          text: t('dashboard.highTempWarning'),
          priority: 'warning'
        });
      }
      
      if (condition.toLowerCase().includes('rain')) {
        insights.push({
          icon: <RiRainyLine className="insight-svg-icon rain" />,
          text: t('dashboard.rainExpectedInfo'),
          priority: 'info'
        });
      }
      
      if (temp < 5) {
        insights.push({
          icon: <RiSnowyLine className="insight-svg-icon frost" />,
          text: t('dashboard.frostRiskWarning'),
          priority: 'warning'
        });
      }
    }

    // Season-based insights
    const month = new Date().getMonth();
    if (month >= 2 && month <= 5) {
      insights.push({
        icon: <TbPlant2 className="insight-svg-icon spring" />,
        text: t('dashboard.springTip'),
        priority: 'info'
      });
    } else if (month >= 6 && month <= 8) {
      insights.push({
        icon: <RiSunLine className="insight-svg-icon summer" />,
        text: t('dashboard.summerTip'),
        priority: 'info'
      });
    } else if (month >= 9 && month <= 11) {
      insights.push({
        icon: <RiLeafLine className="insight-svg-icon fall" />,
        text: t('dashboard.fallTip'),
        priority: 'info'
      });
    }

    // If no insights, show a default one
    if (insights.length === 0) {
      insights.push({
        icon: <RiLeafLine className="insight-svg-icon default" />,
        text: t('dashboard.defaultTip'),
        priority: 'info'
      });
    }

    // Pick a random insight or the most important one
    const priorityOrder = { warning: 0, success: 1, info: 2 };
    const sorted = insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    setInsight(sorted[0]);
  };

  if (!insight) return null;

  return (
    <div className={`ai-insight ${insight.priority}`}>
      <div className="insight-header">
        <span className="insight-icon">{insight.icon}</span>
        <span className="insight-badge">
          <RiSparklingLine className="ai-spark-icon" /> {t('dashboard.aiSuggestion')}
        </span>
      </div>
      <p className="insight-text">{insight.text}</p>
    </div>
  );
};

export default AIInsights;