import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';

const PRETEST_QUERY = `
  query PretestInstructions($product: String!, $quizName: String!) {
    quiz(productSlug: $product, quizName: $quizName) {
      id
      kind
      instructions {
        title
        begin
        done
        restart
      }
      questions { id }
    }
  }
`;

export default async function PretestInstructionsPage({
  params,
}: {
  params: Promise<{ product: string; quizName: string }>;
}) {
  const { product, quizName } = await params;
  const [association, user] = await Promise.all([getAssociation(), currentUser()]);

  const data = await gql<{
    quiz: {
      id: string;
      kind: string;
      instructions: { title: string; begin: string; done: string; restart: string } | null;
      questions: { id: string }[];
    } | null;
  }>(PRETEST_QUERY, { product, quizName }, association, user?.id);

  const quiz = data.quiz;
  const title = quiz?.instructions?.title ?? quizName;
  const beginHtml = quiz?.instructions?.begin ?? '';
  const questionCount = quiz?.questions.length ?? 0;

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
        <h1 className="mt-3 text-3xl font-bold">{title}</h1>
        {questionCount > 0 && (
          <p className="mt-1 text-sm text-white/75">{questionCount} questions</p>
        )}
      </header>

      <div className="px-8 py-10 max-w-2xl mx-auto">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-8">
          {beginHtml && beginHtml.trim() !== '<p></p>' ? (
            <div
              className="prose prose-sm max-w-none text-gray-700 [&_p]:mb-4 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: beginHtml }}
            />
          ) : (
            <p className="text-gray-500">
              This pre-test will assess your current knowledge. Answer each question to
              the best of your ability — your results will help guide your study plan.
            </p>
          )}

          <div className="mt-8 flex gap-3">
            <Link
              href={`/${product}/pretests`}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            {quiz ? (
              <Link
                href={`/${product}/pretests/${quizName}/take`}
                className="rounded-lg bg-[var(--brand-accent)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Begin Pre-Test →
              </Link>
            ) : (
              <span className="text-sm text-gray-400 italic self-center">Pre-test not found.</span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
