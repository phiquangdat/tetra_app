import { useContentBlockContext } from '../../../context/admin/ContentBlockContext.tsx';
import QuestionOption from './QuestionOption';
import { CloseIcon } from '../../common/Icons';

type Props = {
  questionNumber: number;
  questionType: 'true/false' | 'multiple';
  onClose: () => void;
};

function QuestionForm({ questionNumber = 1, questionType, onClose }: Props) {
  const { data, updateQuestion } = useContentBlockContext();

  const questionIndex = questionNumber - 1;
  const question = data.questions?.[questionIndex];

  if (!question) return null;

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
    if (question.answers.length === 0) return;
    const updatedAnswers = [...question.answers];
    updatedAnswers.pop();
    updateQuestion(questionIndex, {
      ...question,
      answers: updatedAnswers,
    });
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
          <CloseIcon />
        </button>
      </div>

      <h2 className="text-lg text-gray-700 mb-4">Question {questionNumber}</h2>
      <textarea
        name="quizTitle"
        id="quizTitle"
        value={question.title || ''}
        className="bg-white border-gray-400 border-1 w-full h-32 rounded-lg p-2 mb-6 focus:outline-none focus:border-blue-500 transition-colors duration-200"
        style={{ resize: 'none' }}
        onChange={handleTitleChange}
      />

      {questionType === 'true/false' && (
        <div className="space-y-2 mb-6">
          <QuestionOption questionIndex={questionIndex} answerIndex={0} />
          <QuestionOption questionIndex={questionIndex} answerIndex={1} />
        </div>
      )}

      {questionType === 'multiple' && (
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
              onClick={handleRemoveOption}
              disabled={question.answers.length === 0}
            >
              <span className="text-xl pb-1">-</span>Remove Option
            </button>
          </div>
          <div className="space-y-2">
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
  );
}

export default QuestionForm;
