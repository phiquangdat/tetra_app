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
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border border-highlight shadow-sm hover:shadow-md transition-all duration-200  ${
        isCorrect ? 'border-success bg-success/10' : 'border-highlight bg-white'
      }`}
    >
      <div className="flex items-center justify-center w-8 h-8">
        <button
          type="button"
          title="Reorder disabled"
          className={`${isCorrect ? 'text-surface' : 'text-secondary'} hover:text-surface p-1 `}
        >
          <ReOrderIcon />
        </button>
      </div>

      <div
        className={`flex items-center justify-center w-10 h-10 rounded-lg border border-highlight ${
          isCorrect ? 'bg-success text-white' : 'bg-highlight text-surface'
        }`}
      >
        <span className="text-sm font-semibold">{label}</span>
      </div>

      <div className="flex-1 flex items-center bg-cardBackground rounded-lg border border-highlight overflow-hidden focus-within:ring-2 focus-within:ring-surface focus-within:ring-opacity-20 transition-all duration-200">
        <input
          type="text"
          value={answerText}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder="Answer text"
          className="flex-1 h-12 px-4 placeholder:text-surface/50 focus:outline-none focus:border-surface transition-colors duration-200"
        />
      </div>

      <div className="flex items-center bg-cardBackground rounded-lg overflow-hidden border border-highlight">
        <button
          type="button"
          className={`flex items-center justify-center w-12 h-12 transition-all duration-200 border-r border-highlight ${
            isCorrect
              ? 'text-white shadow-sm bg-success'
              : 'text-secondary bg-background hover:bg-success/30 hover:text-white '
          }`}
          title="Mark as Correct"
          onClick={() => applyUpdate(true)}
        >
          <CorrectAnswerIcon />
        </button>
        <button
          type="button"
          className={`flex items-center justify-center w-12 h-12 transition-all duration-200 ${
            !isCorrect
              ? 'text-white shadow-sm bg-error'
              : 'text-secondary bg-background hover:bg-error/20 hover:text-white'
          }`}
          title="Mark as Incorrect"
          onClick={() => applyUpdate(false)}
        >
          <IncorrectAnswerIcon />
        </button>
      </div>
    </div>
  );
}

export default QuestionOption;
