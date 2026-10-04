import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Dashboard from '../components/Dashboard/Dashboard';
import Gardens from '../components/Gardens/Gardens';
import Plants from '../components/Plants/Plants';
import PlantDetail from '../components/Plants/PlantDetail';
import DiagnoseTab from '../components/Diagnose/DiagnoseTab';
import CropRecommendation from '../components/CropRecommendation/CropRecommendation';
import WateringTab from '../components/Watering/WateringTab';
import ScheduleTab from '../components/Schedule/ScheduleTab';
import CommunityTab from '../components/Community/CommunityTab';
import Profile from '../components/Profile/Profile';

const MainApp = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gardens" element={<Gardens />} />
        <Route path="/plants" element={<Plants />} />
        <Route path="/plants/:id" element={<PlantDetail />} />
        <Route path="/diagnose" element={<DiagnoseTab />} />
        <Route path="/diagnosis" element={<DiagnoseTab />} />
        <Route path="/crops" element={<CropRecommendation />} />
        <Route path="/watering" element={<WateringTab />} />
        <Route path="/schedule" element={<ScheduleTab />} />
        <Route path="/community" element={<CommunityTab />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  );
};

export default MainApp;