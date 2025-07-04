import type { RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AdminLayout from '../layouts/AdminLayout';

const AdminDashboard = lazy(() => import('../components/admin/dashboard'));
const ModuleCards = lazy(
  () => import('../components/admin/modules/ModuleCards'),
);
const CreateModulePage = lazy(
  () => import('../components/admin/createModule/CreateModulePage'),
);
const UserPage = lazy(() => import('../components/admin/users/UsersPage'));
const SettingsPage = lazy(() => import('../components/common/SettingsPage'));

export const adminRoutes: RouteObject = {
  path: '/admin',
  element: <AdminLayout />,
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={<div>Loading Dashboard...</div>}>
          <AdminDashboard />
        </Suspense>
      ),
    },
    {
      path: 'modules',
      element: (
        <Suspense fallback={<div>Loading Modules...</div>}>
          <ModuleCards />
        </Suspense>
      ),
    },
    {
      path: 'modules/create',
      element: (
        <Suspense fallback={<div>Loading Create Module...</div>}>
          <CreateModulePage />
        </Suspense>
      ),
    },
    {
      path: 'users',
      element: (
        <Suspense fallback={<div>Loading Users...</div>}>
          <UserPage />
        </Suspense>
      ),
    },
    {
      path: 'settings',
      element: (
        <Suspense fallback={<div>Loading Settings...</div>}>
          <SettingsPage />
        </Suspense>
      ),
    },
  ],
};
