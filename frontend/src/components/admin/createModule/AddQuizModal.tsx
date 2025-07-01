import { useState } from 'react';
import QuestionForm from './QuestionForm';

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
  questionType: 'trueFalse' | 'multipleChoice';
  options: QuestionOption[];
};

function AddQuizModal({ isOpen, onClose, onSave }: AddQuizModalProps) {
  const [questionNumber, setQuestionNumber] = useState(1);
  const [quizzTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOption, setSelectedOption] = useState('');

  const handleAddQuestion = (type: 'trueFalse' | 'multipleChoice') => {
    const newQuestion: Question = {
      questionNumber: questionNumber,
      questionTitle: '',
      questionType: type,
      options: [],
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setQuestionNumber((prev) => prev + 1);
  };

  const handleSave = () => {
    if (quizzTitle.trim()) {
      onSave({
        title: quizzTitle,
        questions: questions,
      });
      setQuizTitle('');
      setQuestionNumber(1);
      setQuestions([]);
    }
  };

  const handleClose = () => {
    setQuizTitle('');
    setQuestionNumber(1);
    onClose();
    setQuestions([]);
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

  const icons = {
    quizz: (
      <svg
        className="svg-icon"
        style={{
          width: '1em',
          height: '1em',
          verticalAlign: 'middle',
          fill: 'currentColor',
          overflow: 'hidden',
        }}
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M842.472727 51.2h-665.6c-69.818182 0-130.327273 60.509091-130.327272 130.327273v665.6c0 69.818182 60.509091 130.327273 130.327272 130.327272h665.6c74.472727 0 130.327273-55.854545 130.327273-130.327272V181.527273c0-74.472727-55.854545-130.327273-130.327273-130.327273z m60.509091 791.272727c0 32.581818-23.272727 55.854545-55.854545 55.854546h-665.6c-32.581818 0-55.854545-23.272727-55.854546-55.854546V181.527273c0-32.581818 23.272727-55.854545 55.854546-55.854546h665.6c32.581818 0 55.854545 23.272727 55.854545 55.854546v660.945454z" />
        <path d="M344.436364 260.654545l-60.509091 60.509091-27.927273-27.927272c-13.963636-13.963636-37.236364-13.963636-51.2 0-18.618182 13.963636-18.618182 37.236364 0 51.2l51.2 55.854545c9.309091 9.309091 18.618182 9.309091 27.927273 9.309091 9.309091 0 18.618182-4.654545 27.927272-9.309091l83.781819-88.436364c13.963636-13.963636 13.963636-37.236364 0-51.2-13.963636-13.963636-37.236364-13.963636-51.2 0zM344.436364 446.836364l-60.509091 65.163636-32.581818-32.581818c-13.963636-13.963636-37.236364-13.963636-51.2 0s-13.963636 37.236364 0 51.2l55.854545 55.854545c9.309091 9.309091 18.618182 9.309091 27.927273 9.309091 9.309091 0 18.618182-4.654545 23.272727-9.309091l88.436364-88.436363c13.963636-13.963636 13.963636-37.236364 0-51.2-13.963636-13.963636-37.236364-13.963636-51.2 0zM344.436364 633.018182l-60.509091 65.163636-32.581818-32.581818c-13.963636-13.963636-37.236364-13.963636-51.2 0s-13.963636 37.236364 0 51.2l55.854545 55.854545c9.309091 9.309091 18.618182 9.309091 27.927273 9.309091 9.309091 0 18.618182-4.654545 23.272727-9.309091l88.436364-88.436363c13.963636-13.963636 13.963636-37.236364 0-51.2-13.963636-13.963636-37.236364-13.963636-51.2 0zM772.654545 293.236364h-297.890909c-18.618182 0-37.236364 18.618182-37.236363 37.236363s18.618182 37.236364 37.236363 37.236364h297.890909c23.272727 0 37.236364-18.618182 37.236364-37.236364s-18.618182-37.236364-37.236364-37.236363zM772.654545 479.418182h-297.890909c-18.618182 0-37.236364 18.618182-37.236363 37.236363s18.618182 37.236364 37.236363 37.236364h297.890909c23.272727 0 37.236364-18.618182 37.236364-37.236364s-18.618182-37.236364-37.236364-37.236363zM772.654545 665.6h-297.890909c-18.618182 0-37.236364 18.618182-37.236363 37.236364s18.618182 37.236364 37.236363 37.236363h297.890909c23.272727 0 37.236364-18.618182 37.236364-37.236363s-18.618182-37.236364-37.236364-37.236364z" />
      </svg>
    ),
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
      className="fixed inset-0 flex items-center justify-center z-10 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="text-gray-600">{icons.quizz}</div>
            <h2 className="text-lg font-medium text-gray-900">Quizz</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            {icons.close}
          </button>
        </div>

        <div className="flex flex-col h-full">
          <div className="mb-6 max-w-110 p-6 pb-0 flex-1 overflow-y-auto">
            <label
              htmlFor="quizzTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="quizz-title"
              value={quizzTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              required
            />

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
