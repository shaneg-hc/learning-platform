import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';

const PRETEST_RESULTS_QUERY = `
  query PretestResults($product: String!, $quizName: String!) {
    quiz(productSlug: $product, quizName: $quizName) {
      id
      instructions {
        title
        done
      }
    }
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

export default async function PretestResultsPage({
  params,
}: {
  params: Promise<{ product: string; quizName: string }>;
}) {
  const { product, quizName } = await params;
  const [association, user] = await Promise.all([getAssociation(), currentUser()]);

  const data = await gql<{
    quiz: { id: string; instructions: { title: string; done: string } | null } | null;
    quizHistory: QuizAttempt[];
  }>(PRETEST_RESULTS_QUERY, { product, quizName }, association, user?.id);

  const title = data.quiz?.instructions?.title ?? quizName;
  const doneHtml = data.quiz?.instructions?.done ?? '';
  const history = data.quizHistory ?? [];
  const latest = history[0] ?? null;

  return (
    <main className="min-h-screen bg-[var(--brand-background)]">
      <header
        className="px-8 py-10 text-white"
        style={{ background: 'var(--brand-header-gradient)' }}
      >
        <Link
          href={`/${product}/pretests`}
          className="text-xs text-white/60 hover:text-white uppercase tracking-widest"
        >
          ← Pre-Tests
        </Link>
        <h1 className="mt-3 text-3xl font-bold">{title} — Results</h1>
      </header>

      <div className="px-8 py-10 max-w-2xl mx-auto space-y-6">
        {latest ? (
          <>
            {/* Score card */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-8 flex flex-col items-center text-center gap-4">
              <p className="text-5xl font-bold text-[var(--brand-accent)]">
                {Math.round(latest.percent)}%
              </p>
              <p className="text-gray-500">
                {latest.correctCount} of {latest.totalQuestions} correct
              </p>

              <div className="flex gap-3 mt-2">
                <Link
                  href={`/${product}/explore`}
                  className="rounded-lg bg-[var(--brand-accent)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  Start Studying
                </Link>
                <Link
                  href={`/${product}/pretests`}
                  className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  All Pre-Tests
                </Link>
              </div>
            </div>

            {/* Completion text from CMS */}
            {doneHtml && doneHtml.trim() !== '<p></p>' && (
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div
                  className="prose prose-sm max-w-none text-gray-700 [&_p]:mb-3 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: doneHtml }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">No results recorded yet.</p>
            <Link
              href={`/${product}/pretests/${quizName}/take`}
              className="rounded-lg bg-[var(--brand-accent)] px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Take the Pre-Test
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
