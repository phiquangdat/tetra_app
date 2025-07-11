import { useState, useRef } from 'react';
import QuestionForm from './QuestionForm';
import { QuizIcon, CloseIcon } from '../../common/Icons';

interface AddQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

type QuestionOption = {
  answerLabel: string;
  answerText: string;
  isCorrect: boolean;
};

type Question = {
  questionNumber: number;
  questionTitle: string;
  quizDescription: string;
  questionType: 'trueFalse' | 'multipleChoice';
  options: QuestionOption[];
};

function AddQuizModal({ isOpen, onClose, onSave }: AddQuizModalProps) {
  const [questionNumber, setQuestionNumber] = useState(1);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [points, setPoints] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const modalRef = useRef<HTMLDivElement>(null);

  const validateQuiz = () => {
    const newErrors: string[] = [];

    if (!quizTitle.trim()) {
      newErrors.push('Quiz title is required.');
    }

    if (!quizDescription.trim()) {
      newErrors.push('Quiz description is required.');
    }

    if (points <= 0) {
      newErrors.push('Points must be greater than zero.');
    }

    if (questions.length === 0) {
      newErrors.push('At least one question is required.');
    }

    return newErrors;
  };

  const handleAddQuestion = (type: 'trueFalse' | 'multipleChoice') => {
    const newQuestion: Question = {
      questionNumber: questionNumber,
      questionTitle: '',
      quizDescription: '',
      questionType: type,
      options: [],
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setQuestionNumber((prev) => prev + 1);
  };

  const handleChangepoints = (e: { target: { value: string } }) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : 0;
    setPoints(value);
  };

  const handleSave = () => {
    const validationErrors = validateQuiz();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      title: quizTitle,
      description: quizDescription,
      points: points,
      questions: questions,
    });

    setQuizTitle('');
    setQuizDescription('');
    setQuestionNumber(1);
    setPoints(0);
    setQuestions([]);
    setErrors([]);
  };

  const handleClose = () => {
    setQuizTitle('');
    setQuizDescription('');
    setQuestionNumber(1);
    setPoints(0);
    onClose();
    setQuestions([]);
    setErrors([]);
    setSelectedOption('');
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  const handleCloseQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (questions.length === 1) {
      setQuestionNumber(1);
    } else if (index < questionNumber - 1) {
      const newQuestionNumber = questionNumber - 1;
      setQuestionNumber(newQuestionNumber);
      setQuestions((prev) =>
        prev.map((q, i) => ({
          ...q,
          questionNumber: i + 1,
        })),
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-10 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="text-gray-600">
              <QuizIcon />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Quiz</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            {<CloseIcon />}
          </button>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-100 text-red-800 p-4 mb-4 rounded-lg">
            <ul className="list-disc pl-6">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col h-full">
          <div className="mb-6 max-w-110 p-6 pb-0 flex-1 overflow-y-auto">
            <label
              htmlFor="quizTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="quiz-title"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              required
            />

            <div className="max-w-110 mt-4">
              <label
                htmlFor="quizDescription"
                className="block text-sm font-medium text-gray-700 mt-4 mb-2"
              >
                Description
              </label>
              <textarea
                id="quizDescription"
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                placeholder="Enter quiz description"
                aria-label="quiz description"
                required
                rows={3}
              />
            </div>

            <div className="max-w-28 mt-4">
              <label
                htmlFor="pointsAwarded"
                className="block mb-2 font-sm text-gray-700"
              >
                Points
              </label>
              <input
                type="number"
                value={points}
                onChange={handleChangepoints}
                min={0}
                required
                className="bg-white border-gray-400 border-2 w-full rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                aria-label="points"
              />
            </div>

            <div className="w-48 mt-6 mb-11 p-2">
              <select
                value={selectedOption}
                onChange={(e) => {
                  const selectedType = e.target.value as
                    | 'trueFalse'
                    | 'multipleChoice';
                  setSelectedOption('');
                  handleAddQuestion(selectedType);
                }}
                className="w-full bg-white border-gray-400 border-2 rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-colors"
                defaultValue=""
              >
                <option value="" disabled>
                  + Add Question
                </option>
                <option value="multipleChoice">Multiple Choice</option>
                <option value="trueFalse">True/False</option>
              </select>
            </div>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <QuestionForm
                  key={index}
                  questionNumber={question.questionNumber}
                  questionType={question.questionType}
                  onClose={() => handleCloseQuestion(index)}
                />
              ))}
            </div>
          </div>
          <div className="p-6 pt-0 flex justify-end gap-4">
            <button
              type="button"
              aria-label="Save Video"
              onClick={handleSave}
              className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors duration-200 mr-4 w-24 h-10"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddQuizModal;
