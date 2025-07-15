import React, { useEffect, useState } from 'react';
import {
  fetchQuizById,
  fetchQuizQuestionsByQuizId,
  type Quiz,
  type Question,
  type Answer,
} from '../../../services/quiz/quizApi';

interface QuizBlockProps {
  id: string; // quiz ID
}

const QuizBlock: React.FC<QuizBlockProps> = ({ id }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const [quizData, questionData] = await Promise.all([
          fetchQuizById(id),
          fetchQuizQuestionsByQuizId(id),
        ]);
        setQuiz(quizData);
        setQuestions(questionData);
      } catch (err) {
        setError('Failed to load quiz content');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [id]);

  if (loading)
    return <p className="px-6 py-4 text-primary">Loading quiz content...</p>;
  if (error) return <p className="px-6 py-4 text-red-500">{error}</p>;
  if (!quiz) return null;

  return (
    <div className="px-6 pb-4 text-primary text-base">
      <div className="space-y-4 mt-4">
        <div>
          <p className="text-sm font-semibold">Quiz title</p>
          <p>{quiz.title}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Description</p>
          <p>{quiz.content}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Points</p>
          <p>{quiz.points}</p>
        </div>

        {/* Questions */}
        <div>
          <p className="text-sm font-semibold">Questions</p>
          <div className="space-y-4 mt-6">
            {questions.map((q) => (
              <div
                key={q.id}
                className="border border-highlight rounded-xl p-4 bg-white shadow-sm"
              >
                <p className="text-sm font-medium">{q.title}</p>

                <div className="space-y-2 mt-2">
                  {q.answers.map((a: Answer & { isCorrect?: boolean }) => (
                    <div key={a.id} className="flex items-center gap-2 text-sm">
                      <span>{a.title}</span>
                      {a.isCorrect && (
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

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover text-sm">
            Edit
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizBlock;
