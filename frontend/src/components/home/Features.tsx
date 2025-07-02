import React from 'react';

const features = [
  {
    icon: (
      <svg
        className="h-12 w-12 mb-2 text-gray-700"
        fill="none"
        viewBox="0 0 48 48"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="24" cy="24" r="20" />
        <path d="M24 14v10l7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Progress tracking',
    description:
      'Tailored modules for each employee based on their role and skill level.',
  },
  {
    icon: (
      <svg
        className="h-12 w-12 mb-2 text-gray-700"
        fill="none"
        viewBox="0 0 48 48"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path
          d="M6 12a4 4 0 0 1 4-4h14v32H10a4 4 0 0 1-4-4V12z"
          strokeLinejoin="round"
        />
        <path
          d="M42 12a4 4 0 0 0-4-4H24v32h14a4 4 0 0 0 4-4V12z"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: 'Interactive content',
    description:
      'Engaging videos, quizzes, and articles make learning effective and enjoyable.',
  },
  {
    icon: (
      <svg
        className="h-12 w-12 mb-2 text-gray-700"
        fill="none"
        viewBox="0 0 48 48"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <polygon
          points="24,6 29.4,18.3 42,18.3 32,27.1 36,39.7 24,32 12,39.7 16,27.1 6,18.3 18.6,18.3"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: 'Gamified rewards',
    description:
      'Earn points and achievements for completing modules and challenges.',
  },
];

const Features: React.FC = () => (
  <section id="features" className="w-full py-16 px-6 bg-[#d6f0f2]">
    <h2 className="text-3xl font-bold mb-12 text-left">Key features</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {features.map((feature, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center space-y-4 w-[170px] mx-auto"
        >
          {feature.icon}
          <h3 className="text-lg font-bold mb-1 w-full">{feature.title}</h3>
          <p className="text-gray-800 text-base leading-relaxed w-full text-justify">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  </section>
);

export default Features;
