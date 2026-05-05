'use client';

import { useState } from 'react';

export type Flashcard = {
  id: string;
  term: string;
  definition: string;
};

export default function FlashcardViewer({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  if (!cards.length) {
    return <p className="text-gray-400 italic">No flashcards available.</p>;
  }

  const card = cards[index];
  const progress = Math.round((known.size / cards.length) * 100);

  function goTo(next: number) {
    setIndex(next);
    setFlipped(false);
  }

  function markKnown() {
    setKnown((prev) => new Set([...prev, index]));
    if (index < cards.length - 1) goTo(index + 1);
  }

  function markAgain() {
    setKnown((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
    if (index < cards.length - 1) goTo(index + 1);
  }

  function reset() {
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
  }

  const allDone = known.size === cards.length;

  if (allDone) {
    return (
      <div className="flex flex-col items-center gap-6 py-16">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-[var(--brand-accent-dark)]">
          All {cards.length} cards reviewed!
        </h2>
        <p className="text-gray-500">You marked all cards as known.</p>
        <button
          onClick={reset}
          className="rounded-lg bg-[var(--brand-accent)] px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Study Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress bar */}
      <div className="w-full max-w-xl">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{index + 1} of {cards.length}</span>
          <span>{known.size} known</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-[var(--brand-accent)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flip card */}
      <div
        className="w-full max-w-xl cursor-pointer select-none"
        style={{ perspective: '1200px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative"
          style={{
            height: '260px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.45s',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front — term */}
          <div
            className="absolute inset-0 rounded-2xl border border-gray-200 bg-white shadow-md flex flex-col items-center justify-center p-8 gap-3"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-accent)] opacity-60">
              Term
            </span>
            <p className="text-2xl font-semibold text-center text-[var(--brand-accent-dark)]">
              {card.term}
            </p>
            <span className="text-xs text-gray-400 mt-2">click to flip</span>
          </div>

          {/* Back — definition */}
          <div
            className="absolute inset-0 rounded-2xl border border-[var(--brand-accent-light)] bg-[var(--brand-accent-light)] shadow-md flex flex-col items-center justify-center p-8 gap-3 overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-accent)] opacity-60">
              Definition
            </span>
            <div
              className="text-base text-center text-gray-700 leading-relaxed [&_p]:m-0"
              dangerouslySetInnerHTML={{ __html: card.definition }}
            />
          </div>
        </div>
      </div>

      {/* Action buttons — visible after flip */}
      <div className={`flex gap-3 transition-opacity ${flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={markAgain}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Study Again
        </button>
        <button
          onClick={markKnown}
          className="rounded-lg bg-[var(--brand-accent)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Got It ✓
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"
        >
          ← Prev
        </button>

        {/* Dot indicators (up to 12) */}
        {cards.length <= 12 && (
          <div className="flex gap-1.5">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === index
                    ? 'bg-[var(--brand-accent)]'
                    : known.has(i)
                    ? 'bg-[var(--brand-accent)] opacity-30'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => goTo(index + 1)}
          disabled={index === cards.length - 1}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
