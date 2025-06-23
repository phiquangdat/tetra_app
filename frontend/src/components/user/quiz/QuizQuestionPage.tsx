import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../../../context/QuizContext';

const QuizQuestionPage = () => {
  const { index, quizId } = useParams();
  const { questions } = useQuiz();
  const navigate = useNavigate();
  const currentIndex = parseInt(index || '1', 10) - 1;
  const currentQuestion = questions[currentIndex];

  const [selected, setSelected] = useState<number | null>(0);

  useEffect(() => {
    if (!questions.length) {
      // Optional: navigate back or show error
      console.warn('No questions loaded');
    }
  }, [questions]);

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      navigate(`/user/quiz/${quizId}/question/${currentIndex + 2}`);
    } else {
      console.log('Quiz completed!');
    }
  };

  if (!currentQuestion)
    return <div className="text-center">Loading question...</div>;

  return (
    <div className="mx-auto px-4 py-12 flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-gray-500 text-xl tracking-wide">
          Question {currentIndex + 1} of {questions.length}
        </div>
        <div className="bg-white rounded-2xl shadow-md p-8 w-full">
          <div className="text-lg font-semibold mb-6 text-gray-800">
            {currentQuestion.title}
          </div>
          <form className="flex flex-col gap-4">
            {currentQuestion.answers.map((answer, idx) => (
              <label
                key={answer.id}
                className={`flex items-center rounded-lg border transition-colors px-4 py-3 cursor-pointer text-gray-700 ${
                  selected === idx
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-white border-gray-300 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="quiz"
                  checked={selected === idx}
                  onChange={() => setSelected(idx)}
                  className="form-radio h-5 w-5 text-blue-600 mr-4 focus:ring-blue-400"
                />
                <span className="text-base leading-snug">{answer.title}</span>
              </label>
            ))}
          </form>
        </div>
        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 text-gray-700 font-semibold px-8 py-2 rounded-lg text-base shadow-sm"
            type="button"
            disabled={currentIndex === 0}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="bg-blue-500 text-white font-semibold px-8 py-2 rounded-lg text-base shadow-md hover:bg-blue-600"
            type="button"
          >
            {currentIndex + 1 === questions.length ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionPage;
