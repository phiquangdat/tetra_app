import React from 'react';

const About: React.FC = () => (
  <section id="about" className="w-full px-6 py-16 bg-white">
    <div className="max-w-5xl mx-auto bg-cardBackground rounded-3xl p-10 shadow-md border-l-8 border-accent">
      <h2 className="text-3xl font-bold mb-6 text-surface">About</h2>
      <p className="text-lg leading-relaxed text-primary text-justify opacity-90">
        Unlock the power of knowledge — one level at a time. Our gamified
        learning app transforms education into an immersive experience where
        progress feels like play and mastery is its own reward. Whether you're
        leveling up your skills in cybersecurity, diving into AI, or navigating
        the world of ESG, each course is crafted with interactive challenges,
        real-world missions, and instant feedback.
        <br />
        <br />
        Designed for curious minds and modern learners, we blend game mechanics
        with smart content to make learning addictive (in the best way). Track
        your stats, earn badges, conquer quizzes, and compete on leaderboards —
        all while building real-life knowledge. Because learning shouldn’t feel
        like a chore. It should feel like a victory.
      </p>
    </div>
  </section>
);

export default About;
