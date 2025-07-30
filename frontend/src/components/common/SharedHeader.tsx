import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import Header, { type NavLink } from '../ui/Header';
import SignOutModal from '../common/SignOutModal';
import toast from 'react-hot-toast';

const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Features', href: '/features' },
  { label: 'Contact', href: '/contact' },
];

interface SharedHeaderProps {
  onHamburgerClick: () => void;
  isSidebarOpen: boolean;
}

const SharedHeader = ({
  onHamburgerClick,
  isSidebarOpen,
}: SharedHeaderProps) => {
  const { authToken, logout } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const navigate = useNavigate();

  const handleConfirmLogout = () => {
    logout();
    setShowSignOutModal(false);
    navigate('/');
    toast.success('You’ve been signed out.');
  };

  const handleLogin = () => {
    const loginEvent = new CustomEvent('open-login-modal');
    window.dispatchEvent(loginEvent);
  };

  return (
    <>
      <Header
        navLinks={navLinks}
        showHamburger
        onHamburgerClick={onHamburgerClick}
        isSidebarOpen={isSidebarOpen}
        ctaButton={{
          label: authToken ? 'Logout' : 'Login',
          href: authToken ? '/' : '#login',
          onClick: authToken ? () => setShowSignOutModal(true) : handleLogin,
        }}
      />

      <SignOutModal
        open={showSignOutModal}
        onCancel={() => setShowSignOutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default SharedHeader;
