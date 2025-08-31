import type { Question } from '../services/quiz/quizApi';
import type { UserAnswer } from '../context/user/QuizContext';

export interface QuestionScore {
  questionId: string;
  fraction: number;
}

export interface QuizResults {
  correct: number;
  partial: number;
  incorrect: number;
  percentage: number;
  pointsEarned: number;
  perQuestion: QuestionScore[];
}

export function calculateQuizResults(
  questions: Question[],
  userAnswers: UserAnswer[],
  totalPoints: number,
): QuizResults {
  const total = questions.length;
  if (total === 0) {
    return {
      correct: 0,
      partial: 0,
      incorrect: 0,
      percentage: 0,
      pointsEarned: 0,
      perQuestion: [],
    };
  }

  const answersByQ = new Map<string, string[]>(
    userAnswers.map((a) => [a.questionId, a.answerIds]),
  );

  const perQuestion: QuestionScore[] = [];

  for (const q of questions) {
    const picked = new Set(answersByQ.get(q.id) || []);
    const correctIds = q.answers.filter((a) => a.is_correct).map((a) => a.id);
    const correctSet = new Set(correctIds);

    if (correctSet.size === 0) {
      const fraction = picked.size === 0 ? 1 : 0;
      perQuestion.push({ questionId: q.id, fraction });
      continue;
    }

    const numCorrectChosen = Array.from(picked).filter((id) =>
      correctSet.has(id),
    ).length;

    const fraction =
      numCorrectChosen === 0 ? 0 : numCorrectChosen / correctSet.size; // proportional credit

    perQuestion.push({ questionId: q.id, fraction });
  }

  const sumFractions = perQuestion.reduce((s, q) => s + q.fraction, 0);
  const correct = perQuestion.filter((q) => q.fraction === 1).length;
  const partial = perQuestion.filter(
    (q) => q.fraction > 0 && q.fraction < 1,
  ).length;
  const incorrect = perQuestion.filter((q) => q.fraction === 0).length;

  const percentage = Math.round((sumFractions / total) * 100);
  const pointsEarned = Math.round((totalPoints * sumFractions) / total);

  return { correct, partial, incorrect, percentage, pointsEarned, perQuestion };
}
