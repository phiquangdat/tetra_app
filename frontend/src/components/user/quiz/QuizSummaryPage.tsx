import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useUnitContent } from '../../../context/user/UnitContentContext.tsx';
import { useModuleProgress } from '../../../context/user/ModuleProgressContext';
import { CircularProgressIcon } from '../../common/Icons';

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
  const { goToNextContent, isNextContent } = useModuleProgress();
  const { quizId } = useParams();
  const { unitId } = useUnitContent();
  const navigate = useNavigate();

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
          onClick={() => navigate(`/user/unit/${unitId}`)}
          className="inline-flex items-center text-gray-500 hover:text-black px-3 py-1 rounded-lg hover:bg-gray-100 hover:border hover:border-gray-300 active:bg-gray-200 transition-all cursor-pointer"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Unit page
        </a>
      </div>

      <h1 className="text-2xl font-semibold text-center text-primary mb-1">
        Quiz Summary
      </h1>
      <h2 className="text-4xl font-extrabold text-center text-surface mb-3">
        Key concepts of data protection
      </h2>
      <p className="text-center text-gray-700 mb-10">
        Well done! Here's how you did!
      </p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-12">
        {/* Circular progress bar */}
        <div className="relative w-32 h-32">
          <CircularProgressIcon percentage={percentage} />
          <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-surface">
            {percentage}%
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col items-center text-primary">
          <div className="flex items-center text-lg mb-2">
            <div className="flex items-center gap-2 pr-8 border-r border-highlight text-success">
              <CheckCircleIcon className="w-5 h-5" />
              <strong>{correctAnswers}</strong> correct
            </div>
            <div className="flex items-center gap-2 pl-8 text-error">
              <XCircleIcon className="w-5 h-5" />
              <strong>{incorrectAnswers}</strong> incorrect
            </div>
          </div>
          <div className="bg-accent text-white font-bold px-4 py-1 rounded-full text-center">
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
            <h3 className="font-semibold text-primary mb-4">
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
                    <CheckCircleIcon className="w-5 h-5 text-success ml-2" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-error ml-2" />
                  );
                }

                let bgClass = '';
                let textClass = '';
                let borderClass = 'border';

                if (isUserAnswer && isIncorrect) {
                  bgClass = 'bg-red-100';
                  textClass = 'text-error';
                  borderClass += ' border-2 border-dashed border-[#7E6BBE]';
                } else if (isUserAnswer && isCorrect) {
                  bgClass = 'bg-green-100';
                  textClass = 'text-success';
                  borderClass += ' border-2 border-dashed border-[#7E6BBE]';
                } else if (isCorrectAndNotChosen) {
                  bgClass = 'bg-green-100';
                  textClass = 'text-success';
                  borderClass += ' border border-success';
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
          onClick={() => goToNextContent(quizId ?? '')}
          className="bg-surface hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-full shadow-md transition-all"
        >
          {isNextContent(quizId ?? '') ? 'Continue Learning' : 'Finish'}
        </button>
      </div>
    </div>
  );
};

export default QuizSummaryPage;
