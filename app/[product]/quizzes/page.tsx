import { Fragment } from 'react';
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';

const QUIZ_REPORT_QUERY = `
  query QuizReport($product: String!) {
    quizReport(productSlug: $product) {
      name
      title
      tgfs {
        name
        title
        quizNames
        groups {
          name
          title
          quizNames
        }
      }
    }
    userState(productSlug: $product) {
      quizPattern
      quizStatus
    }
  }
`;

type QuizReportGroup = { name: string; title: string | null; quizNames: string[] };
type QuizReportTGF   = { name: string; title: string | null; quizNames: string[]; groups: QuizReportGroup[] };
type QuizReportDomain = { name: string; title: string | null; tgfs: QuizReportTGF[] };
type QuizStatusEntry  = { data?: { percent?: number } };
type QuizStatus = Record<string, QuizStatusEntry>;

function QuizBadge({
  quizNames,
  pattern,
  quizStatus,
  product,
  domain,
  tgf,
  quizName: overrideName,
}: {
  quizNames: string[];
  pattern: string;
  quizStatus: QuizStatus;
  product: string;
  domain: string;
  tgf: string;
  quizName?: string;
}) {
  const name = overrideName ?? quizNames.find((n) => n.endsWith(`-${pattern}`) || !n.match(/-(cp|scp)$/));
  if (!name) return <span className="text-xs text-gray-300">—</span>;

  const entry = quizStatus[name];
  const percent = entry?.data?.percent ?? null;
  const passed = percent === 100;
  const attempted = percent !== null && percent < 100;

  return (
    <Link
      href={`/${product}/explore/${domain}/${tgf}/quiz/${name}`}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 ${
        passed
          ? 'bg-green-100 text-green-700'
          : attempted
          ? 'bg-amber-100 text-amber-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {passed ? '✓ Passed' : attempted ? `${Math.round(percent!)}%` : 'Not attempted'}
    </Link>
  );
}

export default async function QuizzesPage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  const [association, user] = await Promise.all([getAssociation(), currentUser()]);

  const data = await gql<{
    quizReport: QuizReportDomain[];
    userState: { quizPattern: string | null; quizStatus: QuizStatus | null } | null;
  }>(QUIZ_REPORT_QUERY, { product }, association, user?.id);

  const domains = data.quizReport;
  const pattern = data.userState?.quizPattern ?? 'cp';
  const quizStatus: QuizStatus = (data.userState?.quizStatus as QuizStatus) ?? {};

  // Summary counts
  const allQuizNames = domains.flatMap((d) =>
    d.tgfs.flatMap((t) => [
      ...t.quizNames.filter((n) => n.endsWith(`-${pattern}`)),
      ...t.groups.flatMap((g) => g.quizNames.filter((n) => n.endsWith(`-${pattern}`))),
    ]),
  );
  const passedCount = allQuizNames.filter((n) => quizStatus[n]?.data?.percent === 100).length;
  const attemptedCount = allQuizNames.filter(
    (n) => quizStatus[n]?.data?.percent !== undefined && quizStatus[n]?.data?.percent !== 100,
  ).length;

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
        <h1 className="mt-3 text-3xl font-bold">Quiz Progress</h1>
        <p className="mt-2 text-sm text-white/75">
          {passedCount} of {allQuizNames.length} quizzes passed
          {attemptedCount > 0 && ` · ${attemptedCount} in progress`}
        </p>
      </header>

      <div className="px-8 py-8 max-w-4xl space-y-10">
        {domains.map((domain) => (
          <section key={domain.name}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-accent)] mb-4">
              {domain.title ?? domain.name}
            </h2>

            <div className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-2.5 text-left font-medium">Topic</th>
                    <th className="px-5 py-2.5 text-right font-medium">Quiz</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {domain.tgfs.map((tgf) => (
                    <Fragment key={tgf.name}>
                      {/* TGF row */}
                      <tr key={tgf.name} className="bg-[var(--brand-accent-light)]/30">
                        <td className="px-5 py-3 font-semibold text-[var(--brand-accent-dark)]">
                          <Link
                            href={`/${product}/explore/${domain.name}/${tgf.name}`}
                            className="hover:underline"
                          >
                            {tgf.title ?? tgf.name}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {tgf.quizNames.length > 0 ? (
                            <QuizBadge
                              quizNames={tgf.quizNames}
                              pattern={pattern}
                              quizStatus={quizStatus}
                              product={product}
                              domain={domain.name}
                              tgf={tgf.name}
                            />
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      </tr>

                      {/* Group rows */}
                      {tgf.groups.map((group) => (
                        <tr key={group.name} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3 pl-10 text-gray-700">
                            <Link
                              href={`/${product}/explore/${domain.name}/${tgf.name}/${group.name}`}
                              className="hover:underline"
                            >
                              {group.title ?? group.name}
                            </Link>
                          </td>
                          <td className="px-5 py-3 text-right">
                            {group.quizNames.length > 0 ? (
                              <QuizBadge
                                quizNames={group.quizNames}
                                pattern={pattern}
                                quizStatus={quizStatus}
                                product={product}
                                domain={domain.name}
                                tgf={tgf.name}
                              />
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
