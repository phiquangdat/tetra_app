import { useCallback, useState } from 'react';
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

  return (
    <main>
      <SharedHeader
        showHamburger={!!authToken}
        isSidebarOpen={sidebarOpen}
        onHamburgerClick={toggleSidebar}
      />

      {sidebarOpen && (
        <div className="fixed top-16 left-0 w-64 h-[calc(100%-4rem)] bg-gray-800 z-40">
          {userRole === 'admin' ? (
            <AdminSidebar />
          ) : userRole === 'user' ? (
            <UserSidebar />
          ) : null}
        </div>
      )}

      <div className={`${sidebarOpen ? 'ml-64' : ''} transition-all`}>
        <Hero onGetStarted={openLogin} />
        <LoginModal isOpen={isLoginOpen} onClose={closeLogin} />
        <About />
        <Features />
        <Footer />
      </div>
    </main>
  );
};

export default Home;
