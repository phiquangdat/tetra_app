import type { RouteObject } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import UserLayout from '../layouts/UserLayout';
import ModuleCards from '../components/user/modules/ModuleCards';
import ModulePage from '../components/ModulePage';
import UnitPage from '../components/UnitPage';
import Dashboard from '../user/dashboard';

function ModulePageWrapper() {
  const { id } = useParams();
  if (!id) return <div>Module ID not found</div>;
  return <ModulePage id={id} />;
}

function UnitPageWrapper() {
  const { id } = useParams();
  if (!id) return <div>Unit ID not found</div>;
  return <UnitPage id={id} />;
}

export const userRoutes: RouteObject = {
  path: '/user',
  element: <UserLayout />,
  children: [
    {
      index: true,
      element: <ModuleCards />,
    },
    {
      path: 'modules',
      element: <ModuleCards />,
    },
    {
      path: 'modules/:id',
      element: <ModulePageWrapper />,
    },
    {
      path: 'unit/:id',
      element: <UnitPageWrapper />,
    },
    {
      path: 'dashboard',
      element: <Dashboard />,
    },
  ],
};
