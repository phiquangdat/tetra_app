import { useState } from 'react';
import HomeHeader from './HomeHeader';
import Hero from './Hero';
import About from './About';
import Features from './Features';
import Footer from '../ui/Footer';
import LoginModal from './LoginModal';

const Home = () => {
  const [isLoginOpen, setLoginOpen] = useState(false);

  return (
    <main>
      <HomeHeader />
      <Hero />
      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} />
      <About />
      <Features />
      <Footer />
    </main>
  );
};

export default Home;
