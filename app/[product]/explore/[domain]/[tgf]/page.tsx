import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';

const TGF_QUERY = `
  query TGFOutline($product: String!, $domain: String!, $tgf: String!) {
    tgf(productSlug: $product, domainName: $domain, tgfName: $tgf) {
      name
      title
      shortdesc
      quizNames
      hasFlashcards
      groups {
        id
        title
        topics {
          id
          title
          shortdesc
          readtime
        }
      }
    }
    userState(productSlug: $product) {
      quizPattern
      status
    }
  }
`;

type TopicItem = {
  id: string;
  title: string;
  shortdesc: string | null;
  readtime: number | null;
};

type TopicGroup = {
  id: string;
  title: string | null;
  topics: TopicItem[];
};

type TGFOutline = {
  name: string;
  title: string | null;
  shortdesc: string | null;
  quizNames: string[];
  hasFlashcards: boolean;
  groups: TopicGroup[];
};

type TopicProgress = Record<string, { data: { percent: number } }>;
type UserStateData = { quizPattern: string | null; status: TopicProgress };

export default async function TGFPage({
  params,
}: {
  params: Promise<{ product: string; domain: string; tgf: string }>;
}) {
  const { product, domain, tgf } = await params;
  const [association, user] = await Promise.all([getAssociation(), currentUser()]);

  const data = await gql<{ tgf: TGFOutline | null; userState: UserStateData | null }>(
    TGF_QUERY,
    { product, domain, tgf },
    association,
    user?.id,
  );

  const outline = data.tgf;
  const quizPattern = data.userState?.quizPattern ?? 'cp';
  const topicProgress: TopicProgress = data.userState?.status ?? {};
  if (!outline) {
    return (
      <main className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center">
        <p className="text-gray-500">Topic not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--brand-background)]">
      <header
        className="px-8 py-10 text-white"
        style={{
          background:
            'var(--brand-header-gradient)',
        }}
      >
        <Link
          href={`/${product}/explore`}
          className="text-xs text-white/60 hover:text-white uppercase tracking-widest"
        >
          ← Explore
        </Link>
        <h1 className="mt-3 text-3xl font-bold leading-tight">
          {outline.title ?? outline.name}
        </h1>
        {outline.shortdesc && (
          <p className="mt-2 max-w-2xl text-sm text-white/85 leading-relaxed">
            {outline.shortdesc}
          </p>
        )}
      </header>

      {(outline.hasFlashcards || outline.quizNames.length > 0) && (
        <div className="px-8 py-4 max-w-4xl flex flex-wrap gap-3 border-b border-gray-100">
          {outline.hasFlashcards && (
            <Link
              href={`/${product}/explore/${domain}/${tgf}/flashcards`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--brand-accent)] px-4 py-2 text-sm font-medium text-[var(--brand-accent)] hover:bg-[var(--brand-accent-light)] transition-colors"
            >
              <span>🃏</span> Practice Flashcards
            </Link>
          )}
          {outline.quizNames.filter((n) => n.endsWith(`-${quizPattern}`) || !n.match(/-(cp|scp)$/)).map((quizName) => (
            <div key={quizName} className="inline-flex items-center gap-2">
              <Link
                href={`/${product}/explore/${domain}/${tgf}/quiz/${quizName}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                <span>✏️</span> Take Quiz
              </Link>
              <Link
                href={`/${product}/explore/${domain}/${tgf}/quiz/${quizName}/results`}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Results
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="px-8 py-8 space-y-8 max-w-4xl">
        {outline.groups.map((group) => {
          const readCount = group.topics.filter(
            (t) => (topicProgress[t.id]?.data?.percent ?? 0) >= 100,
          ).length;
          const allRead = readCount === group.topics.length;

          return (
            <section key={group.id}>
              {group.title && (
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-accent)]">
                    {group.title}
                  </h2>
                  {readCount > 0 && (
                    <span className={`text-xs font-medium ${allRead ? 'text-green-600' : 'text-gray-400'}`}>
                      {allRead ? '✓ Complete' : `${readCount} / ${group.topics.length} read`}
                    </span>
                  )}
                </div>
              )}
              <ul className="space-y-2">
                {group.topics.map((topic) => {
                  const isRead = (topicProgress[topic.id]?.data?.percent ?? 0) >= 100;
                  return (
                    <li key={topic.id}>
                      <Link
                        href={`/${product}/explore/${domain}/${tgf}/${topic.id}`}
                        className="group flex items-start gap-4 rounded-lg bg-white border border-gray-100 px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium group-hover:underline ${isRead ? 'text-gray-400' : 'text-[var(--brand-accent-dark)]'}`}>
                            {topic.title}
                            {isRead && <span className="ml-2 text-green-500">✓</span>}
                          </p>
                          {topic.shortdesc && (
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                              {topic.shortdesc}
                            </p>
                          )}
                        </div>
                        {topic.readtime != null && (
                          <span className="shrink-0 text-xs text-gray-400 mt-0.5">
                            {isRead ? <span className="text-green-400">Read</span> : `${topic.readtime} min`}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
