import { useQuizModal } from '../context/QuizModalContext';
import { useEffect, useState } from 'react';
import { type Quiz, fetchQuizById } from '../services/quiz/quizApi.ts';

const icons = {
  article: (
    <svg
      className="w-6 h-6"
      viewBox="0 0 73.9 73.9"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="m52.4 13.1h5.6v11.1h-5.6z"
        fill="none"
        transform="matrix(.7071 -.7071 .7071 .7071 2.9695 44.5346)"
      />
      <path d="m47.9 18.2-26.3 26.2v7.9h7.9l26.3-26.3z" fill="none" />
      <g fill="currentColor">
        <path d="m11.4 63.6h46.6c.6 0 1-.4 1-1v-26.4c0-.6-.4-1-1-1s-1 .4-1 1v25.4h-44.6v-44.6h25.4c.6 0 1-.4 1-1s-.4-1-1-1h-26.4c-.6 0-1 .4-1 1v46.6c0 .5.4 1 1 1z" />
        <path d="m47.2 16.1-27.3 27.2c-.2.2-.3.4-.3.7v9.3c0 .6.4 1 1 1h9.3c.3 0 .5-.1.7-.3l27.3-27.3 5.4-5.4c.4-.4.4-1 0-1.4l-9.3-9.3c-.4-.4-1-.4-1.4 0zm-17.7 36.2h-7.8v-7.9l26.3-26.3 7.8 7.8zm23.8-39.5 7.8 7.9-4 4-7.8-7.9z" />
      </g>
    </svg>
  ),
  quiz: (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 17.75l-6.172 3.245 1.179-6.873L2 9.755l6.908-1.004L12 2.5l3.092 6.251L22 9.755l-5.007 4.367 1.179 6.873z"
      />
    </svg>
  ),
};

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
                  {icons.article}
                </span>
                {loading
                  ? 'Loading questions data...'
                  : `${quizDetails?.questions_number} questions`}
              </div>
              <div className="flex items-center gap-2 text-lg text-gray-700">
                <span className="inline-flex items-center justify-center">
                  {icons.quiz}
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
          <button className="bg-blue-100 hover:bg-blue-200 text-blue-900 font-semibold px-6 py-2 rounded-full text-base transition-all">
            Let's go
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizStartModal;
