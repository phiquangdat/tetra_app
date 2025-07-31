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
import UnitCompletionModal from '../components/user/unit/UnitCompletionModal.tsx';
import { UnitCompletionModalProvider } from '../context/user/UnitCompletionModalContext.tsx';
import { AuthProvider } from '../context/auth/AuthContext.tsx';
import { UserProvider } from '../context/auth/UserContext.tsx';
export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <AuthProvider>
      <UserProvider>
        <QuizModalProvider>
          <UnitCompletionModalProvider>
            <UnitContentProvider>
              <ModuleProgressProvider>
                <QuizProvider>
                  <div className="min-h-screen flex flex-col">
                    <SharedHeader
                      onHamburgerClick={toggleSidebar}
                      isSidebarOpen={sidebarOpen}
                    />
                    <div className="flex flex-1 relative">
                      <div
                        className={`
                      absolute z-50 h-full
                      transform transition-transform duration-300 ease-in-out
                      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                      `}
                      >
                        <UserSidebar />
                      </div>
                      <main
                        className={`
                        flex-1 transition-all duration-300 ease-in-out
                        ${sidebarOpen ? 'ml-64' : ''}
                      `}
                      >
                        <Outlet />
                        <UnitCompletionModal />
                        <QuizStartModal />
                      </main>
                    </div>
                    <Footer />
                  </div>
                </QuizProvider>
              </ModuleProgressProvider>
            </UnitContentProvider>
          </UnitCompletionModalProvider>
        </QuizModalProvider>
      </UserProvider>
    </AuthProvider>
  );
}
