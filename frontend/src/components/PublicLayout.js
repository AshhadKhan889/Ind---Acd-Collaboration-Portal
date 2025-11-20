import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;