'use client';

import { useState } from 'react';

export type Choice = {
  id: string;
  text: string;
  correct: boolean;
};

export type Question = {
  id: string;
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

type Phase = 'answering' | 'answered' | 'complete';

export default function QuizPlayer({ quiz }: { quiz: QuizData }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('answering');
  const [correctCount, setCorrectCount] = useState(0);

  const { questions, passThreshold } = quiz;
  const question = questions[questionIndex];
  const isLast = questionIndex === questions.length - 1;

  function handleSubmit() {
    const choice = question.choices.find((c) => c.id === selectedId);
    if (choice?.correct) setCorrectCount((n) => n + 1);
    setPhase('answered');
  }

  function handleNext() {
    if (isLast) {
      setPhase('complete');
    } else {
      setQuestionIndex((i) => i + 1);
      setSelectedId(null);
      setPhase('answering');
    }
  }

  if (phase === 'complete') {
    const pct = Math.round((correctCount / questions.length) * 100);
    const passed = pct >= passThreshold;
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="text-5xl">{passed ? '🏆' : '📚'}</div>
        <h2 className="text-2xl font-bold text-[var(--brand-accent-dark)]">
          {passed ? 'Well done!' : 'Keep studying'}
        </h2>
        <p className="text-4xl font-bold text-[var(--brand-accent)]">{pct}%</p>
        <p className="text-gray-500">
          {correctCount} of {questions.length} correct · pass mark {passThreshold}%
        </p>
        <button
          onClick={() => {
            setQuestionIndex(0);
            setSelectedId(null);
            setPhase('answering');
            setCorrectCount(0);
          }}
          className="mt-4 rounded-lg bg-[var(--brand-accent)] px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
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
