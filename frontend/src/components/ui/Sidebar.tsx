import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import SignOutModal from '../common/SignOutModal';
import toast from 'react-hot-toast';

export type SidebarItem = {
  label: string;
  icon?: React.ReactNode;
  path: string;
};

interface SidebarProps {
  topItems: SidebarItem[];
  bottomItems: SidebarItem[];
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  topItems,
  bottomItems,
  className,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleItemClick = (item: SidebarItem) => {
    if (item.label === 'Log out') {
      setShowModal(true);
    } else {
      navigate(item.path);
    }
  };

  const handleConfirmLogout = async () => {
    try {
      await logout();
      toast.success('You’ve been signed out.');
    } catch (error) {
      toast.error('Something went wrong during logout.');
    } finally {
      setShowModal(false);
      navigate('/');
      window.scrollTo(0, 0);
    }
  };

  const renderItem = (item: SidebarItem) => {
    const isActive = location.pathname === item.path;
    return (
      <button
        key={item.label}
        onClick={() => handleItemClick(item)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left w-full transition-colors
          ${
            isActive
              ? 'bg-white/10 text-white font-semibold'
              : 'text-highlight hover:bg-[#998FC7]/10 hover:text-white'
          }
        `}
      >
        {item.icon && <span className="w-6 h-6">{item.icon}</span>}
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <aside
      className={`flex flex-col justify-between h-full w-64 border-r border-highlight py-6 bg-surface ${className || ''}`}
    >
      <nav className="flex flex-col gap-2">{topItems.map(renderItem)}</nav>
      <nav className="flex flex-col gap-2 mt-8">
        {bottomItems.map(renderItem)}
      </nav>

      <SignOutModal
        open={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </aside>
  );
};

export default Sidebar;
