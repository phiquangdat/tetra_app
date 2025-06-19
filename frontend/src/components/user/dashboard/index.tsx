import React from 'react';
import DashboardHeader from './DashboardHeader';
import ActiveModulesList from './ActiveModulesList';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <DashboardHeader />
      <ActiveModulesList />
    </div>
  );
};

export default Dashboard;
