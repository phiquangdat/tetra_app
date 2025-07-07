import Sidebar from '../../ui/Sidebar';

const topItems = [
  { label: 'Dashboard', path: '/user/dashboard', icon: null },
  { label: 'Modules', path: '/user/modules', icon: null },
];

const bottomItems = [
  { label: 'Log out', path: '/logout', icon: null },
  { label: 'Settings', path: '/user/settings', icon: null },
];

const UserSidebar = () => (
  <Sidebar topItems={topItems} bottomItems={bottomItems} />
);

export default UserSidebar;
