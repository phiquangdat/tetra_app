import { useState } from 'react';

type Props = {
  answerLabel?: string;
  onSetQuestionOption: (option: QuestionOption) => void;
};

type QuestionOption = {
  answerLabel: string;
  answerText: string;
  isCorrect: boolean;
};

function QuestionOption({ answerLabel = 'A', onSetQuestionOption }: Props) {
  const [answerText, setAnswerText] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const handleAnswerTextChange = (e: { target: { value: string } }) => {
    setAnswerText(e.target.value);
  };

  const handleCorrectAnswerClick = () => {
    setIsCorrect(true);
  };

  const handleIncorrectAnswerClick = () => {
    setIsCorrect(false);
  };

  const handleSetQuestionOption = () => {
    if (!answerText.trim()) {
      alert('Answer text cannot be empty');
      return;
    }
    const newOption: QuestionOption = {
      answerLabel: answerLabel,
      answerText: answerText,
      isCorrect: isCorrect,
    };

    onSetQuestionOption(newOption);
  };

  const icons = {
    correctAnswer: (
      <svg
        className="svg-icon"
        style={{
          width: '1.5em',
          height: '1.5em',
          verticalAlign: 'middle',
          fill: 'currentColor',
          overflow: 'hidden',
        }}
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M427.2128 661.1456l364.2368-380.5184a38.4 38.4 0 0 1 55.5008 53.1456l-392.0896 409.6a38.4 38.4 0 0 1-55.6032-0.1536l-222.3104-233.984a38.4 38.4 0 1 1 55.7056-52.9408l194.56 204.8512z" />
      </svg>
    ),
    incorrectAnswer: (
      <svg
        className="svg-icon"
        style={{
          width: '1.5em',
          height: '1.5em',
          verticalAlign: 'middle',
          fill: 'currentColor',
          overflow: 'hidden',
        }}
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M801.62816 222.37184a30.72 30.72 0 0 1 0 43.43808L555.43808 512l246.19008 246.21056a30.72 30.72 0 1 1-43.43808 43.43808L512 555.43808 265.8304 801.62816a30.72 30.72 0 1 1-43.45856-43.43808L468.54144 512l-246.1696-246.1696a30.72 30.72 0 1 1 43.43808-43.45856L512 468.54144l246.21056-246.1696a30.72 30.72 0 0 1 43.43808 0z" />
      </svg>
    ),
    reOrder: (
      <svg
        className="svg-icon"
        style={{
          width: '1.5em',
          height: '1.5em',
          verticalAlign: 'middle',
          fill: 'currentColor',
          overflow: 'hidden',
        }}
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M128 640h768v-85.333333H128v85.333333m0 170.666667h768v-85.333334H128v85.333334m0-341.333334h768V384H128v85.333333m0-256v85.333334h768V213.333333H128z"
          fill=""
        />
      </svg>
    ),
  };

  return (
    <div className="flex now-wrap items-center justify-between ">
      <div className="w-6 flex flex-col items-center justify-center">
        <button>{icons.reOrder}</button>
      </div>
      <div className="w-12 text-left pl-2">
        <p>{answerLabel}.</p>
      </div>
      <div className="flex no-wrap items-center justify-between w-full border-2 border-gray-400 rounded-lg overflow-hidden">
        <input
          type="text"
          value={answerText}
          onChange={handleAnswerTextChange}
          className="w-full h-8 bg-white p-1 focus:outline-none focus:border-blue-500 transition-colors duration-200"
        />
        <div className="flex no-wrap items-center justify-between bg-white">
          <button
            className="px-1 h-8 text-gray-700 border-r-1 border-l-1 border-gray-400"
            onClick={() => {
              handleCorrectAnswerClick();
              handleSetQuestionOption();
            }}
          >
            {icons.correctAnswer}
          </button>
          <button
            className="px-1 h-8 text-gray-700"
            onClick={() => {
              handleIncorrectAnswerClick();
              handleSetQuestionOption();
            }}
          >
            {icons.incorrectAnswer}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionOption;
