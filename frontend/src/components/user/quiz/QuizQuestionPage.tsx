import { useState } from 'react';

const options = [
  'A message from your bank asking you to verify your password by clicking a link',
  'A software update notification from your operating system',
  'An email from a colleague with a work document attached',
  'A request to connect on a professional networking site',
];

const QuizQuestionPage = () => {
  const [selected, setSelected] = useState<number | null>(0);

  return (
    <div className="mx-auto px-4 py-12 flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-gray-500 text-xl tracking-wide">
          Question 1 of 5
        </div>
        <div className="bg-white rounded-2xl shadow-md p-8 w-full">
          <div className="text-lg font-semibold mb-6 text-gray-800">
            Which of the following is an example of phishing?
          </div>
          <form className="flex flex-col gap-4">
            {options.map((option, idx) => (
              <label
                key={idx}
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
                <span className="text-base leading-snug">{option}</span>
              </label>
            ))}
          </form>
        </div>
        <div className="flex justify-between mt-8">
          <button
            className="bg-gray-200 text-gray-400 font-semibold px-8 py-2 rounded-lg text-base shadow-sm cursor-not-allowed"
            type="button"
            disabled
          >
            Previous
          </button>
          <button
            className="bg-blue-500 text-white font-semibold px-8 py-2 rounded-lg text-base shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionPage;
