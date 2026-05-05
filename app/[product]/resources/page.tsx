import Link from 'next/link';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';

type ResourceSection = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
};

const SECTIONS_QUERY = `
  query ResourceSections($association: String!, $product: String!) {
    resourceSections(associationSlug: $association, productSlug: $product) {
      id
      slug
      title
      description
    }
  }
`;

export default async function ResourceCenterPage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  const association = await getAssociation();

  const data = await gql<{ resourceSections: ResourceSection[] }>(
    SECTIONS_QUERY,
    { association, product },
    association,
  );

  return (
    <main className="min-h-screen bg-[var(--brand-background)]">
      <header
        className="px-8 py-10 text-white"
        style={{ background: 'var(--brand-header-gradient)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-white/60">
              {product}
            </p>
            <h1 className="mt-1 text-3xl font-bold">Resource Center</h1>
            <p className="mt-1 text-sm text-white/75">Browse resources by category</p>
          </div>
          <Link
            href={`/${product}/explore`}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            ← Explore
          </Link>
        </div>
      </header>

      <div className="px-8 py-8 max-w-3xl">
        {data.resourceSections.length === 0 ? (
          <p className="text-sm text-gray-500">No resources available yet.</p>
        ) : (
          <ul className="space-y-4">
            {data.resourceSections.map((section) => (
              <li key={section.id}>
                <Link
                  href={`/${product}/resources/${section.slug}`}
                  className="group flex flex-col rounded-lg border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h2 className="text-base font-semibold text-[var(--brand-accent)] group-hover:underline">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="mt-1 text-sm text-gray-500">{section.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
