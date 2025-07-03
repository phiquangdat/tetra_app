import { useQuizModal } from '../../../context/user/QuizModalContext.tsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Quiz, fetchQuizById } from '../../../services/quiz/quizApi.ts';
import { useQuiz } from '../../../context/user/QuizContext.tsx';
import { fetchQuizQuestionsByQuizId } from '../../../services/quiz/quizApi';
import { QuestionIcon, StarIcon } from '../../common/Icons.tsx';

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
  const { isOpen, quizId, closeModal } = useQuizModal();
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
    if (!isOpen || !quizId) return;

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
  }, [quizId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/30">
      <div className="relative bg-white rounded-2xl p-12 shadow-lg w-full max-w-2xl flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
        >
          ×
        </button>

        {error && <p className="text-red-500">{error}</p>}

        {!error && isQuizValid(quizDetails) && (
          <>
            {/*Title*/}
            <h2 className="text-4xl font-extrabold mb-6 text-center text-black">
              {loading ? 'Loading title...' : quizDetails?.title}
            </h2>

            {/* Info row */}
            <div className="flex flex-row gap-10 mb-6 items-center justify-center">
              <div className="flex items-center gap-2 text-lg text-gray-700">
                <span className="inline-flex items-center justify-center">
                  {QuestionIcon}
                </span>
                {loading
                  ? 'Loading questions data...'
                  : `${quizDetails?.questions_number} questions`}
              </div>
              <div className="flex items-center gap-2 text-lg text-gray-700">
                <span className="inline-flex items-center justify-center">
                  {StarIcon}
                </span>
                {loading
                  ? 'Loading points data...'
                  : `${quizDetails?.points} points`}
              </div>
            </div>

            {/* Description */}
            <p className="text-center text-gray-700 mb-10 max-w-xl">
              {loading ? 'Loading description...' : quizDetails?.content}
            </p>
          </>
        )}

        {/* Action buttons row */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={closeModal}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full text-base transition-all"
          >
            ← Back
          </button>
          <button
            className="bg-blue-100 hover:bg-blue-200 text-blue-900 font-semibold px-6 py-2 rounded-full text-base transition-all"
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
