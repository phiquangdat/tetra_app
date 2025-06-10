const icons = {
  question: (
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
  check: (
    <svg
      className="w-6 h-6"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
    >
      <g>
        <path
          fill="currentColor"
          d="M42.4,10.7c-2.2,0.8-5,3.3-6.2,5.5l-1,1.9l-0.1,108.5c-0.1,81.4,0,109.2,0.4,111c0.4,2.1,0.9,2.9,2.9,4.9c1.5,1.5,3,2.5,4.2,2.9c2.7,0.8,168.1,0.8,170.7,0c2.4-0.7,5.3-3.2,6.5-5.6l1-1.9V128V18.1l-1-1.9c-1.3-2.4-4.2-4.9-6.5-5.6C210.8,9.7,44.6,9.8,42.4,10.7z M77.4,31.6c6.4,12.6,6.8,13.3,8.3,13.8c2.3,0.8,82.5,0.8,84.8,0c1.5-0.5,1.9-1.2,8.3-13.8l6.7-13.3h13.7h13.7V128v109.7h-84.8H43.3V128V18.3H57h13.7L77.4,31.6z M171.3,27.8l-4.7,9.4h-38.5H89.6l-4.7-9.4l-4.7-9.4h47.9H176L171.3,27.8z"
        />
        <path
          fill="currentColor"
          d="M162.9,120.2c-0.5,0.3-11.2,10.8-23.8,23.4l-22.9,22.9l-10.7-10.6c-5.9-5.9-11.2-10.9-11.8-11.2c-2.5-1.2-5.6,0.9-5.6,3.9c0,1.8,0.3,2.1,12.6,14.5c6.9,7,13.2,12.9,14.1,13.3c1.2,0.6,1.7,0.6,3,0c0.8-0.4,11.9-11.1,26.3-25.5c23.7-23.8,24.7-24.9,24.7-26.5C168.6,121.2,165.3,118.9,162.9,120.2z"
        />
      </g>
    </svg>
  ),
};

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
                {icons.question}
              </span>
              {quiz.questions} questions
            </div>
            <div className="flex items-center gap-2 text-lg text-gray-700">
              <span className="inline-flex items-center justify-center">
                {icons.quiz}
              </span>
              {quiz.points} points
            </div>
          </div>
          <div className="rounded-xl p-6 mb-8 w-full max-w-md flex flex-col justify-center">
            <div className="flex items-center mb-2">
              <span className="mr-2">{icons.check}</span>
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
