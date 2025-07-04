import React from 'react';
import { StarIcon } from '../../common/Icons';

const user = {
  name: 'John',
  points: 100,
};

const DashboardHeader: React.FC = () => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-800 p-8 mb-8 flex flex-col gap-6 shadow-lg">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-lg text-blue-100">You're making great progress...</p>
      </div>
      <div className="flex items-center">
        <div className="bg-blue-100 rounded-2xl px-6 py-4 flex items-center gap-3 shadow">
          <StarIcon />
          <div>
            <div className="text-blue-600 text-base">Points</div>
            <div className="text-blue-900 text-2xl font-semibold">
              {user.points}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
