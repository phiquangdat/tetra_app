import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../../../context/user/QuizContext.tsx';

const QuizQuestionPage = () => {
  const { index, quizId } = useParams();
  const { questions, setUserAnswer, getUserAnswerFor } = useQuiz();
  const navigate = useNavigate();
  const currentIndex = parseInt(index || '1', 10) - 1;
  const currentQuestion = questions[currentIndex];

  // true/false => radio (single); multiple => checkbox (multi)
  const isMultiple = useMemo(
    () => (currentQuestion?.type || '').toLowerCase() === 'multiple',
    [currentQuestion?.type],
  );

  // Track UI selection as indices (so reorders still render correctly)
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  useEffect(() => {
    if (!questions.length) {
      console.warn('No questions loaded');
    }
  }, [questions]);

  useEffect(() => {
    if (!currentQuestion) return;
    const savedIds = getUserAnswerFor(currentQuestion.id) || [];
    if (savedIds.length === 0) {
      setSelectedIndices([]);
      return;
    }
    const idxs = savedIds
      .map((aid) => currentQuestion.answers.findIndex((a) => a.id === aid))
      .filter((i) => i >= 0);
    setSelectedIndices(idxs);
  }, [currentIndex, currentQuestion, getUserAnswerFor]);

  const handleChooseSingle = (answerIdx: number) => {
    if (!currentQuestion) return;
    const answerId = currentQuestion.answers[answerIdx]?.id;
    if (!answerId) return;

    setSelectedIndices([answerIdx]);
    // single-select
    setUserAnswer(currentQuestion.id, answerId, false);
  };

  const handleToggleMultiple = (answerIdx: number) => {
    if (!currentQuestion) return;
    const answerId = currentQuestion.answers[answerIdx]?.id;
    if (!answerId) return;

    setSelectedIndices((prev) => {
      const s = new Set(prev);
      if (s.has(answerIdx)) s.delete(answerIdx);
      else s.add(answerIdx);
      return Array.from(s);
    });

    // toggle-select
    setUserAnswer(currentQuestion.id, answerId, true);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      navigate(`/user/quiz/${quizId}/question/${currentIndex + 2}`);
    } else {
      navigate(`/user/quiz/${quizId}/summary`, {
        state: { quizId },
      });
    }
  };

  if (!currentQuestion)
    return <div className="text-center">Loading question...</div>;

  const nothingSelected = selectedIndices.length === 0;

  return (
    <div className="mx-auto px-4 py-12 flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-secondary font-medium text-xl tracking-wide">
          Question {currentIndex + 1} of {questions.length}
        </div>

        <div className="bg-cardBackground rounded-2xl shadow-md p-8 w-full">
          <div className="text-lg font-semibold mb-2 text-primary">
            {currentQuestion.title}
          </div>
          {isMultiple && (
            <div className="text-sm text-primary/70 mb-6">
              Select all that apply.
            </div>
          )}

          <form className="flex flex-col gap-4">
            {currentQuestion.answers.map((answer, idx) => {
              const checked = selectedIndices.includes(idx);
              const inputType = isMultiple ? 'checkbox' : 'radio';
              const onChange = isMultiple
                ? () => handleToggleMultiple(idx)
                : () => handleChooseSingle(idx);

              return (
                <label
                  key={answer.id}
                  className={`flex items-center rounded-lg border transition-colors px-4 py-3 cursor-pointer text-primary ${
                    checked
                      ? 'bg-blue-50 border-blue-400'
                      : 'bg-background border-secondary hover:bg-secondaryHover/20'
                  }`}
                >
                  <input
                    type={inputType}
                    name="quiz"
                    checked={checked}
                    onChange={onChange}
                    className="form-checkbox h-5 w-5 text-secondary border-secondary focus:ring-secondary/30 mr-4"
                  />
                  <span className="text-base leading-snug">{answer.title}</span>
                </label>
              );
            })}
          </form>
        </div>

        <div className="flex justify-between mt-8">
          {currentIndex > 0 ? (
            <button
              onClick={() => navigate(-1)}
              className="bg-secondary hover:bg-secondaryHover text-background font-medium px-8 py-2 rounded-lg text-base transition-colors duration-200"
              type="button"
            >
              Previous
            </button>
          ) : (
            <div className="px-8 py-2 invisible">Previous</div>
          )}

          <button
            onClick={handleNext}
            className={`text-background font-semibold px-8 py-2 rounded-lg text-base transition-all duration-200 ${
              !nothingSelected
                ? 'bg-surface hover:bg-surfaceHover'
                : 'bg-surface/20 cursor-not-allowed'
            }`}
            type="button"
            disabled={nothingSelected}
          >
            {currentIndex + 1 === questions.length ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionPage;
