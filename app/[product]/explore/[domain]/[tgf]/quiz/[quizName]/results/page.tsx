import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';

const HISTORY_QUERY = `
  query QuizHistory($product: String!, $quizName: String!) {
    quizHistory(productSlug: $product, quizName: $quizName) {
      id
      status
      creationDate
      percent
      correctCount
      totalQuestions
    }
  }
`;

type QuizAttempt = {
  id: number;
  status: string;
  creationDate: string;
  percent: number;
  correctCount: number;
  totalQuestions: number;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function QuizResultsPage({
  params,
}: {
  params: Promise<{
    product: string;
    domain: string;
    tgf: string;
    quizName: string;
  }>;
}) {
  const { product, domain, tgf, quizName } = await params;
  const [association, user] = await Promise.all([getAssociation(), currentUser()]);

  const data = await gql<{ quizHistory: QuizAttempt[] }>(
    HISTORY_QUERY,
    { product, quizName },
    association,
    user?.id,
  );

  const history = data.quizHistory ?? [];
  const latest = history[0] ?? null;
  const backHref = `/${product}/explore/${domain}/${tgf}`;
  const retakeHref = `/${product}/explore/${domain}/${tgf}/quiz/${quizName}`;

  const passed = latest?.status === 'passed';

  return (
    <main className="min-h-screen bg-[var(--brand-background)]">
      <header
        className="px-8 py-10 text-white"
        style={{ background: 'var(--brand-header-gradient)' }}
      >
        <Link
          href={backHref}
          className="text-xs text-white/60 hover:text-white uppercase tracking-widest"
        >
          ← Back to topic
        </Link>
        <h1 className="mt-3 text-3xl font-bold leading-tight">Quiz Results</h1>
      </header>

      <div className="px-8 py-10 max-w-2xl mx-auto">
        {latest ? (
          <>
            {/* Latest attempt summary */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-8 flex flex-col items-center text-center gap-4 mb-8">
              <div className="text-5xl">{passed ? '🏆' : '📚'}</div>
              <h2 className="text-2xl font-bold text-[var(--brand-accent-dark)]">
                {passed ? 'Well done!' : 'Keep studying'}
              </h2>
              <p className="text-5xl font-bold text-[var(--brand-accent)]">
                {Math.round(latest.percent)}%
              </p>
              <p className="text-gray-500">
                {latest.correctCount} of {latest.totalQuestions} correct
                {passed ? ' · Quiz passed' : ` · Pass mark not yet reached`}
              </p>

              <div className="flex gap-3 mt-2">
                <Link
                  href={backHref}
                  className="rounded-lg border border-[var(--brand-accent)] px-5 py-2.5 text-sm font-medium text-[var(--brand-accent)] hover:bg-[var(--brand-accent-light)] transition-colors"
                >
                  Back to topic
                </Link>
                {!passed && (
                  <Link
                    href={retakeHref}
                    className="rounded-lg bg-[var(--brand-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                  >
                    Try Again
                  </Link>
                )}
              </div>
            </div>

            {/* Attempt history */}
            {history.length > 1 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  Attempt History
                </h3>
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wider">
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Score</th>
                        <th className="px-5 py-3">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((attempt, i) => (
                        <tr
                          key={attempt.id}
                          className={`border-b border-gray-50 last:border-0 ${i === 0 ? 'bg-gray-50/50' : ''}`}
                        >
                          <td className="px-5 py-3 text-gray-600">
                            {formatDate(attempt.creationDate)}
                            {i === 0 && (
                              <span className="ml-2 text-xs text-gray-400">(latest)</span>
                            )}
                          </td>
                          <td className="px-5 py-3 font-medium text-gray-800">
                            {Math.round(attempt.percent)}%
                            <span className="ml-1 text-xs text-gray-400">
                              ({attempt.correctCount}/{attempt.totalQuestions})
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                attempt.status === 'passed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-600'
                              }`}
                            >
                              {attempt.status === 'passed' ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">No attempts recorded yet.</p>
            <Link
              href={retakeHref}
              className="rounded-lg bg-[var(--brand-accent)] px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Take the Quiz
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
