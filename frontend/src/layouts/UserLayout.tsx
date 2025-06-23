import { Outlet } from 'react-router-dom';
import { QuizModalProvider } from '../context/QuizModalContext.tsx';
import QuizStartModal from '../components/user/quiz/QuizStartModal.tsx';
import { UnitContentProvider } from '../context/UnitContentContext';

export default function UserLayout() {
  return (
    <QuizModalProvider>
      <main>
        <Outlet />
        <QuizStartModal />
      </main>
    </QuizModalProvider>
  );
}
