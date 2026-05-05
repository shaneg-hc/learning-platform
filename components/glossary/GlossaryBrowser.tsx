'use client';

import { useMemo, useRef, useState } from 'react';

export type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
};

type Group = { letter: string; terms: GlossaryTerm[] };

function groupByLetter(terms: GlossaryTerm[]): Group[] {
  const map = new Map<string, GlossaryTerm[]>();
  for (const term of terms) {
    const first = term.term[0]?.toUpperCase() ?? '#';
    const key = /[A-Z]/.test(first) ? first : '#';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(term);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => {
      if (a === '#') return -1;
      if (b === '#') return 1;
      return a.localeCompare(b);
    })
    .map(([letter, terms]) => ({ letter, terms }));
}

export default function GlossaryBrowser({ terms }: { terms: GlossaryTerm[] }) {
  const [query, setQuery] = useState('');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const filtered = useMemo(() => {
    if (!query.trim()) return terms;
    const q = query.toLowerCase();
    return terms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q),
    );
  }, [query, terms]);

  const groups = useMemo(() => groupByLetter(filtered), [filtered]);
  const activeLetters = new Set(groups.map((g) => g.letter));
  const allLetters = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  function scrollTo(letter: string) {
    sectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms or definitions…"
          className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm shadow-sm outline-none focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent)]/20 transition"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Result count when searching */}
      {query && (
        <p className="text-sm text-gray-500">
          {filtered.length === 0
            ? 'No terms found'
            : `${filtered.length} term${filtered.length !== 1 ? 's' : ''} matching "${query}"`}
        </p>
      )}

      {/* A–Z jump bar */}
      {!query && (
        <div className="flex flex-wrap gap-1">
          {allLetters.map((letter) => (
            <button
              key={letter}
              onClick={() => activeLetters.has(letter) && scrollTo(letter)}
              disabled={!activeLetters.has(letter)}
              className={`h-8 w-8 rounded text-xs font-semibold transition-colors ${
                activeLetters.has(letter)
                  ? 'bg-[var(--brand-accent-light)] text-[var(--brand-accent)] hover:bg-[var(--brand-accent)] hover:text-white'
                  : 'text-gray-300 cursor-default'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {/* Term groups */}
      {groups.length === 0 ? (
        <p className="text-gray-400 italic py-12 text-center">No terms found.</p>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section
              key={group.letter}
              ref={(el) => { sectionRefs.current[group.letter] = el; }}
              className="scroll-mt-6"
            >
              <div className="sticky top-0 z-10 bg-[var(--brand-background)] py-2">
                <h2 className="text-lg font-bold text-[var(--brand-accent)]">
                  {group.letter}
                </h2>
                <div className="h-px bg-[var(--brand-accent-light)] mt-1" />
              </div>

              <dl className="mt-3 divide-y divide-gray-100">
                {group.terms.map((term) => (
                  <div key={term.id} className="py-4 sm:grid sm:grid-cols-5 sm:gap-6">
                    <dt className="text-sm font-semibold text-[var(--brand-accent-dark)] sm:col-span-1 mb-1 sm:mb-0">
                      <HighlightedText text={term.term} query={query} />
                    </dt>
                    <dd className="sm:col-span-4">
                      <div
                        className="text-sm text-gray-600 leading-relaxed [&_p]:m-0"
                        dangerouslySetInnerHTML={{ __html: term.definition }}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-inherit rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
