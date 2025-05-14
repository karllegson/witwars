import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div>
      {/* Can add a shared header/footer or layout elements for auth pages here if needed */}
      <Outlet />
    </div>
  );
};

export default AuthLayout; 