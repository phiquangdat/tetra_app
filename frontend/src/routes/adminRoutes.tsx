import type { RouteObject } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';

export const adminRoutes: RouteObject = {
  path: '/admin',
  element: <AdminLayout />,
  children: [
  ]
};
