import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ModuleProgressProvider } from '../context/user/ModuleContext.tsx';
import { QuizModalProvider } from '../context/user/QuizModalContext.tsx';
import QuizStartModal from '../components/user/quiz/QuizStartModal.tsx';
import { UnitContentProvider } from '../context/user/UnitContentContext';
import { QuizProvider } from '../context/user/QuizContext.tsx';
import SharedHeader from '../components/common/SharedHeader.tsx';
import UserSidebar from '../components/user/layout/UserSidebar';
import Footer from '../components/ui/Footer.tsx';

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <QuizModalProvider>
      <UnitContentProvider>
        <ModuleProgressProvider>
          <QuizProvider>
            <div className="min-h-screen flex flex-col">
              <SharedHeader
                onHamburgerClick={toggleSidebar}
                isSidebarOpen={sidebarOpen}
              />
              <div className="flex flex-1">
                {sidebarOpen && <UserSidebar />}
                <main className="flex-1">
                  <Outlet />
                  <QuizStartModal />
                </main>
              </div>
              <Footer />
            </div>
          </QuizProvider>
        </ModuleProgressProvider>
      </UnitContentProvider>
    </QuizModalProvider>
  );
}
