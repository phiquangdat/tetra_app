import React, { useEffect, useState } from 'react';
import {
  type ContentBlock,
  type QuizQuestion,
  useUnitContext,
} from '../../../context/admin/UnitContext';
import {
  fetchQuizById,
  fetchQuizQuestionsByQuizId,
  type Quiz,
  type Question,
} from '../../../services/quiz/quizApi';
import ConfirmationModal from '../createModule/ConfirmationModal.tsx';
import {
  downloadFileById,
  fetchFileById,
  formatFileSize,
} from '../../../utils/fileHelpers.ts';

interface QuizBlockProps {
  unitNumber?: number;
  blockIndex?: number;
  id?: string;
}

const QuizBlock: React.FC<QuizBlockProps> = ({
  unitNumber,
  blockIndex,
  id,
}) => {
  const { getUnitState, setUnitState, setEditingBlock, removeUnitContent } =
    useUnitContext();
  const unitContent =
    unitNumber != null && blockIndex != null
      ? getUnitState(unitNumber)?.content[blockIndex]
      : null;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const shouldUseContext =
    Array.isArray(unitContent?.data?.questions) &&
    unitContent.data?.questions.length > 0;

  useEffect(() => {
    if (!shouldUseContext && id) {
      const load = async () => {
        try {
          const [qz, qs] = await Promise.all([
            fetchQuizById(id),
            fetchQuizQuestionsByQuizId(id, true),
          ]);
          setQuiz(qz);
          setQuestions(qs);

          let filePatch: Partial<ContentBlock['data']> = {};
          if (qz.attachment_id) {
            try {
              const meta = await fetchFileById(qz.attachment_id);
              filePatch = {
                fileId: qz.attachment_id,
                fileName: meta.originalName,
                fileMime: meta.mime,
                fileSize: meta.size,
              };
            } catch (e) {
              console.warn('[QuizBlock] fetchFileById failed:', e);
            }
          }

          if (unitNumber != null && blockIndex != null) {
            const unit = getUnitState(unitNumber);
            if (!unit) return;

            const updatedBlock = {
              ...unit.content[blockIndex],
              data: {
                ...unit.content[blockIndex].data,
                title: qz.title,
                content: qz.content,
                points: qz.points,
                questions: qs.map(
                  (q): QuizQuestion => ({
                    title: q.title,
                    type:
                      q.type === 'multiple choice'
                        ? 'multiple'
                        : q.type === 'true/false'
                          ? 'true/false'
                          : 'multiple',
                    sort_order: q.sort_order,
                    answers: q.answers.map((a) => ({
                      title: a.title,
                      is_correct: !!a.is_correct,
                      sort_order: a.sort_order,
                    })),
                  }),
                ),
                ...filePatch,
              },
            };

            const updatedContent = [...unit.content];
            updatedContent[blockIndex] = updatedBlock;

            setUnitState(unitNumber, {
              content: updatedContent,
            });
          }
        } catch {
          setError('Failed to load quiz');
        } finally {
          setLoading(false);
        }
      };
      load();
    } else {
      setLoading(false);
    }
  }, [shouldUseContext, id]);

  if (loading) return <p className="px-6 py-4">Loading quiz…</p>;
  if (error) return <p className="px-6 py-4 text-error">{error}</p>;

  const data = shouldUseContext
    ? unitContent!.data
    : {
        title: quiz?.title,
        content: quiz?.content,
        points: quiz?.points,
        questions,
      };

  const attachmentId = shouldUseContext
    ? unitContent?.data.fileId
    : quiz?.attachment_id;

  const onDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!attachmentId) return;
    try {
      await downloadFileById(
        attachmentId,
        (shouldUseContext ? unitContent!.data.fileName : undefined) ||
          'attachment',
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (unitNumber != null && blockIndex != null) {
      const success = await removeUnitContent(unitNumber, blockIndex);
      if (success) {
        setShowDeleteConfirm(false);
      }
    }
  };

  return (
    <div className="px-6 pb-4 text-primary text-base">
      <div className="space-y-4 mt-4">
        <div>
          <p className="text-sm font-semibold">Quiz title</p>
          <p>{data?.title}</p>
        </div>

        {/* Attachment (same simple approach as ArticleBlock) */}
        {attachmentId && (
          <div className="mt-2 mb-2">
            <p className="text-sm font-semibold">Attachment</p>
            <a
              href="#"
              onClick={onDownload}
              className="text-secondary hover:text-primary underline"
            >
              {(shouldUseContext ? unitContent!.data.fileName : undefined) ||
                'Download attachment'}
            </a>
            {shouldUseContext && unitContent!.data.fileSize ? (
              <span className="ml-2 text-xs text-secondary">
                ({formatFileSize(unitContent!.data.fileSize as number)})
              </span>
            ) : null}
          </div>
        )}

        <div>
          <p className="text-sm font-semibold">Description</p>
          <p>{data?.content}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Points</p>
          <p>{data?.points}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Questions</p>
          <div className="space-y-4 mt-6">
            {data?.questions?.map((q, i) => (
              <div
                key={i}
                className="border border-highlight rounded-xl p-4 bg-white shadow-sm"
              >
                <p className="text-sm font-medium">{q.title}</p>
                <div className="space-y-2 mt-2">
                  {q.answers.map((a) => (
                    <div
                      key={a.sort_order}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span>{a.title}</span>
                      {a.is_correct && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover text-sm"
            onClick={() => {
              if (unitNumber != null && blockIndex != null) {
                setEditingBlock({ unitNumber, blockIndex, type: 'quiz' });
              }
            }}
          >
            Edit
          </button>
          <button
            className="px-4 py-2 bg-error text-white rounded-lg hover:bg-errorHover text-sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmationModal
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Quiz"
          description="Are you sure you want to delete this quiz? This action cannot be undone."
          confirmText="Delete"
        />
      )}
    </div>
  );
};

export default QuizBlock;
