import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import UserLayout from '../layouts/UserLayout';
const ModuleCards = lazy(
  () => import('../components/user/modules/ModuleCards'),
);
const ModulePage = lazy(() => import('../components/user/module/ModulePage'));
const UnitPage = lazy(() => import('../components/user/unit/UnitPage'));
const Dashboard = lazy(() => import('../components/user/dashboard'));
const VideoPage = lazy(() => import('../components/user/video/VideoPage'));
const ArticlePage = lazy(
  () => import('../components/user/article/ArticlePage'),
);
const QuizQuestionPage = lazy(
  () => import('../components/user/quiz/QuizQuestionPage'),
);
const QuizSummaryPage = lazy(
  () => import('../components/user/quiz/QuizSummaryPage'),
);
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

function UnitPageWrapper() {
  const { id } = useParams();
  if (!id) return <div>Unit ID not found</div>;
  return (
    <Suspense fallback={<div>Loading Unit...</div>}>
      <UnitPage id={id} />
    </Suspense>
  );
}

function VideoPageWrapper() {
  const { id } = useParams();
  if (!id) return <div>Video ID not found</div>;
  return (
    <Suspense fallback={<div>Loading Video...</div>}>
      <VideoPage id={id} />
    </Suspense>
  );
}

function ArticlePageWrapper() {
  const { id } = useParams();
  if (!id) return <div>Article ID not found</div>;
  return (
    <Suspense fallback={<div>Loading Article...</div>}>
      <ArticlePage id={id} />
    </Suspense>
  );
}

export const userRoutes: RouteObject = {
  path: '/user',
  element: <UserLayout />,
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={<div>Loading Dashboard...</div>}>
          <Dashboard />
        </Suspense>
      ),
    },
    {
      path: 'modules',
      element: (
        <Suspense fallback={<div>Loading Module Cards...</div>}>
          <ModuleCards />
        </Suspense>
      ),
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
      path: 'quiz/:quizId/question/:index',
      element: (
        <Suspense fallback={<div>Loading Quiz Question...</div>}>
          <QuizQuestionPage />
        </Suspense>
      ),
    },
    {
      path: 'quiz/:quizId/summary',
      element: (
        <Suspense fallback={<div>Loading Quiz Summary...</div>}>
          <QuizSummaryPage />
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
