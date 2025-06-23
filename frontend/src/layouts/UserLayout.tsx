import { Outlet } from 'react-router-dom';
import { QuizModalProvider } from '../context/QuizModalContext.tsx';
import QuizStartModal from '../components/user/quiz/QuizStartModal.tsx';
import { UnitContentProvider } from '../context/UnitContentContext';
import { QuizProvider } from '../context/QuizContext.tsx';

export default function UserLayout() {
  return (
    <QuizModalProvider>
      <UnitContentProvider>
        <QuizProvider>
          <main>
            <Outlet />
            <QuizStartModal />
          </main>
        </QuizProvider>
      </UnitContentProvider>
    </QuizModalProvider>
  );
}
