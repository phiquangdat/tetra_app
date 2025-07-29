import React from 'react';
import { StarIcon } from '../../common/Icons';
import { useUser } from '../../../context/auth/UserContext';

const DashboardHeader: React.FC = () => {
  const { userName, points, userNameLoading } = useUser();

  let greeting;
  if (userNameLoading) {
    greeting = 'Loading...';
  } else if (userName) {
    greeting = `Welcome back, ${userName}!`;
  } else {
    greeting = 'Welcome back!';
  }

  return (
    <div className="rounded-2xl bg-cardBackground p-8 mb-8 flex flex-col gap-6 shadow-md">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">{greeting}</h1>
        <p className="text-lg text-secondary">
          You're making great progress...
        </p>
      </div>
      <div className="flex items-center">
        <div className="bg-white text-primary rounded-2xl px-6 py-4 flex items-center gap-3 shadow">
          <StarIcon color="var(--color-accent)" />
          <div>
            <div className="text-sm">Points</div>
            <div className="text-2xl font-bold text-surface">{points}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
