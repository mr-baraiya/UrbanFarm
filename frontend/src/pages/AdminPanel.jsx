import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import AdminDashboard from '../components/Admin/AdminDashboard';
import UserManagement from '../components/Admin/UserManagement';
import ContentModeration from '../components/Admin/ContentModeration';
import './AdminPanel.css';

const AdminPanel = () => {
  return (
    <Layout>
      <div className="admin-panel">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/moderation" element={<ContentModeration />} />
        </Routes>
      </div>
    </Layout>
  );
};

export default AdminPanel;