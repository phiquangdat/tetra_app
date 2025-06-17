import type { RouteObject } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import ModuleCards from '../components/admin/modules/ModuleCards.tsx';
import CreateModulePage from '../components/admin/createModule/CreateModulePage.tsx';

export const adminRoutes: RouteObject = {
  path: '/admin',
  element: <AdminLayout />,
  children: [
    {
      path: 'modules',
      element: <ModuleCards />,
    },
    {
      path: 'modules/create',
      element: <CreateModulePage />,
    },
  ],
};
