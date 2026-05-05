'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type Choice = {
  id: string;
  contentId: number;
  text: string;
  correct: boolean;
};

export type Question = {
  id: string;
  contentId: number;
  type: string;
  stem: string;
  feedback: string | null;
  randomize: boolean;
  points: number;
  choices: Choice[];
};

export type QuizData = {
  id: string;
  kind: string;
  passThreshold: number;
  showFeedback: boolean;
  questions: Question[];
};

type Answer = {
  questionContentId: number;
  portalType: string;
  isCorrect: boolean;
  points: number;
  possiblePoints: number;
};

const SUBMIT_MUTATION = `
  mutation SubmitQuiz($product: String!, $quizName: String!, $answers: [QuizAnswerInput!]!) {
    submitQuiz(productSlug: $product, quizName: $quizName, answers: $answers) {
      attemptId
      percent
      passed
      passThreshold
      correctCount
      totalQuestions
    }
  }
`;

type Phase = 'answering' | 'answered' | 'submitting' | 'complete';

export default function QuizPlayer({
  quiz,
  product,
  domain,
  tgf,
  association,
  userId,
}: {
  quiz: QuizData;
  product: string;
  domain: string;
  tgf: string;
  association: string;
  userId: string | null;
}) {
  const router = useRouter();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('answering');
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const { questions } = quiz;
  const question = questions[questionIndex];
  const isLast = questionIndex === questions.length - 1;

  function handleSubmit() {
    const choice = question.choices.find((c) => c.id === selectedId);
    const isCorrect = choice?.correct ?? false;
    if (isCorrect) setCorrectCount((n) => n + 1);
    setAnswers((prev) => [
      ...prev,
      {
        questionContentId: question.contentId,
        portalType: question.type,
        isCorrect,
        points: question.points,
        possiblePoints: question.points,
      },
    ]);
    setPhase('answered');
  }

  async function handleNext() {
    if (!isLast) {
      setQuestionIndex((i) => i + 1);
      setSelectedId(null);
      setPhase('answering');
      return;
    }

    setPhase('submitting');

    if (userId) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001/graphql';
      try {
        await fetch(`${apiUrl}?association=${association}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({
            query: SUBMIT_MUTATION,
            variables: { product, quizName: quiz.id, answers },
          }),
        });
      } catch {
        // Non-critical — redirect anyway
      }
    }

    router.push(`/${product}/explore/${domain}/${tgf}/quiz/${quiz.id}/results`);
  }

  if (phase === 'submitting') {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        Saving results…
      </div>
    );
  }

  const answered = phase === 'answered';

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Question {questionIndex + 1} of {questions.length}</span>
          <span>{correctCount} correct so far</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-[var(--brand-accent)] transition-all"
            style={{ width: `${((questionIndex) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question stem */}
      <div
        className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm prose prose-sm max-w-none [&_p]:text-gray-700 [&_strong]:text-gray-900"
        dangerouslySetInnerHTML={{ __html: question.stem }}
      />

      {/* Choices */}
      <div className="flex flex-col gap-2">
        {question.choices.map((choice) => {
          let cls =
            'w-full rounded-lg border px-5 py-3 text-left text-sm transition-colors cursor-pointer';

          if (!answered) {
            cls +=
              selectedId === choice.id
                ? ' border-[var(--brand-accent)] bg-[var(--brand-accent-light)] font-medium text-[var(--brand-accent-dark)]'
                : ' border-gray-200 bg-white hover:border-[var(--brand-accent)] hover:bg-[var(--brand-accent-light)]';
          } else {
            if (choice.correct) {
              cls += ' border-green-400 bg-green-50 font-medium text-green-800';
            } else if (choice.id === selectedId) {
              cls += ' border-red-400 bg-red-50 text-red-700';
            } else {
              cls += ' border-gray-100 bg-gray-50 text-gray-400 cursor-default';
            }
          }

          return (
            <button
              key={choice.id}
              disabled={answered}
              onClick={() => setSelectedId(choice.id)}
              className={cls}
            >
              <div
                className="[&_p]:m-0 [&_div]:m-0"
                dangerouslySetInnerHTML={{ __html: choice.text }}
              />
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {answered && question.feedback && question.feedback.trim() !== '<div></div>' && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-500">
            Explanation
          </p>
          <div
            className="text-sm text-blue-900 [&_p]:m-0"
            dangerouslySetInnerHTML={{ __html: question.feedback }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {!answered ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedId}
            className="rounded-lg bg-[var(--brand-accent)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="rounded-lg bg-[var(--brand-accent)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            {isLast ? 'See Results →' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}
