import React, { useEffect, useState } from 'react';
import {
  type QuizQuestion,
  useUnitContext,
} from '../../../context/admin/UnitContext';
import {
  fetchQuizById,
  fetchQuizQuestionsByQuizId,
  type Quiz,
  type Question,
} from '../../../services/quiz/quizApi';

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
  const { getUnitState, setUnitState, setEditingBlock } = useUnitContext();
  const unitContent =
    unitNumber != null && blockIndex != null
      ? getUnitState(unitNumber)?.content[blockIndex]
      : null;

  const shouldUseContext =
    Array.isArray(unitContent?.data?.questions) &&
    unitContent.data?.questions.length > 0;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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
                      is_correct: !!a.is_correct, // ← forces it to be a boolean
                      sort_order: a.sort_order,
                    })),
                  }),
                ),
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

  return (
    <div className="px-6 pb-4 text-primary text-base">
      <div className="space-y-4 mt-4">
        <div>
          <p className="text-sm font-semibold">Quiz title</p>
          <p>{data?.title}</p>
        </div>
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
          <button className="px-4 py-2 bg-error text-white rounded-lg hover:bg-errorHover text-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizBlock;
