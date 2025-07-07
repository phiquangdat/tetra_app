import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeHeader from './HomeHeader';
import Hero from './Hero';
import About from './About';
import Features from './Features';
import Footer from '../ui/Footer';
import LoginModal from './LoginModal';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Modal is open if route is /login
  const isLoginOpen = location.pathname === '/login';

  // Open modal by navigating to /login
  const openLogin = useCallback(() => {
    if (!isLoginOpen) navigate('/login');
  }, [isLoginOpen, navigate]);

  // Close modal by navigating back or to /
  const closeLogin = useCallback(() => {
    if (location.pathname === '/login') {
      // Go back if navigated from another page, else go to /
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  }, [location.pathname, navigate]);

  return (
    <main>
      <HomeHeader onLoginClick={openLogin} />
      <Hero onGetStarted={openLogin} />
      <LoginModal isOpen={isLoginOpen} onClose={closeLogin} />
      <About />
      <Features />
      <Footer />
    </main>
  );
};

export default Home;
