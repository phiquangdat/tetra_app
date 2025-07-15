import React, { useState } from 'react';

const initialQuiz = {
  id: 'quiz1',
  title: 'Sample Quiz',
  description: 'A short quiz on basic math.',
  points: 10,
  questions: [
    {
      id: 'q1',
      text: 'What is 2 + 2?',
      answers: [
        { id: 'a1', text: '3', isCorrect: false },
        { id: 'a2', text: '4', isCorrect: true },
        { id: 'a3', text: '5', isCorrect: false },
      ],
    },
    {
      id: 'q2',
      text: 'What is 5 x 3?',
      answers: [
        { id: 'a1', text: '15', isCorrect: true },
        { id: 'a2', text: '20', isCorrect: false },
      ],
    },
  ],
};

const QuizBlock: React.FC = () => {
  const [quiz] = useState(initialQuiz);

  return (
    <div className="px-6 pb-4 text-primary text-base">
      <div className="space-y-4 mt-4">
        {/* Quiz Details */}
        <div>
          <p className="text-sm font-semibold">Quiz title</p>
          <p>{quiz.title}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Description</p>
          <p>{quiz.description}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Points</p>
          <p>{quiz.points}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover text-sm"
          >
            Edit
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
            Delete
          </button>
        </div>

        {/* Questions */}
        {/* Questions */}
        <div>
          <p className="text-sm font-semibold">Questions</p>
          <div className="space-y-4 mt-4">
            {' '}
            {/* ← Added `mt-4` here */}
            {quiz.questions.map((q) => (
              <div
                key={q.id}
                className="border border-highlight rounded-xl p-4 bg-white shadow-sm"
              >
                <p className="text-sm font-medium">{q.text}</p>

                <div className="space-y-2 mt-2">
                  {q.answers.map((a) => (
                    <div
                      key={a.id}
                      className={`flex items-center gap-2 text-sm ${
                        a.isCorrect ? 'text-green-600 font-semibold' : ''
                      }`}
                    >
                      <span>{a.text}</span>
                      {a.isCorrect && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizBlock;
