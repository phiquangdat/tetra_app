import { Outlet } from 'react-router-dom';
import { QuizModalProvider } from '../context/QuizModalContext.tsx';
import { UnitContentProvider } from '../context/UnitContentContext';
import QuizStartModal from '../components/user/quiz/QuizStartModal.tsx';

export default function UserLayout() {
  return (
    <QuizModalProvider>
      <UnitContentProvider>
        <main>
          <Outlet />
          <QuizStartModal />
        </main>
      </UnitContentProvider>
    </QuizModalProvider>
  );
}
