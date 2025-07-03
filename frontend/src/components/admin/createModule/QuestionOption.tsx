import { useState } from 'react';
import {
  CorrectAnswerIcon,
  IncorrectAnswerIcon,
  ReOrderIcon,
} from '../../common/Icons';

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

  return (
    <div className="flex now-wrap items-center justify-between ">
      <div className="w-6 flex flex-col items-center justify-center">
        <button>{ReOrderIcon}</button>
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
            {CorrectAnswerIcon}
          </button>
          <button
            className="px-1 h-8 text-gray-700"
            onClick={() => {
              handleIncorrectAnswerClick();
              handleSetQuestionOption();
            }}
          >
            {IncorrectAnswerIcon}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionOption;
