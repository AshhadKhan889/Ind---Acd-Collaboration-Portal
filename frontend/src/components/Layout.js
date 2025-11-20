import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import DomainChatbot from './DomainChatbot';
import useInactivityLogout from '../hooks/useInactivityLogout';

const Layout = () => {
  // Track user inactivity and logout after 1 hour of inactivity
  useInactivityLogout(60 * 60 * 1000); // 1 hour in milliseconds

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar />
      <main style={{ padding: '20px' }}>
        <Outlet /> {/* This renders the matched child route */}
      </main>
      <DomainChatbot />
    </div>
  );
};

export default Layout;