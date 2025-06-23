import React from 'react';
import DashboardHeader from './DashboardHeader';
import ActiveModulesList from './ActiveModulesList';
import UserStatCharts from './UserStatCharts';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <DashboardHeader />
      <ActiveModulesList />
      <UserStatCharts />
    </div>
  );
};

export default Dashboard;
