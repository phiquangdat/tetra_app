import Sidebar from '../../ui/Sidebar';

const topItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: null },
  { label: 'Modules', path: '/admin/modules', icon: null },
  { label: 'Users', path: '/admin/users', icon: null },
  { label: 'Create Module', path: '/admin/modules/create', icon: null },
];

const bottomItems = [
  { label: 'Log out', path: '/logout', icon: null },
  { label: 'Settings', path: '/admin/settings', icon: null },
];

const AdminSidebar = () => (
  <Sidebar topItems={topItems} bottomItems={bottomItems} />
);

export default AdminSidebar;
