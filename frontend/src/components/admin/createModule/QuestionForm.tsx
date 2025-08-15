import { useContentBlockContext } from '../../../context/admin/ContentBlockContext.tsx';
import QuestionOption from './QuestionOption';
import { CloseIcon } from '../../common/Icons';
import { useEffect } from 'react';

type Props = {
  questionNumber: number;
  questionType: 'true/false' | 'multiple';
  onClose: () => void;
  errors?: string[];
};

function QuestionForm({
  questionNumber = 1,
  questionType,
  onClose,
  errors = [],
}: Props) {
  const { data, updateQuestion } = useContentBlockContext();

  const questionIndex = questionNumber - 1;
  const question = data.questions?.[questionIndex];

  if (!question) return null;

  useEffect(() => {
    if (questionType === 'multiple' && question.answers.length === 0) {
      const defaultAnswers = [
        { title: '', is_correct: false, sort_order: 0 },
        { title: '', is_correct: false, sort_order: 1 },
      ];
      updateQuestion(questionIndex, {
        ...question,
        answers: defaultAnswers,
      });
    }
  }, [questionType, question.answers.length]);

  const handleClose = () => {
    onClose();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateQuestion(questionIndex, {
      ...question,
      title: e.target.value,
    });
  };

  const handleAddOption = () => {
    const newAnswer = {
      title: '',
      is_correct: false,
      sort_order: question.answers.length,
    };

    const updatedAnswers = [...question.answers, newAnswer];
    updateQuestion(questionIndex, {
      ...question,
      answers: updatedAnswers,
    });
  };

  const handleRemoveOption = () => {
    if (question.answers.length <= 2) return;
    const updatedAnswers = [...question.answers];
    updatedAnswers.pop();
    updateQuestion(questionIndex, {
      ...question,
      answers: updatedAnswers,
    });
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-background rounded-2xl border border-highlight shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="bg-cardBackground px-6 py-4 border-b border-highlight">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-surface justify-center text-surface w-12 h-12 rounded-xl shadow-md">
                <span className="text-white font-bold text-lg">
                  {questionNumber}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary">
                  Question {questionNumber}
                </h2>
                <p className="text-sm capitalize text-secondary">
                  {questionType.replace('/', ' / ')} Question
                </p>
              </div>
            </div>
            <button
              aria-label="Close"
              onClick={handleClose}
              className="flex items-center justify-center text-secondary w-10 h-10 rounded-lg transition-all duration-200 hover:bg-opacity-50"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="p-6">
          {errors.length > 0 && (
            <div className="mb-6 p-4 rounded-xl border border-error bg-error/10">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-error w-5 h-5 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div className="flex-1">
                  <ul className="space-y-1">
                    {errors.map((err, idx) => (
                      <li
                        key={idx}
                        className="text-error text-sm flex items-start gap-2"
                      >
                        <span className="text-error">•</span>
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <label
              htmlFor={`quizTitle-${questionNumber}`}
              className="text-primary block text-sm font-medium mb-3"
            >
              Question Title
            </label>
            <div className="relative">
              <textarea
                name={`quizTitle-${questionNumber}`}
                id={`quizTitle-${questionNumber}`}
                value={question.title || ''}
                placeholder="Enter question here"
                className="w-full h-32 p-4 bg-cardBackground border border-highlight text-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-surface focus:ring-opacity-20 transition-all duration-200 resize-none"
                onChange={handleTitleChange}
              />
            </div>
          </div>

          {questionType === 'true/false' && (
            <div className="space-y-4">
              <QuestionOption questionIndex={questionIndex} answerIndex={0} />
              <QuestionOption questionIndex={questionIndex} answerIndex={1} />
            </div>
          )}

          {questionType === 'multiple' && (
            <div>
              <div className="flex items-center justify-end mb-6">
                <div className="flex items-center gap-3">
                  <button
                    className="text-surface bg-cardBackground inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-highlight rounded-lg focus:outline-none focus:ring-2 focus:ring-surface focus:ring-opacity-20 transition-all duration-200"
                    onClick={handleAddOption}
                  >
                    Add Option
                  </button>
                  <button
                    className="inline-flex items-center bg-error/5 text-error gap-2 px-4 py-2 text-sm font-medium border border-error/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-error focus:ring-opacity-20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleRemoveOption}
                    disabled={question.answers.length <= 2}
                  >
                    Remove Option
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {question.answers.map((_, index) => (
                  <QuestionOption
                    key={index}
                    questionIndex={questionIndex}
                    answerIndex={index}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionForm;
