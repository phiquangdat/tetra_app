import { useQuizModal } from '../../../context/user/QuizModalContext';
import { useEffect, useState } from 'react';
import { fetchQuizById, type Quiz } from '../../../services/quiz/quizApi';
import { useModuleProgress } from '../../../context/user/ModuleProgressContext';
import { getContentProgress } from '../../../services/userProgress/userProgressApi';
import { CheckIcon, X } from 'lucide-react';
import { hydrateContextFromContent } from '../../../utils/contextHydration'; // ⬅️ add

const QuizPassedModal = () => {
  const { isOpen, type, quizId, closeModal } = useQuizModal();
  const { goToNextContent, setUnitId, setModuleId, unitId, moduleId } =
    useModuleProgress();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const isVisible = isOpen && type === 'passed' && !!quizId;

  useEffect(() => {
    if (!isVisible || !quizId) return;
    let cancelled = false;

    (async () => {
      try {
        if (!unitId || !moduleId) {
          await hydrateContextFromContent(quizId, { setUnitId, setModuleId });
        }

        const [q, progress] = await Promise.all([
          fetchQuizById(quizId),
          getContentProgress(quizId).catch((e: Error) => {
            if (e.message.includes('404')) return null;
            throw e;
          }),
        ]);
        if (!cancelled) {
          setQuiz(q);
          setPoints(progress?.points ?? null);
        }
      } catch (e) {
        console.error('[QuizPassedModal] load failed:', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isVisible, quizId, unitId, moduleId, setUnitId, setModuleId]);

  if (!isOpen || type !== 'passed' || !quizId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30">
      <div className="relative bg-background rounded-3xl p-8 md:p-12 shadow-2xl w-full max-w-2xl mx-4 flex flex-col items-center">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 text-primary hover:text-secondaryHover transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-sm mb-5">
          <CheckIcon width={20} height={20} color="white" />
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-primary mb-2">
          {quiz?.title ?? 'Quiz completed'}
        </h2>

        {typeof points === 'number' && points > 0 && (
          <div className="mt-2 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200">
              {points} pts
            </span>
          </div>
        )}

        <p className="text-primary/80 text-center mb-8">
          You’ve already completed this quiz. Feel free to proceed.
        </p>

        {/* Divider for structure */}
        <div className="w-full h-px bg-highlight/40 mb-8" />

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={closeModal}
            className="bg-cardBackground hover:bg-highlight text-primary px-6 py-3 rounded-full text-base transition-all border border-highlight"
          >
            ← Back
          </button>
          <button
            className="bg-surface hover:bg-surfaceHover text-background font-semibold px-6 py-3 rounded-full text-base transition-all"
            onClick={() => {
              closeModal();
              goToNextContent(quizId);
            }}
          >
            Go to Next block
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPassedModal;
