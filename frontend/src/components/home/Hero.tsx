import React from 'react';
import { useAuth } from '../../context/auth/AuthContext';

import HeroImage1 from '../../../src/assets/images/hero_option1.png';
import HeroImage2 from '../../../src/assets/images/hero_option2.png';
import HeroImage3 from '../../../src/assets/images/hero_option3.png';
import HeroImage4 from '../../../src/assets/images/hero_option4.png';

const heroImages = [HeroImage1, HeroImage2, HeroImage3, HeroImage4];

const Hero: React.FC<{ onGetStarted?: () => void }> = ({ onGetStarted }) => {
  const { authToken } = useAuth();
  const isLoggedIn = Boolean(authToken);

  // Pick random image on each render
  const randomImage = heroImages[Math.floor(Math.random() * heroImages.length)];

  return (
    <section
      id="home"
      className="relative flex flex-col lg:flex-row items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-lg
           bg-gradient-to-br from-cardBackground via-[#EDE9FE] to-[#B9A9DF]"
    >
      {/* Main content container */}
      <div className="flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto z-10 w-full">
        {/* Left: Text content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left p-6 lg:p-0 mb-10 lg:mb-0 lg:w-1/2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary leading-tight mb-4 tracking-tight rounded-md">
            GAMIFY LEARNING PLATFORM
          </h1>
          <p className="text-base sm:text-lg text-primary opacity-70 mb-8 max-w-md rounded-md">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed do
            eiusmod tempor.
          </p>
          {!isLoggedIn && (
            <button
              className="px-8 py-3 bg-surface text-white font-semibold rounded-full shadow-lg hover:bg-surfaceHover transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-75"
              onClick={onGetStarted}
            >
              Get Started
            </button>
          )}
          {!isLoggedIn && (
            <button
              className="px-8 py-3 bg-surface text-white font-semibold rounded-full shadow-lg hover:bg-surfaceHover transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-75"
              onClick={onGetStarted}
            >
              Get Started
            </button>
          )}
        </div>
        {/* Right: Visual element */}
        <div className="lg:w-1/2 flex justify-center items-center p-6 lg:p-0">
          <img
            src={randomImage}
            alt="Illustration of a person learning on a gamified platform"
            className="max-w-full h-auto rounded-lg"
            onError={(e) => {
              e.currentTarget.src =
                'https://placehold.co/700x500/E0BBE4/FFFFFF?text=Image+Not+Found';
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
