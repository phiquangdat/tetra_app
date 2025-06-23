import React from 'react';
import StatWidgets from './StatWidgets';

const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <StatWidgets />
    </div>
  );
};

export default AdminDashboard;
