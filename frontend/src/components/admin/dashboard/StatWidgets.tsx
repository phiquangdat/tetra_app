import React, { useEffect, useState } from 'react';
import { OpenBooksIcon, StarIcon, UsersIcon } from '../../common/Icons.tsx';
import {
  getAdminStats,
  type AdminStats,
} from '../../../services/admin/adminApi.ts';

const StatWidgets: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setError('Failed to load admin stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center mt-12 text-muted">Loading stats...</div>;
  }

  if (error || !stats) {
    return (
      <div className="text-center mt-12 text-red-600">
        {error || 'Unexpected error.'}
      </div>
    );
  }

  const displayStats = [
    {
      icon: <UsersIcon />,
      label: 'Total users',
      value: stats.total_users,
      unit: 'interns onboarding',
    },
    {
      icon: <StarIcon />,
      label: 'Total points issued',
      value: stats.total_points_issued,
      unit: 'pts',
    },
    {
      icon: <OpenBooksIcon />,
      label: 'Training modules',
      value: stats.active_modules,
      unit: 'active modules',
    },
  ];

  return (
    <div className="w-full grid md:grid-cols-3 gap-6 mt-12">
      {displayStats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-3xl shadow p-6 flex flex-col items-center justify-center border border-highlight"
        >
          <div className="flex items-center gap-2 mb-4 self-start">
            {stat.icon}
            <span className="text-primary">{stat.label}</span>
          </div>

          <span className="text-3xl text-surface font-bold mb-1">
            {stat.value.toLocaleString()}
          </span>
          <span className="text-surface text-sm font-medium">{stat.unit}</span>
        </div>
      ))}
    </div>
  );
};

export default StatWidgets;
