import { Outlet } from 'react-router-dom';
import { QuizModalProvider } from '../context/QuizModalContext.tsx';
import QuizStartModal from '../components/QuizStartModal.tsx';

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
