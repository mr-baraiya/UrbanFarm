import React from 'react';
import { 
  RiCheckboxCircleFill, 
  RiErrorWarningFill, 
  RiInformationFill, 
  RiAlertFill,
  RiCloseLine 
} from 'react-icons/ri';
import { useNotification } from '../../hooks/useNotification';
import './Notification.css';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return <RiCheckboxCircleFill className="notif-type-icon success" />;
    case 'error':
      return <RiErrorWarningFill className="notif-type-icon error" />;
    case 'warning':
      return <RiAlertFill className="notif-type-icon warning" />;
    case 'info':
    default:
      return <RiInformationFill className="notif-type-icon info" />;
  }
};

// Clean any leftover raw emoji prefixes/suffixes from legacy strings
const cleanMessage = (msg) => {
  if (typeof msg !== 'string') return msg;
  return msg.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '').trim();
};

const Notification = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((n) => (
        <div key={n.id} className={`notification-item ${n.type || 'info'}`}>
          <div className="notification-content-wrap">
            {getNotificationIcon(n.type)}
            <span className="notification-text">{cleanMessage(n.message)}</span>
          </div>
          <button 
            className="notification-close-btn" 
            onClick={() => removeNotification(n.id)}
            aria-label="Close notification"
          >
            <RiCloseLine />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notification;