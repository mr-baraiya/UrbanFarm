import React from 'react';
import { Outlet } from 'react-router-dom';
import GuestNavbar from './GuestNavbar';
import GuestFooter from './GuestFooter';

const GuestLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
      <GuestNavbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <GuestFooter />
    </div>
  );
};

export default GuestLayout;
