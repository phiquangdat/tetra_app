import React from 'react';
import { ContentIcon, GamifiedIcon, ProgressIcon } from '../common/Icons';

const features = [
  {
    icon: <ProgressIcon width={48} height={48} />,
    title: 'Progress tracking',
    description:
      'Tailored modules for each employee based on their role and skill level.',
  },
  {
    icon: <ContentIcon width={48} height={48} />,
    title: 'Interactive content',
    description:
      'Engaging videos, quizzes, and articles make learning effective and enjoyable.',
  },
  {
    icon: <GamifiedIcon width={48} height={48} color="#FFA726" />,
    title: 'Gamified rewards',
    description:
      'Earn points and achievements for completing modules and challenges.',
  },
];

const Features: React.FC = () => (
  <section
    id="features"
    className="w-full px-6 py-16 bg-gradient-to-bl from-cardBackground via-[#EDE9FE] to-highlight"
  >
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-12 text-center text-surface">
        Key features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-md border border-highlight flex flex-col items-center text-center space-y-4"
          >
            {feature.icon}
            <h3 className="text-lg font-bold text-primary">{feature.title}</h3>
            <p className="text-base leading-relaxed text-primary opacity-90 text-justify">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
