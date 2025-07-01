import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const mockedQuestions = [
  {
    id: 1,
    question: 'Is GDPR applicable to companies outside the EU?',
    options: ['Yes', 'No'],
    userAnswer: 'Yes',
    correctAnswer: 'Yes',
  },
  {
    id: 2,
    question: 'Which of these is a data subject right?',
    options: [
      'Right to work',
      'Right to erasure',
      'Right to relocate',
      'Right to compensation',
    ],
    userAnswer: 'Right to relocate',
    correctAnswer: 'Right to erasure',
  },
];

const QuizSummaryPage: React.FC = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const unitIdFromState = (location.state as { unitId?: string })?.unitId;

  console.log('Quiz ID is ', quizId);

  const correctAnswers = mockedQuestions.filter(
    (q) => q.userAnswer === q.correctAnswer,
  ).length;
  const incorrectAnswers = mockedQuestions.length - correctAnswers;
  const percentage = Math.round(
    (correctAnswers / mockedQuestions.length) * 100,
  );

  return (
    <div className="bg-white min-h-screen py-8 px-6">
      <div className="mb-4">
        <a
          onClick={() => navigate(`/user/unit/${unitIdFromState}`)}
          className="inline-flex items-center text-gray-500 hover:text-black px-3 py-1 rounded-lg hover:bg-gray-100 hover:border hover:border-gray-300 active:bg-gray-200 transition-all cursor-pointer"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Unit page
        </a>
      </div>

      <h1 className="text-2xl font-semibold text-center text-[#231942] mb-1">
        Quiz Summary
      </h1>
      <h2 className="text-4xl font-extrabold text-center text-[#14248A] mb-3">
        Key concepts of data protection
      </h2>
      <p className="text-center text-gray-700 mb-10">
        Well done! Here's how you did!
      </p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-12">
        {/* Circular progress bar */}
        <div className="relative w-32 h-32">
          <svg className="w-full h-full" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#D4C2FC"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#FFA726"
              strokeWidth="10"
              fill="none"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={(1 - percentage / 100) * 2 * Math.PI * 45}
              strokeLinecap="round"
              transform="rotate(-90 64 64)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#14248A]">
            {percentage}%
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col items-center text-[#231942]">
          <div className="flex items-center text-lg mb-2">
            <div className="flex items-center gap-2 pr-8 border-r border-[#D4C2FC] text-green-700">
              <CheckCircleIcon className="w-5 h-5" />
              <strong>{correctAnswers}</strong> correct
            </div>
            <div className="flex items-center gap-2 pl-8 text-red-700">
              <XCircleIcon className="w-5 h-5" />
              <strong>{incorrectAnswers}</strong> incorrect
            </div>
          </div>
          <div className="bg-[#FFA726] text-white font-bold px-4 py-1 rounded-full text-center">
            +12 px
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-6 mb-12">
        {mockedQuestions.map((q, index) => (
          <div
            key={q.id}
            className="bg-[#F5F3F7] border border-gray-300 p-6 rounded-2xl shadow-sm"
          >
            <h3 className="font-semibold text-[#231942] mb-4">
              Question {index + 1}: {q.question}
            </h3>
            <ul className="space-y-2">
              {q.options.map((opt) => {
                const isCorrect = opt === q.correctAnswer;
                const isUserAnswer = opt === q.userAnswer;
                const isIncorrect = isUserAnswer && !isCorrect;
                const isCorrectAndNotChosen = isCorrect && !isUserAnswer;

                let icon = null;
                if (isUserAnswer) {
                  icon = isCorrect ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600 ml-2" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-600 ml-2" />
                  );
                }

                let bgClass = '';
                let textClass = '';
                let borderClass = 'border';

                if (isUserAnswer && isIncorrect) {
                  bgClass = 'bg-red-100';
                  textClass = 'text-red-800';
                  borderClass += ' border-2 border-dashed border-[#7E6BBE]';
                } else if (isUserAnswer && isCorrect) {
                  bgClass = 'bg-green-100';
                  textClass = 'text-green-800';
                  borderClass += ' border-2 border-dashed border-[#7E6BBE]';
                } else if (isCorrectAndNotChosen) {
                  bgClass = 'bg-green-100';
                  textClass = 'text-green-800';
                  borderClass += ' border border-green-500';
                } else {
                  borderClass += ' border border-gray-300';
                }

                return (
                  <li
                    key={opt}
                    className={`flex items-center justify-between px-4 py-2 rounded-lg ${borderClass} ${bgClass} ${textClass}`}
                  >
                    {opt}
                    {icon}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => navigate(`/user/unit/${unitIdFromState}`)}
          className="bg-[#14248A] hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-full shadow-md transition-all"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};

export default QuizSummaryPage;
