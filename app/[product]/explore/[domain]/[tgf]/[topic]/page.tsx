import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';
import DitaRenderer from '@/components/dita/DitaRenderer';
import TopicViewTracker from '@/components/explore/TopicViewTracker';

const TOPIC_QUERY = `
  query TopicPage($product: String!, $topic: String!) {
    bookNode(productSlug: $product, nodeName: $topic, includeBody: true) {
      name
      level
      title
      shortdesc
      body
      quizNames
      nav {
        parent
        next
        previous
        firstChild
        data { readtime total }
      }
    }
    userState(productSlug: $product) {
      quizPattern
    }
  }
`;

type NavData = { readtime: number; total: number };
type Nav = { parent: string | null; next: string | null; previous: string | null; firstChild: string | null; data: NavData };

type TopicNode = {
  name: string;
  level: string;
  title: string | null;
  shortdesc: string | null;
  body: Record<string, unknown> | null;
  quizNames: string[];
  nav: Nav | null;
};

export default async function TopicPage({
  params,
}: {
  params: Promise<{ product: string; domain: string; tgf: string; topic: string }>;
}) {
  const { product, domain, tgf, topic } = await params;
  const [association, user] = await Promise.all([getAssociation(), currentUser()]);

  const data = await gql<{ bookNode: TopicNode | null; userState: { quizPattern: string | null } | null }>(
    TOPIC_QUERY,
    { product, topic },
    association,
    user?.id,
  );

  const node = data.bookNode;
  const quizPattern = data.userState?.quizPattern ?? 'cp';
  if (!node) {
    return (
      <main className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center">
        <p className="text-gray-500">Topic not found.</p>
      </main>
    );
  }

  const isTopicGroup = node.level === 'TOPIC_GROUP';
  const backHref = `/${product}/explore/${domain}/${tgf}`;

  return (
    <main className="min-h-screen bg-[var(--brand-background)]">
      {user?.id && !isTopicGroup && (
        <TopicViewTracker
          product={product}
          topic={topic}
          tgf={tgf}
          location={`/explore/${domain}/${tgf}/${topic}`}
          association={association}
          userId={user.id}
        />
      )}
      <header
        className="px-8 py-10 text-white"
        style={{ background: 'var(--brand-header-gradient)' }}
      >
        <Link
          href={backHref}
          className="text-xs text-white/60 hover:text-white uppercase tracking-widest"
        >
          ← Back
        </Link>
        <h1 className="mt-3 text-3xl font-bold leading-tight">
          {node.title ?? node.name}
        </h1>
        {node.nav?.data.readtime && (
          <p className="mt-2 text-sm text-white/75">
            {node.nav.data.readtime} min read
          </p>
        )}
      </header>

      <div className="px-8 py-8 max-w-3xl">
        {node.shortdesc && node.shortdesc !== node.title && (
          <p className="mb-6 text-base text-gray-600 leading-relaxed border-l-4 border-[var(--brand-accent)] pl-4">
            {node.shortdesc}
          </p>
        )}
        {node.body ? (
          <DitaRenderer body={node.body} />
        ) : (
          !isTopicGroup && <p className="text-gray-400 italic">No content available.</p>
        )}
      </div>

      {isTopicGroup && node.quizNames.filter((n) => n.endsWith(`-${quizPattern}`) || !n.match(/-(cp|scp)$/)).length > 0 && (
        <div className="px-8 pb-4 max-w-3xl flex flex-wrap gap-3">
          {node.quizNames.filter((n) => n.endsWith(`-${quizPattern}`) || !n.match(/-(cp|scp)$/)).map((quizName) => (
            <div key={quizName} className="inline-flex items-center gap-2">
              <Link
                href={`/${product}/explore/${domain}/${tgf}/quiz/${quizName}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                <span>✏️</span> Check Your Understanding
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

      {(node.nav?.previous || node.nav?.next) && (
        <nav className="px-8 pb-12 max-w-3xl flex justify-between gap-4">
          {node.nav.previous ? (
            <Link
              href={`/${product}/explore/${domain}/${tgf}/${node.nav.previous}`}
              className="text-sm text-[var(--brand-accent)] hover:underline"
            >
              ← Previous
            </Link>
          ) : <span />}
          {(isTopicGroup ? node.nav.firstChild : node.nav.next) ? (
            <Link
              href={`/${product}/explore/${domain}/${tgf}/${isTopicGroup ? node.nav.firstChild : node.nav.next}`}
              className="text-sm text-[var(--brand-accent)] hover:underline"
            >
              {isTopicGroup ? 'Start →' : 'Next →'}
            </Link>
          ) : <span />}
        </nav>
      )}
    </main>
  );
}
