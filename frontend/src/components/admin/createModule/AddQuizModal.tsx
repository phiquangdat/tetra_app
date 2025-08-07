import { useEffect, useRef, useState } from 'react';
import QuestionForm from './QuestionForm';
import { QuizIcon, CloseIcon } from '../../common/Icons';
import { useContentBlockContext } from '../../../context/admin/ContentBlockContext.tsx';
import { useUnitContext } from '../../../context/admin/UnitContext.tsx';

interface AddQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitId: string;
  unitNumber: number;
}

function AddQuizModal({
  isOpen,
  onClose,
  unitId,
  unitNumber,
}: AddQuizModalProps) {
  const {
    data,
    updateContentField,
    saveContent,
    isSaving,
    clearContent,
    setContentState,
  } = useContentBlockContext();

  const {
    addContentBlock,
    editingBlock,
    setEditingBlock,
    getUnitState,
    updateUnitField,
    getNextSortOrder,
  } = useUnitContext();

  const [selectedOption, setSelectedOption] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [questionErrors, setQuestionErrors] = useState<
    Record<number, string[]>
  >({});

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const block =
      editingBlock?.unitNumber === unitNumber && editingBlock.blockIndex != null
        ? getUnitState(unitNumber)?.content[editingBlock.blockIndex]
        : null;

    if (block && block.type === 'quiz') {
      setContentState({
        ...block,
        isDirty: false,
        isSaving: false,
        error: null,
      });
    } else {
      const nextSortOrder = getNextSortOrder(unitNumber);
      clearContent();
      setContentState({
        unit_id: unitId,
        type: 'quiz',
        sortOrder: nextSortOrder,
        isDirty: true,
        isSaving: false,
        error: null,
      });
    }
  }, [isOpen]);

  const validateQuiz = () => {
    const newErrors: string[] = [];
    const newQuestionErrors: Record<number, string[]> = {};

    if (!data.title?.trim()) newErrors.push('Quiz title is required.');
    if (!data.content?.trim()) newErrors.push('Quiz description is required.');

    const pointsValue = data.points;
    const pointsStr = String(
      pointsValue !== undefined && pointsValue !== null ? pointsValue : '',
    ).trim();

    if (pointsStr === '' || isNaN(Number(pointsStr))) {
      newErrors.push('Points is required and must be a number.');
    }

    const questions = data.questions || [];
    if (questions.length === 0) {
      newErrors.push('At least one question is required.');
    }

    questions.forEach((q, index) => {
      const questionErrs: string[] = [];

      if (!q.title?.trim()) {
        questionErrs.push('Question title is required.');
      }

      if (!q.answers || q.answers.length < 2) {
        questionErrs.push('At least 2 answer choices are required.');
      } else {
        const hasEmptyAnswer = q.answers.some((a) => !a.title?.trim());
        if (hasEmptyAnswer) {
          questionErrs.push('All answer choices must have a title.');
        }

        const hasCorrect = q.answers.some((a) => a.is_correct);
        if (!hasCorrect) {
          questionErrs.push('One correct answer must be selected.');
        }

        if (q.type === 'true/false') {
          const correctCount = q.answers.filter((a) => a.is_correct).length;
          if (correctCount !== 1) {
            questionErrs.push(
              'True/False questions must have exactly one correct answer.',
            );
          }
        }
      }

      if (questionErrs.length > 0) {
        newQuestionErrors[index] = questionErrs;
      }
    });

    setQuestionErrors(newQuestionErrors);

    if (Object.keys(newQuestionErrors).length > 0) {
      newErrors.push('There are errors in some questions.');
    }

    return newErrors;
  };

  const handleAddQuestion = (type: 'trueFalse' | 'multipleChoice') => {
    const currentQuestions = data.questions || [];

    const newQuestion = {
      title: '',
      type: type === 'trueFalse' ? 'true/false' : 'multiple',
      sort_order: currentQuestions.length + 1,
      answers: [],
    };

    updateContentField('data', {
      ...data,
      questions: [...currentQuestions, newQuestion],
    });
  };

  const handleChangePoints = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      updateContentField('data', { ...data, points: '' });
      return;
    }

    if (/^\d+$/.test(value)) {
      const numValue = parseInt(value, 10);
      updateContentField('data', { ...data, points: numValue });
    }
  };

  const handleChangeDescription = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    updateContentField('data', { ...data, content: e.target.value });
  };

  const handleSave = async () => {
    const validationErrors = validateQuiz();

    if (validationErrors.length > 0) {
      console.warn('[AddQuizModal] Validation failed', validationErrors);
      setErrors(validationErrors);
      return;
    }

    try {
      const savedBlock = await saveContent('quiz');
      if (!savedBlock) return;

      if (editingBlock) {
        const currentContent = getUnitState(unitNumber)?.content ?? [];
        const newBlocks = [...currentContent];
        newBlocks[editingBlock.blockIndex] = savedBlock;
        updateUnitField(unitNumber, 'content', newBlocks);
      } else {
        addContentBlock(unitNumber, savedBlock);
      }

      setErrors([]);
      setQuestionErrors({});
      clearContent();
      setEditingBlock(null);
      onClose();
    } catch (error) {
      console.error('Error saving quiz:', error);
      setErrors(['Failed to save quiz. Please try again later.']);
    }
  };

  const handleClose = () => {
    setErrors([]);
    setQuestionErrors({});
    clearContent();
    setEditingBlock(null);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  const handleCloseQuestion = (index: number) => {
    const currentQuestions = data.questions || [];

    const updatedQuestions = currentQuestions
      .filter((_, i) => i !== index)
      .map((q, i) => ({
        ...q,
        sort_order: i + 1,
      }));

    updateContentField('data', {
      ...data,
      questions: updatedQuestions,
    });

    // Remove the errors for the removed question
    const updatedErrors = { ...questionErrors };
    delete updatedErrors[index];
    setQuestionErrors(updatedErrors);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-background rounded-2xl shadow-2xl w-1/2 max-w-4xl overflow-hidden"
      >
        <div className="flex items-center justify-between bg-cardBackground px-8 py-4 border-b border-highlight/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-2xl shadow-sm border border-highlight/30">
              <QuizIcon color="var(--color-surface)" />
            </div>
            <h2 className="text-xl font-semibold text-primary">Add New Quiz</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-primary hover:text-secondaryHover transition-colors p-2 rounded-lg hover:bg-cardBackground"
            disabled={isSaving}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-100 text-red-800 p-4 mb-4 rounded-lg mx-6">
            <ul className="list-disc pl-6">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col h-full max-h-[70vh] overflow-hidden">
          <div className="mb-6 max-w-110 p-6 pb-0 flex-1 overflow-y-auto">
            <label
              htmlFor="quizTitle"
              className="block text-base font-semibold text-primary mb-2 flex items-center gap-2"
            >
              Title
            </label>
            <input
              type="text"
              id="quizTitle"
              placeholder="Enter quiz title"
              value={data.title || ''}
              onChange={(e) =>
                updateContentField('data', { ...data, title: e.target.value })
              }
              className="w-full px-4 py-3 border border-primary/50 rounded-lg text-primary placeholder:text-primary/40 focus:border-2 focus:border-surface/70 outline-none transition-colors duration-200"
              required
            />

            <div className="max-w-110 mt-4">
              <label
                htmlFor="quizDescription"
                className="block text-base font-semibold text-primary mb-2 flex items-center gap-2"
              >
                Description
              </label>
              <textarea
                id="quizDescription"
                value={data.content || ''}
                onChange={handleChangeDescription}
                className="w-full px-4 py-3 border border-primary/50 rounded-lg text-primary placeholder:text-primary/40 focus:border-2 focus:border-surface/70 outline-none transition-colors duration-200"
                placeholder="Enter quiz description"
                aria-label="quiz description"
                required
                rows={3}
              />
            </div>

            <div className="max-w-28 mt-4">
              <label
                htmlFor="points"
                className="block text-base font-semibold text-primary mb-2 flex items-center gap-2"
              >
                Points
              </label>
              <input
                type="text"
                value={
                  data.points !== undefined && data.points !== null
                    ? String(data.points)
                    : ''
                }
                onChange={handleChangePoints}
                required
                className="w-full px-4 py-3 border border-primary/50 rounded-lg text-primary placeholder:text-primary/40 focus:border-2 focus:border-surface/70 outline-none transition-colors duration-200"
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
                className="w-full bg-background border-primary/50 border-2 rounded-xl p-2 focus:outline-none focus:border-2 focus:border-surface/70 transition-colors"
              >
                <option value="" disabled>
                  + Add Question
                </option>
                <option value="multipleChoice">Multiple Choice</option>
                <option value="trueFalse">True/False</option>
              </select>
            </div>

            <div className="space-y-6">
              {(data.questions || []).map((question, index) => (
                <QuestionForm
                  key={index}
                  questionNumber={index + 1}
                  questionType={question.type}
                  onClose={() => handleCloseQuestion(index)}
                  errors={questionErrors[index] || []}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 px-8 py-4 border-t border-highlight bg-cardBackground">
          <button
            type="button"
            onClick={handleClose}
            className="bg-secondary hover:bg-secondaryHover text-background px-6 py-2.5 rounded-lg text-sm font-medium transition duration-200"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            aria-label="Save Quiz"
            onClick={handleSave}
            className="bg-surface hover:bg-surfaceHover text-background px-6 py-2.5 rounded-lg text-sm font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddQuizModal;
