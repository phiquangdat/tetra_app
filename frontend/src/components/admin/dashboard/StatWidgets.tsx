import React from 'react';

const stats = [
  { label: 'Total users', value: 348, unit: 'iterns onboarding' },
  { label: 'Total points issued', value: 125000, unit: 'pts' },
  { label: 'Training modules', value: 45, unit: 'active modules' },
];

const icons = {
  video: (
    <svg
      className="w-6 h-6 text-gray-700 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <path d="M17 21V13H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  ),
};

const StatWidgets: React.FC = () => (
  <div className="w-full grid md:grid-cols-3 gap-6 mt-12">
    {stats.map((stat) => (
      <div
        key={stat.label}
        className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-gray-100"
      >
        <div className="flex items-center gap-2 mb-4 self-start">
          {icons.video}
          <span className="text-gray-500 text-sm font-medium">
            {stat.label}
          </span>
        </div>

        <span className="text-3xl font-bold mb-1">
          {stat.value.toLocaleString()}
        </span>
        <span className="text-gray-600 text-sm font-medium">{stat.unit}</span>
      </div>
    ))}
  </div>
);

export default StatWidgets;
