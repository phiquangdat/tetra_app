import { useQuizModal } from '../../../context/user/QuizModalContext.tsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Quiz, fetchQuizById } from '../../../services/quiz/quizApi.ts';
import { useQuiz } from '../../../context/user/QuizContext.tsx';
import { fetchQuizQuestionsByQuizId } from '../../../services/quiz/quizApi';
import { QuestionIcon, StarIcon } from '../../common/Icons.tsx';
import { X } from 'lucide-react';

const isQuizValid = (quiz: Quiz): boolean => {
  return (
    quiz &&
    typeof quiz.title === 'string' &&
    quiz.title.trim() !== '' &&
    typeof quiz.content === 'string' &&
    quiz.content.trim() !== '' &&
    typeof quiz.points === 'number' &&
    quiz.points > 0 &&
    typeof quiz.questions_number === 'number' &&
    quiz.questions_number > 0
  );
};

const QuizStartModal = () => {
  const { isOpen, quizId, type, closeModal } = useQuizModal();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quizDetails, setQuizDetails] = useState<Quiz>({
    id: '',
    title: '',
    content: '',
    points: 0,
    questions_number: 0,
  });
  const navigate = useNavigate();
  const { setQuestions } = useQuiz();

  const isVisible = isOpen && type === 'start' && !!quizId;

  const handleStartQuiz = async () => {
    if (!quizId) return;
    try {
      const questions = await fetchQuizQuestionsByQuizId(quizId);
      setQuestions(questions);
      closeModal();
      navigate(`/user/quiz/${quizId}/question/1`);
    } catch (err) {
      console.error('Failed to fetch quiz questions:', err);
    }
  };

  useEffect(() => {
    if (!isVisible || !quizId) return;

    setLoading(true);
    const loadQuizDetails = async () => {
      try {
        const quiz = await fetchQuizById(quizId);
        if (!isQuizValid(quiz)) {
          throw new Error('Incomplete quiz data');
        }
        setQuizDetails(quiz);
        setError(null);
      } catch (err) {
        console.error('Failed to load quiz details:', err);
        setError('Failed to load quiz details');
      } finally {
        setLoading(false);
      }
    };

    loadQuizDetails();
  }, [isVisible, quizId]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30">
      <div className="relative bg-background rounded-3xl p-8 md:p-12 shadow-2xl w-full max-w-2xl mx-4 flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 text-primary hover:text-secondaryHover transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {error && <p className="text-error">{error}</p>}

        {!error && isQuizValid(quizDetails) && (
          <>
            {/*Title*/}
            <h2 className="text-4xl font-extrabold mb-6 text-center text-primary">
              {loading ? 'Loading title...' : quizDetails?.title}
            </h2>

            {/* Info row */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 mb-8 items-center justify-center">
              <div className="flex items-center gap-3 px-4 py-2 text-lg text-primary rounded-full bg-cardBackground">
                <span className="inline-flex items-center justify-center">
                  <QuestionIcon color="#ffa726" strokeWidth={3} />
                </span>
                {loading
                  ? 'Loading questions data...'
                  : `${quizDetails?.questions_number} questions`}
              </div>
              <div className="flex items-center gap-3 px-4 py-2 text-lg text-primary rounded-full bg-cardBackground">
                <span className="inline-flex items-center justify-center">
                  <StarIcon />
                </span>
                {loading
                  ? 'Loading points data...'
                  : `${quizDetails?.points} points`}
              </div>
            </div>

            {/* Description */}
            <p className="text-center text-primary opacity-90 mb-10 max-w-xl leading-relaxed">
              {loading ? 'Loading description...' : quizDetails?.content}
            </p>
          </>
        )}

        {/* Action buttons row */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <button
            onClick={closeModal}
            className="bg-cardBackground hover:bg-highlight text-primary px-6 py-3 rounded-full text-base transition-all border border-highlight disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            ← Back
          </button>
          <button
            className="bg-surface hover:bg-surfaceHover text-background font-semibold px-6 py-3 rounded-full text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            onClick={handleStartQuiz}
          >
            Let's go
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizStartModal;
