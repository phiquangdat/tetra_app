import { Outlet } from 'react-router-dom';
import SharedHeader from '../components/common/SharedHeader.tsx';
import Sidebar, { type SidebarItem } from '../components/ui/Sidebar';

const topItems: SidebarItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: null },
  { label: 'Modules', path: '/admin/modules', icon: null },
  { label: 'Users', path: '/admin/users', icon: null },
  { label: 'Create Module', path: '/admin/modules/create', icon: null },
];
const bottomItems: SidebarItem[] = [
  { label: 'Log out', path: '/logout', icon: null },
];

function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SharedHeader />
      <div className="flex flex-1">
        <div className="w-64 border-r border-gray-200 bg-gradient-to-b from-[#28262C] to-[#14248A]">
          <Sidebar topItems={topItems} bottomItems={bottomItems} />
        </div>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
