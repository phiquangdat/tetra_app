import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../../../context/user/QuizContext.tsx';

const QuizQuestionPage = () => {
  const { index, quizId } = useParams();
  const { questions } = useQuiz();
  const navigate = useNavigate();
  const currentIndex = parseInt(index || '1', 10) - 1;
  const currentQuestion = questions[currentIndex];

  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (!questions.length) {
      // Optional: navigate back or show error
      console.warn('No questions loaded');
    }
  }, [questions]);

  useEffect(() => {
    setSelected(null);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      navigate(`/user/quiz/${quizId}/question/${currentIndex + 2}`);
    } else {
      navigate(`/user/quiz/${quizId}/summary`, {
        state: {
          quizId,
        },
      });
    }
  };

  if (!currentQuestion)
    return <div className="text-center">Loading question...</div>;

  return (
    <div className="mx-auto px-4 py-12 flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-secondary font-medium text-xl tracking-wide">
          Question {currentIndex + 1} of {questions.length}
        </div>
        <div className="bg-cardBackground rounded-2xl shadow-md p-8 w-full">
          <div className="text-lg font-semibold mb-8 text-primary">
            {currentQuestion.title}
          </div>
          <form className="flex flex-col gap-4">
            {currentQuestion.answers.map((answer, idx) => (
              <label
                key={answer.id}
                className={`flex items-center rounded-lg border transition-colors px-4 py-3 cursor-pointer text-primary ${
                  selected === idx
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-background border-secondary hover:bg-secondaryHover/20'
                }`}
              >
                <input
                  type="radio"
                  name="quiz"
                  checked={selected === idx}
                  onChange={() => setSelected(idx)}
                  className="form-radio h-5 w-5 text-secondary border-secondary focus:ring-secondary/30 mr-4"
                />
                <span className="text-base leading-snug">{answer.title}</span>
              </label>
            ))}
          </form>
        </div>
        <div className="flex justify-between mt-8">
          {currentIndex > 0 ? (
            <button
              onClick={() => navigate(-1)}
              className="bg-secondary hover:bg-secondaryHover text-background font-medium px-8 py-2 rounded-lg text-base transition-colors duration-200"
              type="button"
            >
              Previous
            </button>
          ) : (
            // Invisible placeholder to keep layout
            <div className="px-8 py-2 invisible">Previous</div>
          )}

          <button
            onClick={handleNext}
            className={`text-background font-semibold px-8 py-2 rounded-lg text-base transition-all duration-200 ${
              selected !== null
                ? 'bg-surface  hover:bg-surfaceHover'
                : 'bg-surface/20 cursor-not-allowed'
            }`}
            type="button"
            disabled={selected === null}
          >
            {currentIndex + 1 === questions.length ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionPage;
