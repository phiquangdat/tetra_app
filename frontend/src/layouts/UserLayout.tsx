import { Outlet } from 'react-router-dom';
import { QuizModalProvider } from '../context/QuizModalContext.tsx';
import QuizStartModal from '../components/user/quiz/QuizStartModal.tsx';
import { UnitContentProvider } from '../context/UnitContentContext';
import { QuizProvider } from '../context/QuizContext.tsx';
import SharedHeader from '../components/common/SharedHeader.tsx';
import Sidebar, { type SidebarItem } from '../components/ui/Sidebar';

const topItems: SidebarItem[] = [
  { label: 'Dashboard', path: '/user/dashboard', icon: null },
  { label: 'Modules', path: '/user/modules', icon: null },
];
const bottomItems: SidebarItem[] = [
  { label: 'Log out', path: '/logout', icon: null },
];

export default function UserLayout() {
  return (
    <QuizModalProvider>
      <UnitContentProvider>
        <QuizProvider>
          <div className="min-h-screen flex flex-col">
            <SharedHeader />
            <div className="flex flex-1">
              <div className="w-64 border-r border-gray-200 bg-white">
                <Sidebar topItems={topItems} bottomItems={bottomItems} />
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
