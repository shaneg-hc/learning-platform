import Link from 'next/link';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';

type ResourceItem = {
  id: string;
  title: string;
  description: string | null;
  type: 'video' | 'pdf' | 'link';
  url: string;
  thumbnailUrl: string | null;
  thumbnailAlt: string | null;
};

type ResourceSection = {
  id: string;
  title: string;
  description: string | null;
  items: ResourceItem[];
};

const SECTION_QUERY = `
  query ResourceSection($association: String!, $product: String!, $slug: String!) {
    resourceSection(associationSlug: $association, productSlug: $product, slug: $slug) {
      id
      title
      description
      items {
        id
        title
        description
        type
        url
        thumbnailUrl
        thumbnailAlt
      }
    }
  }
`;

const TYPE_ICON: Record<string, string> = {
  video: '▶',
  pdf: '📄',
  link: '🔗',
};

const TYPE_LABEL: Record<string, string> = {
  video: 'Video',
  pdf: 'PDF',
  link: 'Link',
};

export default async function ResourceSectionPage({
  params,
}: {
  params: Promise<{ product: string; section: string }>;
}) {
  const { product, section } = await params;
  const association = await getAssociation();

  const data = await gql<{ resourceSection: ResourceSection | null }>(
    SECTION_QUERY,
    { association, product, slug: section },
    association,
  );

  const sectionData = data.resourceSection;

  if (!sectionData) {
    return (
      <main className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center">
        <p className="text-sm text-gray-500">Section not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--brand-background)]">
      <header
        className="px-8 py-10 text-white"
        style={{ background: 'var(--brand-header-gradient)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <Link
              href={`/${product}/resources`}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              ← Resource Center
            </Link>
            <h1 className="mt-2 text-3xl font-bold">{sectionData.title}</h1>
            {sectionData.description && (
              <p className="mt-1 text-sm text-white/75">{sectionData.description}</p>
            )}
          </div>
        </div>
      </header>

      <div className="px-8 py-8 max-w-3xl">
        {sectionData.items.length === 0 ? (
          <p className="text-sm text-gray-500">No resources in this section yet.</p>
        ) : (
          <ul className="space-y-4">
            {sectionData.items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-4 rounded-lg border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.thumbnailAlt ?? ''}
                      className="w-20 h-16 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-16 rounded bg-[var(--brand-accent-light)] shrink-0 flex items-center justify-center text-2xl">
                      {TYPE_ICON[item.type]}
                    </div>
                  )}
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[var(--brand-accent-light)] px-2 py-0.5 text-xs text-[var(--brand-accent)]">
                        {TYPE_LABEL[item.type]}
                      </span>
                      <h2 className="text-sm font-semibold text-[var(--brand-accent-dark)] group-hover:underline">
                        {item.title}
                      </h2>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
