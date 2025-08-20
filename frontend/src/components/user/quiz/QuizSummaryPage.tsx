import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
// import { useUnitContent } from '../../../context/user/UnitContentContext.tsx';
import { useModuleProgress } from '../../../context/user/ModuleProgressContext';
import { CircularProgressIcon } from '../../common/Icons';
import {
  fetchQuizById,
  fetchQuizQuestionsByQuizId,
  type Question,
} from '../../../services/quiz/quizApi';
import { useQuiz } from '../../../context/user/QuizContext';
import { calculateQuizResults } from '../../../utils/quizResults';
import {
  getContentProgress,
  updateContentProgress,
} from '../../../services/userProgress/userProgressApi';

const QuizSummaryPage: React.FC = () => {
  const {
    moduleId,
    unitId,
    goToNextContent,
    isNextContent,
    finalizeUnitIfComplete,
  } = useModuleProgress();
  const { quizId } = useParams();
  // const { unitId } = useUnitContent();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>('Quiz Summary');
  const [totalPoints, setTotalPoints] = useState<number>(0);

  const [contentProgressId, setContentProgressId] = useState<string | null>(
    null,
  );
  const [contentProgressStatus, setContentProgressStatus] = useState<
    string | null
  >(null);
  const [contentProgressPoints, setContentProgressPoints] = useState<
    number | null
  >(null);

  const { userAnswers } = useQuiz();

  useEffect(() => {
    if (!quizId) {
      setLoadError('Missing quiz id');
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const quiz = await fetchQuizById(quizId);
        if (!cancelled) {
          setQuizTitle(quiz.title);
          setTotalPoints(quiz.points);
        }

        const qs = await fetchQuizQuestionsByQuizId(quizId, true);
        if (!cancelled) {
          setQuestions(qs);
          console.log('[QuizSummaryPage] fetchedQuestions:', qs);
        }

        try {
          const cp = await getContentProgress(quizId);
          if (!cancelled) {
            setContentProgressId(cp.id);
            setContentProgressStatus(cp.status);
            setContentProgressPoints(cp.points ?? 0);
          }
        } catch (e: any) {
          if (!String(e?.message ?? '').includes('404')) {
            console.warn('[QuizSummary] getContentProgress failed:', e);
          }
        }
      } catch (e: any) {
        console.error('[QuizSummary] load failed:', e);
        setLoadError(e?.message ?? 'Failed to load quiz summary data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [quizId]);

  const { correct, incorrect, percentage, pointsEarned } = useMemo(() => {
    return calculateQuizResults(questions, userAnswers, totalPoints);
  }, [questions, userAnswers, totalPoints]);

  useEffect(() => {
    if (!quizId) return;
    if (!contentProgressId) return; // No progress record id -> skip
    if (questions.length === 0) return; // Nothing to finalize

    const alreadyCompleted =
      String(contentProgressStatus || '').toUpperCase() === 'COMPLETED';
    const samePoints = (contentProgressPoints ?? 0) === pointsEarned;

    if (alreadyCompleted && samePoints) return;

    (async () => {
      try {
        await updateContentProgress(contentProgressId, {
          status: 'COMPLETED',
          points: pointsEarned,
        });
        await finalizeUnitIfComplete(unitId, moduleId);
        setContentProgressStatus('COMPLETED');
        setContentProgressPoints(pointsEarned);
      } catch (e) {
        console.error('[QuizSummary] updateContentProgress failed:', e);
      }
    })();
  }, [
    quizId,
    contentProgressId,
    contentProgressStatus,
    contentProgressPoints,
    questions.length,
    pointsEarned,
  ]);

  const summaryHeadline =
    percentage >= 90
      ? 'Outstanding! You nailed it.'
      : percentage >= 70
        ? "Well done! Here's how you did."
        : percentage >= 50
          ? 'Good effort! You covered quite a bit.'
          : 'Don’t worry! Learning takes time.';

  const correctAnswers = correct;
  const incorrectAnswers = incorrect;

  return (
    <div className="bg-white min-h-screen py-8 px-6">
      <div className="mb-4">
        <a
          onClick={() => navigate(`/user/unit/${unitId}`)}
          className="inline-flex items-center text-gray-500 hover:text-black px-3 py-1 rounded-lg hover:bg-gray-100 hover:border hover:border-gray-300 active:bg-gray-200 transition-all cursor-pointer"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Unit page
        </a>
      </div>

      {loading && (
        <div className="text-center text-sm text-gray-500 mb-4">
          Loading quiz data…
        </div>
      )}
      {loadError && (
        <div className="text-center text-sm text-red-600 mb-4">{loadError}</div>
      )}

      <h1 className="text-2xl font-semibold text-center text-primary mb-1">
        Quiz Summary
      </h1>
      <h2 className="text-4xl font-extrabold text-center text-surface mb-3">
        {quizTitle}
      </h2>
      <p className="text-center text-gray-700 mb-10">{summaryHeadline}</p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-12">
        {/* Circular progress bar */}
        <div className="relative w-32 h-32">
          <CircularProgressIcon percentage={percentage} />
          <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-surface">
            {percentage}%
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col items-center text-primary">
          <div className="flex items-center text-lg mb-2">
            <div className="flex items-center gap-2 pr-8 border-r border-highlight text-success">
              <CheckCircleIcon className="w-5 h-5" />
              <strong>{correctAnswers}</strong> correct
            </div>
            <div className="flex items-center gap-2 pl-8 text-error">
              <XCircleIcon className="w-5 h-5" />
              <strong>{incorrectAnswers}</strong> incorrect
            </div>
          </div>
          <div className="bg-accent text-white font-bold px-4 py-1 rounded-full text-center">
            +{pointsEarned} px
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-6 mb-12">
        {questions.map((q, index) => {
          const userAnswerId = userAnswers.find(
            (a) => a.questionId === q.id,
          )?.answerId;

          return (
            <div
              key={q.id}
              className="bg-[#F5F3F7] border border-gray-300 p-6 rounded-2xl shadow-sm"
            >
              <h3 className="font-semibold text-primary mb-4">
                Question {index + 1}: {q.title}
              </h3>
              <ul className="space-y-2">
                {q.answers.map((ans) => {
                  const isCorrect = ans.is_correct === true;
                  const isUserAnswer = ans.id === userAnswerId;
                  const isIncorrect = isUserAnswer && !isCorrect;
                  const isCorrectAndNotChosen = isCorrect && !isUserAnswer;

                  let icon = null;
                  if (isUserAnswer) {
                    icon = isCorrect ? (
                      <CheckCircleIcon className="w-5 h-5 text-success ml-2" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-error ml-2" />
                    );
                  }

                  let bgClass = '';
                  let textClass = '';
                  let borderClass = 'border';

                  if (isUserAnswer && isIncorrect) {
                    bgClass = 'bg-red-100';
                    textClass = 'text-error';
                    borderClass += ' border-2 border-dashed border-[#7E6BBE]';
                  } else if (isUserAnswer && isCorrect) {
                    bgClass = 'bg-green-100';
                    textClass = 'text-success';
                    borderClass += ' border-2 border-dashed border-[#7E6BBE]';
                  } else if (isCorrectAndNotChosen) {
                    bgClass = 'bg-green-100';
                    textClass = 'text-success';
                    borderClass += ' border border-success';
                  } else {
                    borderClass += ' border border-gray-300';
                  }

                  return (
                    <li
                      key={ans.id}
                      className={`flex items-center justify-between px-4 py-2 rounded-lg ${borderClass} ${bgClass} ${textClass}`}
                    >
                      {ans.title}
                      {icon}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => goToNextContent(quizId ?? '')}
          className="bg-surface hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-full shadow-md transition-all"
        >
          {isNextContent(quizId ?? '') ? 'Continue Learning' : 'Finish'}
        </button>
      </div>
    </div>
  );
};

export default QuizSummaryPage;
