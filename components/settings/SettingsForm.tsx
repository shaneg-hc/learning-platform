'use client';

import { useState } from 'react';

const UPSERT_MUTATION = `
  mutation SaveSettings($product: String!, $input: UserStateInput!) {
    upsertUserState(productSlug: $product, input: $input) {
      userId
    }
  }
`;

export type QuizPatterns = Record<string, string>;

export type SettingsValues = {
  quizPattern: string | null;
  hasExam: boolean | null;
  examdate: string | null;
  hideCountdown: boolean | null;
  alwaysResume: boolean | null;
};

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-6 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 mt-0.5 inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] ${
          checked ? 'bg-[var(--brand-accent)]' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
}

export default function SettingsForm({
  product,
  association,
  userId,
  initial,
  quizPatterns,
}: {
  product: string;
  association: string;
  userId: string;
  initial: SettingsValues;
  quizPatterns: QuizPatterns;
}) {
  const [values, setValues] = useState<SettingsValues>(initial);
  const [saved, setSaved] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const hasPatterns = Object.keys(quizPatterns).length > 0;

  function set<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave(): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001/graphql';

    const input: Record<string, unknown> = {
      hasExam: values.hasExam ?? false,
      hideCountdown: values.hideCountdown ?? false,
      alwaysResume: values.alwaysResume ?? false,
    };
    if (values.quizPattern) input.quizPattern = values.quizPattern;
    if (values.hasExam && values.examdate) input.examdate = values.examdate;
    if (!values.hasExam) input.examdate = null;

    setIsPending(true);
    try {
      await fetch(`${apiUrl}?association=${association}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ query: UPSERT_MUTATION, variables: { product, input } }),
      });
      setSaved(true);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-lg space-y-8">

      {/* Learning path */}
      {hasPatterns && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-accent)] mb-4">
            Certification Level
          </h2>
          <div className="flex flex-col gap-2">
            {Object.entries(quizPatterns).map(([key, label]) => (
              <label
                key={key}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                  values.quizPattern === key
                    ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-light)]'
                    : 'border-gray-200 bg-white hover:border-[var(--brand-accent-light)]'
                }`}
              >
                <input
                  type="radio"
                  name="quizPattern"
                  value={key}
                  checked={values.quizPattern === key}
                  onChange={() => set('quizPattern', key)}
                  className="accent-[var(--brand-accent)]"
                />
                <span className={`text-sm font-medium ${values.quizPattern === key ? 'text-[var(--brand-accent-dark)]' : 'text-gray-700'}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* Exam settings */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-accent)] mb-4">
          Exam
        </h2>
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-50">
          <div className="px-5 py-4">
            <Toggle
              label="I plan to take the exam"
              checked={values.hasExam ?? false}
              onChange={(v) => set('hasExam', v)}
            />
          </div>

          {values.hasExam && (
            <div className="px-5 py-4">
              <label className="block">
                <p className="text-sm font-medium text-gray-800 mb-1.5">Exam date</p>
                <input
                  type="date"
                  value={values.examdate ?? ''}
                  onChange={(e) => set('examdate', e.target.value || null)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
                />
              </label>
            </div>
          )}

          {values.hasExam && (
            <div className="px-5 py-4">
              <Toggle
                label="Hide exam countdown"
                description="Don't show the days-until-exam counter"
                checked={values.hideCountdown ?? false}
                onChange={(v) => set('hideCountdown', v)}
              />
            </div>
          )}
        </div>
      </section>

      {/* Study preferences */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-accent)] mb-4">
          Study Preferences
        </h2>
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="px-5 py-4">
            <Toggle
              label="Always continue where I left off"
              description="Automatically resume the last topic you were reading"
              checked={values.alwaysResume ?? false}
              onChange={(v) => set('alwaysResume', v)}
            />
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-[var(--brand-accent)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isPending ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Saved ✓</span>
        )}
      </div>
    </div>
  );
}
