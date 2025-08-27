import { useEffect, useRef, useState } from 'react';
import QuestionForm from './QuestionForm';
import { QuizIcon, CloseIcon } from '../../common/Icons';
import { useContentBlockContext } from '../../../context/admin/ContentBlockContext.tsx';
import { useUnitContext } from '../../../context/admin/UnitContext.tsx';
import { validateAttachment } from '../../../utils/validateAttachment.ts';
import {
  downloadFileById,
  formatFileSize,
} from '../../../utils/fileHelpers.ts';

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
    setSelectedFile,
    clearSelectedFile,
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

  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

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
      setFileError(null);
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
      setFileError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      clearSelectedFile();
    }
  }, [
    isOpen,
    editingBlock,
    getUnitState,
    unitId,
    unitNumber,
    getNextSortOrder,
    clearContent,
    setContentState,
    clearSelectedFile,
  ]);

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
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    clearContent();
    clearSelectedFile();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setFileError(null);
      clearSelectedFile();
      return;
    }

    const result = validateAttachment(file);

    if (result.ok) {
      setFileError(null);
      setSelectedFile(file);
    } else {
      setFileError(result.message);
      if (fileInputRef.current) fileInputRef.current.value = '';
      clearSelectedFile();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between bg-cardBackground px-8 py-4 border-b border-highlight/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-2xl shadow-sm border border-highlight/30">
              <QuizIcon color="var(--color-surface)" />
            </div>
            <h2 className="text-xl font-semibold text-primary">Add New Quiz</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-primary hover:text-secondaryHover hover:bg-cardBackground rounded-lg transition-all p-2 duration-200"
            disabled={isSaving}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {errors.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-error/5 border border-error/30 rounded-xl">
            <div className="flex gap-3 items-center">
              <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>

              <div className="flex-1 min-w-0">
                <ul className="space-y-1.5">
                  {errors.map((err, idx) => (
                    <li key={idx} className="text-sm text-red-700 flex gap-2">
                      <span className="text-red-400">•</span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setErrors([])}
                className="flex-shrink-0 text-red-400 hover:text-red-600 hover:bg-red-100/60 rounded-lg p-1.5 transition-all duration-200 -mt-0.5"
                aria-label="Dismiss errors"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            <div className="rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label
                    htmlFor="quizTitle"
                    className="block text-base font-semibold text-primary mb-2"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="quizTitle"
                    placeholder="Enter quiz title"
                    value={data.title || ''}
                    onChange={(e) =>
                      updateContentField('data', {
                        ...data,
                        title: e.target.value,
                      })
                    }
                    className="w-full max-w-md px-4 py-3 border border-primary/50 rounded-lg text-primary placeholder:text-primary/40 focus:border-2 focus:border-surface/70 outline-none transition-colors duration-200"
                    required
                  />
                </div>

                <div className="mb-6 max-w-110">
                  <label
                    htmlFor="attachment"
                    className="block text-base font-semibold text-primary mb-2 items-center gap-2"
                  >
                    Attachment
                  </label>

                  {data.fileId || data.fileName ? (
                    <div className="rounded-lg border border-highlight/60 bg-white p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-medium">
                            {data.fileName || 'attachment'}
                          </span>
                          {typeof data.fileSize === 'number' && (
                            <span className="ml-2 text-secondary">
                              ({formatFileSize(data.fileSize)})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {data.fileId && (
                            <button
                              type="button"
                              className="text-secondary hover:text-primary underline text-sm"
                              onClick={() =>
                                downloadFileById(
                                  data.fileId!,
                                  data.fileName || 'attachment',
                                )
                              }
                            >
                              Download
                            </button>
                          )}
                          <button
                            type="button"
                            className="text-sm px-3 py-1.5 rounded-md border border-primary/40 hover:bg-cardBackground"
                            onClick={() => replaceInputRef.current?.click()}
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            className="text-sm px-3 py-1.5 rounded-md border border-error/40 text-error hover:bg-error/5"
                            onClick={() => {
                              setFileError(null);
                              if (fileInputRef.current)
                                fileInputRef.current.value = '';
                              if (replaceInputRef.current)
                                replaceInputRef.current.value = '';
                              clearSelectedFile();
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      {fileError && (
                        <p
                          id="quiz-attachment-error"
                          className="text-sm text-red-500"
                          role="alert"
                          aria-live="polite"
                        >
                          {fileError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="attachment"
                        name="attachment"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                        className="w-full px-4 py-3 border border-primary/50 rounded-lg text-primary focus:border-2 focus:border-surface/70 outline-none transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-surface file:text-background file:cursor-pointer hover:file:bg-surfaceHover"
                        aria-describedby="quiz-attachment-error"
                        aria-invalid={fileError ? true : false}
                      />
                      {fileError && (
                        <p
                          id="quiz-attachment-error"
                          className="mt-2 text-sm text-red-500"
                          role="alert"
                          aria-live="polite"
                        >
                          {fileError}
                        </p>
                      )}
                    </>
                  )}

                  <input
                    ref={replaceInputRef}
                    type="file"
                    id="attachment-replace"
                    name="attachment-replace"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                    className="absolute w-px h-px -m-px p-0 overflow-hidden whitespace-nowrap border-0 opacity-0"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                </div>

                <div className="lg:col-span-2">
                  <label
                    htmlFor="quizDescription"
                    className="block text-base font-semibold text-primary mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="quizDescription"
                    value={data.content || ''}
                    onChange={handleChangeDescription}
                    className="w-full max-w-md px-4 py-3 border border-primary/50 rounded-lg text-primary placeholder:text-primary/40 focus:border-2 focus:border-surface/70 outline-none transition-colors duration-200"
                    placeholder="Enter quiz description"
                    aria-label="quiz description"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="points"
                    className="block text-base font-semibold text-primary mb-2"
                  >
                    Points
                  </label>
                  <input
                    type="text"
                    id="points"
                    value={
                      data.points !== undefined && data.points !== null
                        ? String(data.points)
                        : ''
                    }
                    onChange={handleChangePoints}
                    placeholder="Enter quiz points"
                    required
                    className="px-4 py-3 border border-primary/50 rounded-lg text-primary placeholder:text-primary/40 focus:border-2 focus:border-surface/70 outline-none transition-colors duration-200"
                    aria-label="points"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-primary mb-2">
                    Add Question
                  </label>
                  <select
                    value={selectedOption}
                    onChange={(e) => {
                      const selectedType = e.target.value as
                        | 'trueFalse'
                        | 'multipleChoice';
                      setSelectedOption('');
                      handleAddQuestion(selectedType);
                    }}
                    className="w-full max-w-md px-4 py-3 text-primary border border-primary/50 rounded-xl focus:outline-none focus:border-2 focus:border-surface/70 transition-all duration-200 cursor-pointer appearance-none"
                  >
                    <option value="" disabled>
                      + Select Question Type
                    </option>
                    <option value="multipleChoice">Multiple Choice</option>
                    <option value="trueFalse">True/False</option>
                  </select>
                </div>
              </div>
            </div>

            {(data.questions || []).length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6"></div>

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
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 px-8 py-4 border-t border-highlight bg-cardBackground flex-shrink-0">
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
