import React, { useState, useEffect } from 'react';
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
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    generateInsight();
  }, [plants, weather]);

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
          text: `${plant.name} is growing well! ${plant.waterFrequency ? `Water every ${plant.waterFrequency} days.` : ''}`,
          priority: 'info'
        });
      }
      
      if (maturePlants.length > 0) {
        const plant = maturePlants[0];
        insights.push({
          icon: <RiShoppingBasketLine className="insight-svg-icon harvest" />,
          text: `${plant.name} is ready for harvest! Check your plants.`,
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
          text: 'High temperature detected! Water your plants in the morning or evening.',
          priority: 'warning'
        });
      }
      
      if (condition.toLowerCase().includes('rain')) {
        insights.push({
          icon: <RiRainyLine className="insight-svg-icon rain" />,
          text: 'Rain expected! You can skip today\'s watering schedule.',
          priority: 'info'
        });
      }
      
      if (temp < 5) {
        insights.push({
          icon: <RiSnowyLine className="insight-svg-icon frost" />,
          text: 'Frost risk! Protect sensitive plants or bring them indoors.',
          priority: 'warning'
        });
      }
    }

    // Season-based insights
    const month = new Date().getMonth();
    if (month >= 2 && month <= 5) {
      insights.push({
        icon: <TbPlant2 className="insight-svg-icon spring" />,
        text: 'Spring is here! Great time for planting new crops.',
        priority: 'info'
      });
    } else if (month >= 6 && month <= 8) {
      insights.push({
        icon: <RiSunLine className="insight-svg-icon summer" />,
        text: 'Summer growing season! Ensure consistent watering.',
        priority: 'info'
      });
    } else if (month >= 9 && month <= 11) {
      insights.push({
        icon: <RiLeafLine className="insight-svg-icon fall" />,
        text: 'Fall harvest season! Collect seeds for next year.',
        priority: 'info'
      });
    }

    // If no insights, show a default one
    if (insights.length === 0) {
      insights.push({
        icon: <RiLeafLine className="insight-svg-icon default" />,
        text: 'Keep up the great work! Your garden is doing well.',
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
          <RiSparklingLine className="ai-spark-icon" /> AI Suggestion
        </span>
      </div>
      <p className="insight-text">{insight.text}</p>
    </div>
  );
};

export default AIInsights;