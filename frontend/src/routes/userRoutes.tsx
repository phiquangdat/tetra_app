import type { RouteObject } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import UserLayout from '../layouts/UserLayout';
import ModuleCards from '../components/ModuleCards';
import ModulePage from '../components/ModulePage';

function ModulePageWrapper() {
  const { id } = useParams();
  if (!id) return <div>Module ID not found</div>;
  return <ModulePage id={id} />;
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
  ],
};
