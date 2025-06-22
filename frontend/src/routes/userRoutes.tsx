import type { RouteObject } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import UserLayout from '../layouts/UserLayout';
import ModuleCards from '../components/user/modules/ModuleCards';
import ModulePage from '../components/user/modules/ModulePage';
import UnitPage from '../components/UnitPage';
import Dashboard from '../components/user/dashboard';
import VideoPage from '../components/VideoPage';
import ArticlePage from '../components/user/article/ArticlePage';

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

function VideoPageWrapper() {
  const { id } = useParams();
  if (!id) return <div>Video ID not found</div>;
  return <VideoPage id={id} />;
}

function ArticlePageWrapper() {
  const { id } = useParams();
  if (!id) return <div>Article ID not found</div>;
  return <ArticlePage id={id} />;
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
      path: 'video/:id',
      element: <VideoPageWrapper />,
    },
    {
      path: 'article/:id',
      element: <ArticlePageWrapper />,
    },
    {
      path: 'dashboard',
      element: <Dashboard />,
    },
  ],
};
