import { useState } from 'react';
import QuestionOption from './QuestionOption';

type Props = {
  questionNumber: number;
  questionType: 'trueFalse' | 'multipleChoice';
  onClose: () => void;
};

type QuestionOptionType = {
  answerLabel: string;
  answerText: string;
  isCorrect: boolean;
};

function QuestionForm({ questionNumber = 1, questionType, onClose }: Props) {
  const [quizTitle, setQuizTitle] = useState('');
  const [answerLabel, setAnswerLabel] = useState('A');
  const [questionOptions, setQuestionOptions] = useState<QuestionOptionType[]>(
    [],
  );

  const handleUpdateAnswerLabel = () => {
    const newLabel = String.fromCharCode(66 + questionOptions.length);
    setAnswerLabel(newLabel);
  };

  const handleSetQuestionOption = (option: QuestionOptionType) => {
    setQuestionOptions((prev) => {
      const updatedOptions = [...prev];
      const index = updatedOptions.findIndex(
        (opt) => opt.answerLabel === option.answerLabel,
      );
      if (index !== -1) {
        updatedOptions[index] = option;
      } else {
        updatedOptions.push(option);
      }
      return updatedOptions;
    });
  };

  const handleAddOption = () => {
    handleUpdateAnswerLabel();
    const newOption: QuestionOptionType = {
      answerLabel: answerLabel,
      answerText: '',
      isCorrect: false,
    };
    setQuestionOptions((prev) => [...prev, newOption]);
  };

  const handleClose = () => {
    setQuizTitle('');
    setQuestionOptions([]);
    onClose();
  };

  const handleRemoveOptionForm = () => {
    setQuestionOptions((prev) => {
      if (prev.length === 0) return prev;
      const updatedOptions = [...prev];
      updatedOptions.pop();
      return updatedOptions;
    });
    setAnswerLabel(() => {
      const newLabel = String.fromCharCode(65 + questionOptions.length - 1);
      return newLabel;
    });
  };

  if (questionType !== 'trueFalse' && questionType !== 'multipleChoice') {
    return null;
  }

  const icons = {
    close: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
  };

  return (
    <div
      className="max-w-5xl px-4 pt-2 pb-6 my-6 rounded-lg border-1 border-gray-400 shadow-lg"
      style={{ backgroundColor: '#F2EAEA' }}
    >
      <div className="flex justify-end">
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          {icons.close}
        </button>
      </div>

      <h2 className="text-lg text-gray-700 mb-4">Question {questionNumber}</h2>
      <textarea
        name="quizTitle"
        id="quizTitle"
        value={quizTitle}
        className="bg-white border-gray-400 border-1 w-full h-32 rounded-lg p-2 mb-6 focus:outline-none focus:border-blue-500 transition-colors duration-200"
        style={{ resize: 'none' }}
        onChange={(e) => setQuizTitle(e.target.value)}
      />

      {questionType === 'trueFalse' && (
        <div className="space-y-2 mb-6">
          <QuestionOption
            answerLabel="A"
            onSetQuestionOption={handleSetQuestionOption}
          />
          <QuestionOption
            answerLabel="B"
            onSetQuestionOption={handleSetQuestionOption}
          />
        </div>
      )}

      {questionType === 'multipleChoice' && (
        <div>
          <div className="flex justify-around items-center mb-4">
            <button
              className="bg-white border-gray-400 border-1 text-sm text-gray-700 px-2 rounded-lg cursor-pointer w-36 h-10 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 mb-6"
              onClick={handleAddOption}
            >
              <span className="text-xl pb-1">+</span>Add Option
            </button>
            <button
              className="bg-white border-gray-400 border-1 text-sm text-gray-700 px-2 rounded-lg cursor-pointer w-36 h-10 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 mb-6"
              onClick={handleRemoveOptionForm}
              disabled={questionOptions.length === 0}
            >
              <span className="text-xl pb-1">-</span>Remove Option
            </button>
          </div>
          <div className="space-y-2">
            {questionOptions.map((option, index) => (
              <QuestionOption
                key={index}
                answerLabel={option.answerLabel}
                onSetQuestionOption={handleSetQuestionOption}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionForm;
