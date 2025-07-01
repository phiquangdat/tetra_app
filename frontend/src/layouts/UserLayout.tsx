import { Outlet } from 'react-router-dom';
import { QuizModalProvider } from '../context/QuizModalContext.tsx';
import QuizStartModal from '../components/user/quiz/QuizStartModal.tsx';
import { UnitContentProvider } from '../context/UnitContentContext';
import { QuizProvider } from '../context/QuizContext.tsx';
import SharedHeader from '../components/common/SharedHeader.tsx';
import UserSidebar from '../components/user/layout/UserSidebar';

export default function UserLayout() {
  return (
    <QuizModalProvider>
      <UnitContentProvider>
        <QuizProvider>
          <div className="min-h-screen flex flex-col">
            <SharedHeader />
            <div className="flex flex-1">
              <div className="w-64 border-r border-gray-200 bg-white">
                <UserSidebar />
              </div>
              <main className="flex-1">
                <Outlet />
                <QuizStartModal />
              </main>
            </div>
          </div>
        </QuizProvider>
      </UnitContentProvider>
    </QuizModalProvider>
  );
}
