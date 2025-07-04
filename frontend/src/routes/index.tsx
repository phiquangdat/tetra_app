import { lazy, Suspense } from 'react';
import { userRoutes } from './userRoutes';
import { adminRoutes } from './adminRoutes';

const Home = lazy(() => import('../components/home/Home'));

export const appRoutes = [
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Loading Home...</div>}>
        <Home />
      </Suspense>
    ),
  },
  userRoutes,
  adminRoutes,
];
