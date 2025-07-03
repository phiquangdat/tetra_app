import type { RouteObject } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../components/admin/dashboard';
import ModuleCards from '../components/admin/modules/ModuleCards.tsx';
import CreateModulePage from '../components/admin/createModule/CreateModulePage.tsx';
import UserPage from '../components/admin/users/UsersPage.tsx';
import SettingsPage from '../components/common/SettingsPage.tsx';

export const adminRoutes: RouteObject = {
  path: '/admin',
  element: <AdminLayout />,
  children: [
    {
      index: true,
      element: <AdminDashboard />,
    },
    {
      path: 'modules',
      element: <ModuleCards />,
    },
    {
      path: 'modules/create',
      element: <CreateModulePage />,
    },
    {
      path: 'users',
      element: <UserPage />,
    },
    {
      path: 'settings',
      element: <SettingsPage />,
    },
  ],
};
