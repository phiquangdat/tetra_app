import { QuestionIcon, CheckAltIcon, StarIcon } from '../../common/Icons';

const QuizPassedModal = ({ onNext }: { onNext: () => void }) => {
  const quiz = {
    title: 'Key concepts of data protection',
    questions: 5,
    points: 20,
    completedDate: 'May 28',
    score: 3,
    pointsEarned: 12,
  };

  return (
    <div className="mx-auto px-8 py-8 min-h-screen text-left">
      <div className="mb-6">
        <a
          href="/unit"
          className="inline-flex items-center text-gray-500 hover:text-black px-3 py-1 rounded-lg hover:bg-gray-100 hover:border hover:border-gray-300 active:bg-gray-200 transition-all"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Unit
        </a>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="bg-gray-100 rounded-2xl p-12 shadow-md w-full max-w-2xl flex flex-col items-center">
          <h2 className="text-4xl font-extrabold mb-6 text-center text-black">
            {quiz.title}
          </h2>
          <div className="flex flex-row gap-10 mb-6 items-center justify-center">
            <div className="flex items-center gap-2 text-lg text-gray-700">
              <span className="inline-flex items-center justify-center">
                <QuestionIcon />
              </span>
              {quiz.questions} questions
            </div>
            <div className="flex items-center gap-2 text-lg text-gray-700">
              <span className="inline-flex items-center justify-center">
                <StarIcon />
              </span>
              {quiz.points} points
            </div>
          </div>
          <div className="rounded-xl p-6 mb-8 w-full max-w-md flex flex-col justify-center">
            <div className="flex items-center mb-2">
              <span className="mr-2">
                <CheckAltIcon />
              </span>
              <span className="text-lg">
                You completed this quiz on {quiz.completedDate}
              </span>
            </div>
            <div className="text-lg mb-2">
              <span>Score:</span> {quiz.score}/{quiz.questions}
            </div>
            <div className="text-lg mb-2">
              <span>Points earned:</span> {quiz.pointsEarned}/{quiz.points}
            </div>
          </div>
          <button
            className="bg-blue-100 hover:bg-blue-200 text-blue-900 font-semibold py-3 px-10 rounded-full text-lg transition-all"
            onClick={onNext}
          >
            Go to Next block
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPassedModal;
