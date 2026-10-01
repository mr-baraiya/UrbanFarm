import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from '../components/Admin/AdminSidebar';
import AdminDashboard from '../components/Admin/AdminDashboard';
import UserManagement from '../components/Admin/UserManagement';
import GardenManagement from '../components/Admin/GardenManagement';
import ContentModeration from '../components/Admin/ContentModeration';
import AdminAuditLogs from '../components/Admin/AdminAuditLogs';
import AdminSettings from '../components/Admin/AdminSettings';
import './AdminPanel.css';

const AdminPanel = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="admin-main-content">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/gardens" element={<GardenManagement />} />
          <Route path="/moderation" element={<ContentModeration />} />
          <Route path="/logs" element={<AdminAuditLogs />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;