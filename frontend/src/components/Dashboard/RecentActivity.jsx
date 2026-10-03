import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiCalendarEventLine, RiMicroscopeLine, RiLeafLine } from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { formatDate } from '../../utils/helpers';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './RecentActivity.css';

const RecentActivity = ({ activities }) => {
  const { t, i18n } = useTranslation();

  if (activities.length === 0) {
    return <p className="no-activity">{t('dashboard.noRecentActivity')}</p>;
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'plant':
        return <TbPlant2 className="act-icon-plant" />;
      case 'diagnosis':
        return <RiMicroscopeLine className="act-icon-diag" />;
      case 'task':
      default:
        return <RiCalendarEventLine className="act-icon-task" />;
    }
  };

  return (
    <ul className="activity-list">
      {activities.map((act, idx) => (
        <li key={idx} className="activity-item">
          <span className="activity-icon">{getActivityIcon(act.type)}</span>
          <span className="activity-text">{getLocalizedDynamicText(act.text, i18n.language)}</span>
          <span className="activity-date">{formatDate(act.date, i18n.language)}</span>
        </li>
      ))}
    </ul>
  );
};

export default RecentActivity;