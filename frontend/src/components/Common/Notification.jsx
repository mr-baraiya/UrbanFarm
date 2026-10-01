import React from 'react';
import { useNotification } from '../../hooks/useNotification';
import './Notification.css';

const Notification = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((n) => (
        <div key={n.id} className={`notification-item ${n.type}`}>
          <span>{n.message}</span>
          <button onClick={() => removeNotification(n.id)}>✕</button>
        </div>
      ))}
    </div>
  );
};

export default Notification;