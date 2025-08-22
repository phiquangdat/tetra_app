import { type RouteObject, useParams, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { getAuthToken } from '../utils/authHelpers';

const AdminDashboard = lazy(() => import('../components/admin/dashboard'));
const ModuleCards = lazy(
  () => import('../components/admin/modules/ModuleCards'),
);
const ModulePage = lazy(() => import('../components/admin/module/ModulePage'));
const CreateModulePage = lazy(
  () => import('../components/admin/createModule/CreateModulePage'),
);
const UserPage = lazy(() => import('../components/admin/users/UsersPage'));
const SettingsPage = lazy(() => import('../components/common/SettingsPage'));

function ModulePageWrapper() {
  const { id } = useParams();
  if (!id) return <div>Module ID not found</div>;
  return (
    <Suspense fallback={<div>Loading Module...</div>}>
      <ModulePage id={id} />
    </Suspense>
  );
}

function ProtectedWrapper({ children }: { children: React.ReactNode }) {
  const isLoggedIn = Boolean(getAuthToken());
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export const adminRoutes: RouteObject = {
  path: '/admin',
  element: (
    <ProtectedWrapper>
      <AdminLayout />
    </ProtectedWrapper>
  ),
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
      path: 'modules/:id',
      element: <ModulePageWrapper />,
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
