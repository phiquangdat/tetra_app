import type { Question } from '../services/quiz/quizApi';
import type { UserAnswer } from '../context/user/QuizContext';

export interface QuizResults {
  correct: number;
  incorrect: number;
  percentage: number;
  pointsEarned: number;
}

export function calculateQuizResults(
  questions: Question[],
  userAnswers: UserAnswer[],
  totalPoints: number,
): QuizResults {
  const total = questions.length;
  if (total === 0) {
    return { correct: 0, incorrect: 0, percentage: 0, pointsEarned: 0 };
  }

  const answersByQ = new Map(
    userAnswers.map((a) => [a.questionId, a.answerId]),
  );

  let correct = 0;

  for (const q of questions) {
    const pickedId = answersByQ.get(q.id);
    if (!pickedId) continue;

    const picked = q.answers.find((a) => a.id === pickedId);
    if (picked?.is_correct === true) correct += 1;
  }

  const incorrect = total - correct;
  const percentage = Math.round((correct / total) * 100);

  const pointsPerQuestion = totalPoints / total;
  const pointsEarned = Math.round(pointsPerQuestion * correct);

  return { correct, incorrect, percentage, pointsEarned };
}
