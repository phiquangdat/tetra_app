import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SignOutModal from '../common/SignOutModal';

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
  const [showModal, setShowModal] = useState(false);

  const renderItem = (item: SidebarItem) => {
    const isActive = location.pathname === item.path;
    return (
      <button
        key={item.label}
        onClick={() => handleItemClick(item)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left w-full transition-colors
          ${isActive ? 'bg-white bg-opacity-20 font-semibold' : 'hover:bg-white hover:bg-opacity-10'} text-white`}
        style={{ outline: 'none', border: 'none', background: 'none' }}
      >
        {item.icon && <span className="w-6 h-6">{item.icon}</span>}
        <span>{item.label}</span>
      </button>
    );
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.label === 'Log out') {
      setShowModal(true);
    } else {
      navigate(item.path);
    }
  };

  return (
    <aside
      className={`flex flex-col justify-between h-full w-64 border-r border-gray-200 py-6 text-white bg-gradient-to-b from-[#1C2564] to-[#14248A] ${className || ''}`}
    >
      <nav className="flex flex-col gap-2">{topItems.map(renderItem)}</nav>
      <nav className="flex flex-col gap-2 mt-8">
        {bottomItems.map(renderItem)}
      </nav>
      <SignOutModal open={showModal} onCancel={() => setShowModal(false)} />
    </aside>
  );
};

export default Sidebar;
