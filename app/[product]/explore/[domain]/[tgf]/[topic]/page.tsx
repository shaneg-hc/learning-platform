import Link from 'next/link';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';
import DitaRenderer from '@/components/dita/DitaRenderer';

const TOPIC_QUERY = `
  query TopicPage($product: String!, $topic: String!) {
    bookNode(productSlug: $product, nodeName: $topic, includeBody: true) {
      name
      title
      shortdesc
      body
      nav {
        parent
        next
        previous
        data { readtime total }
      }
    }
  }
`;

type NavData = { readtime: number; total: number };
type Nav = { parent: string | null; next: string | null; previous: string | null; data: NavData };

type TopicNode = {
  name: string;
  title: string | null;
  shortdesc: string | null;
  body: Record<string, unknown> | null;
  nav: Nav | null;
};

export default async function TopicPage({
  params,
}: {
  params: Promise<{ product: string; domain: string; tgf: string; topic: string }>;
}) {
  const { product, domain, tgf, topic } = await params;
  const association = await getAssociation();

  const data = await gql<{ bookNode: TopicNode | null }>(
    TOPIC_QUERY,
    { product, topic },
    association,
  );

  const node = data.bookNode;
  if (!node) {
    return (
      <main className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center">
        <p className="text-gray-500">Topic not found.</p>
      </main>
    );
  }

  const backHref = `/${product}/explore/${domain}/${tgf}`;

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
        {node.body ? (
          <DitaRenderer body={node.body} />
        ) : (
          <p className="text-gray-400 italic">No content available.</p>
        )}
      </div>

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
          {node.nav.next ? (
            <Link
              href={`/${product}/explore/${domain}/${tgf}/${node.nav.next}`}
              className="text-sm text-[var(--brand-accent)] hover:underline"
            >
              Next →
            </Link>
          ) : <span />}
        </nav>
      )}
    </main>
  );
}
