import React from 'react';
import { formatDate } from '../../utils/helpers';
import './RecentActivity.css';

const RecentActivity = ({ activities }) => {
  if (activities.length === 0) {
    return <p className="no-activity">No recent activity</p>;
  }
  return (
    <ul className="activity-list">
      {activities.map((act, idx) => (
        <li key={idx} className="activity-item">
          <span className="activity-icon">{act.type === 'plant' ? '🌱' : '📌'}</span>
          <span className="activity-text">{act.text}</span>
          <span className="activity-date">{formatDate(act.date)}</span>
        </li>
      ))}
    </ul>
  );
};

export default RecentActivity;