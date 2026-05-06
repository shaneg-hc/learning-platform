import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';

const PRETESTS_QUERY = `
  query Pretests($product: String!) {
    pretests(productSlug: $product) {
      id
      title
    }
    userState(productSlug: $product) {
      quizPattern
      quizStatus
    }
  }
`;

type PretestMeta = { id: string; title: string };
type QuizStatusEntry = { data?: { percent?: number } };

export default async function PretestsPage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  const [association, user] = await Promise.all([getAssociation(), currentUser()]);

  const data = await gql<{
    pretests: PretestMeta[];
    userState: { quizPattern: string | null; quizStatus: Record<string, QuizStatusEntry> | null } | null;
  }>(PRETESTS_QUERY, { product }, association, user?.id);

  const pattern = data.userState?.quizPattern ?? 'cp';
  const quizStatus = data.userState?.quizStatus ?? {};

  const pretests = (data.pretests ?? []).filter((p) => p.id.endsWith(`-${pattern}`));

  return (
    <main className="min-h-screen bg-[var(--brand-background)]">
      <header
        className="px-8 py-10 text-white"
        style={{ background: 'var(--brand-header-gradient)' }}
      >
        <Link
          href={`/${product}/explore`}
          className="text-xs text-white/60 hover:text-white uppercase tracking-widest"
        >
          ← Explore
        </Link>
        <h1 className="mt-3 text-3xl font-bold">Pre-Tests</h1>
        <p className="mt-1 text-sm text-white/75">
          Assess your knowledge before you begin studying
        </p>
      </header>

      <div className="px-8 py-8 max-w-2xl space-y-4">
        {pretests.map((pretest) => {
          const status = quizStatus[pretest.id];
          const percent = status?.data?.percent ?? null;
          const attempted = percent !== null;

          return (
            <Link
              key={pretest.id}
              href={`/${product}/pretests/${pretest.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <h2 className="font-semibold text-[var(--brand-accent-dark)]">{pretest.title}</h2>
                {attempted && (
                  <p className="mt-1 text-sm text-gray-500">
                    Completed · {Math.round(percent!)}%
                  </p>
                )}
              </div>
              <span className={`ml-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                attempted
                  ? 'bg-green-100 text-green-700'
                  : 'bg-[var(--brand-accent-light)] text-[var(--brand-accent)]'
              }`}>
                {attempted ? 'Completed' : 'Begin'}
              </span>
            </Link>
          );
        })}

        {pretests.length === 0 && (
          <p className="text-gray-400 italic py-12 text-center">No pre-tests available.</p>
        )}
      </div>
    </main>
  );
}
