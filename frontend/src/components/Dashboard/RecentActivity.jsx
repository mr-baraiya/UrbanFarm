import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiCalendarEventLine, RiMicroscopeLine } from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { formatDate } from '../../utils/helpers';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './RecentActivity.css';

const RecentActivity = ({ activities }) => {
  const { t, i18n } = useTranslation();

  if (!activities || activities.length === 0) {
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

  const getActivityText = (act) => {
    if (act.type === 'plant') {
      const actionLabel = t('dashboard.actAdded', 'Added');
      const rawName = act.entityName || (act.text ? act.text.replace(/^[^:]+:\s*/, '') : '');
      const name = getLocalizedDynamicText(rawName, i18n.language);
      return `${actionLabel}: ${name}`;
    }
    if (act.type === 'diagnosis') {
      const actionLabel = t('dashboard.actDiagnosed', 'Diagnosed');
      const rawDisease = act.entityName || (act.text ? act.text.replace(/^[^:]+:\s*/, '') : '');
      const disease = getLocalizedDynamicText(rawDisease, i18n.language);
      return `${actionLabel}: ${disease}`;
    }
    if (act.type === 'task') {
      const rawTitle = act.rawTitle || act.text || '';
      return getLocalizedDynamicText(rawTitle, i18n.language);
    }
    return getLocalizedDynamicText(act.text || '', i18n.language);
  };

  return (
    <ul className="activity-list">
      {activities.map((act, idx) => (
        <li key={idx} className="activity-item">
          <span className="activity-icon">{getActivityIcon(act.type)}</span>
          <span className="activity-text">{getActivityText(act)}</span>
          <span className="activity-date">{formatDate(act.date, i18n.language)}</span>
        </li>
      ))}
    </ul>
  );
};

export default RecentActivity;