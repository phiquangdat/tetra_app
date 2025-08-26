import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SharedHeader from '../common/SharedHeader';
import Hero from './Hero';
import About from './About';
import Features from './Features';
import Footer from '../ui/Footer';
import LoginModal from './LoginModal';
import UserSidebar from '../user/layout/UserSidebar';
import AdminSidebar from '../admin/layout/AdminSidebar';
import { useAuth } from '../../context/auth/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authToken, userRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

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

  useEffect(() => {
    if (!authToken) setSidebarOpen(false);
  }, [authToken]);

  return (
    <main className="min-h-screen flex flex-col">
      <SharedHeader
        showHamburger={!!authToken}
        isSidebarOpen={sidebarOpen}
        onHamburgerClick={toggleSidebar}
      />
      <div className="flex flex-1 relative">
        {sidebarOpen && (
          <div
            className="absolute z-50 h-full
                    transform transition-transform duration-300 ease-in-out translate-x-0"
          >
            {userRole === 'admin' ? (
              <AdminSidebar />
            ) : userRole === 'learner' ? (
              <UserSidebar />
            ) : null}
          </div>
        )}

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : ''}`}
        >
          <Hero onGetStarted={openLogin} />
          <LoginModal isOpen={isLoginOpen} onClose={closeLogin} />
          <About />
          <Features />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Home;
