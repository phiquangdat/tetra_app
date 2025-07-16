import React from 'react';
import { OpenBooksIcon, StarIcon, UsersIcon } from '../../common/Icons.tsx';

const stats = [
  {
    icon: <UsersIcon />,
    label: 'Total users',
    value: 348,
    unit: 'interns onboarding',
  },
  {
    icon: <StarIcon />,
    label: 'Total points issued',
    value: 125000,
    unit: 'pts',
  },
  {
    icon: <OpenBooksIcon />,
    label: 'Training modules',
    value: 45,
    unit: 'active modules',
  },
];

const StatWidgets: React.FC = () => (
  <div className="w-full grid md:grid-cols-3 gap-6 mt-12">
    {stats.map((stat) => (
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

export default StatWidgets;
