import React from 'react';
import { ContentIcon, GamifiedIcon, ProgressIcon } from '../common/Icons';

const features = [
  {
    icon: ProgressIcon,
    title: 'Progress tracking',
    description:
      'Tailored modules for each employee based on their role and skill level.',
  },
  {
    icon: ContentIcon,
    title: 'Interactive content',
    description:
      'Engaging videos, quizzes, and articles make learning effective and enjoyable.',
  },
  {
    icon: GamifiedIcon,
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
