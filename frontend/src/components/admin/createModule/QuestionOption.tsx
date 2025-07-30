import { useState, useEffect } from 'react';
import {
  CorrectAnswerIcon,
  IncorrectAnswerIcon,
  ReOrderIcon,
} from '../../common/Icons';
import { useContentBlockContext } from '../../../context/admin/ContentBlockContext';

type Props = {
  questionIndex: number;
  answerIndex: number;
};

function QuestionOption({ questionIndex, answerIndex }: Props) {
  const { data, updateAnswer, updateQuestion } = useContentBlockContext();

  const question = data.questions?.[questionIndex];
  const answer = question?.answers?.[answerIndex] ?? {
    title: '',
    is_correct: false,
    sort_order: answerIndex,
  };

  const [answerText, setAnswerText] = useState(answer.title || '');
  const [isCorrect, setIsCorrect] = useState(answer.is_correct || false);
  const isTrueFalse = question?.type === 'true/false';

  // Keep local state in sync if context changes (e.g., undo or reset)
  useEffect(() => {
    setAnswerText(answer.title || '');
    setIsCorrect(answer.is_correct || false);
  }, [answer.title, answer.is_correct]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswerText(e.target.value);
  };

  const applyUpdate = (isCorrectFlag: boolean) => {
    if (isTrueFalse && isCorrectFlag) {
      const updatedAnswers = question.answers.map((a, i) => ({
        ...a,
        is_correct: i === answerIndex,
      }));
      updateQuestion(questionIndex, {
        ...question,
        answers: updatedAnswers,
      });
      setIsCorrect(true);
    } else {
      updateAnswer(questionIndex, answerIndex, {
        title: answerText,
        is_correct: isCorrectFlag,
        sort_order: answerIndex,
      });
      setIsCorrect(isCorrectFlag);
    }
  };

  const handleBlur = () => {
    // Save on blur to context
    updateAnswer(questionIndex, answerIndex, {
      title: answerText,
      is_correct: isCorrect,
      sort_order: answerIndex,
    });
  };

  const label = String.fromCharCode(65 + answerIndex); // A, B, C, ...

  return (
    <div className="flex now-wrap items-center justify-between">
      <div className="w-6 flex flex-col items-center justify-center">
        <button type="button" title="Reorder disabled">
          <ReOrderIcon />
        </button>
      </div>

      <div className="w-12 text-left pl-2">
        <p>{label}.</p>
      </div>

      <div className="flex no-wrap items-center justify-between w-full border-2 border-gray-400 rounded-lg overflow-hidden">
        <input
          type="text"
          value={answerText}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder="Answer text"
          className="w-full h-8 bg-white p-1 focus:outline-none focus:border-blue-500 transition-colors duration-200"
        />
        <div className="flex items-center bg-white">
          <button
            type="button"
            className={`px-1 h-8 text-gray-700 border-r border-l border-gray-400 ${
              isCorrect ? 'bg-green-100' : ''
            }`}
            title="Mark as Correct"
            onClick={() => applyUpdate(true)}
          >
            <CorrectAnswerIcon />
          </button>
          <button
            type="button"
            className={`px-1 h-8 text-gray-700 ${
              !isCorrect ? 'bg-red-100' : ''
            }`}
            title="Mark as Incorrect"
            onClick={() => applyUpdate(false)}
          >
            <IncorrectAnswerIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionOption;
