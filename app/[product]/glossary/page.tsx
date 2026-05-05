import Link from 'next/link';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';
import GlossaryBrowser, { type GlossaryTerm } from '@/components/glossary/GlossaryBrowser';

const GLOSSARY_QUERY = `
  query Glossary($product: String!) {
    glossary(productSlug: $product) {
      id
      term
      definition
    }
  }
`;

export default async function GlossaryPage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  const association = await getAssociation();

  const data = await gql<{ glossary: GlossaryTerm[] }>(
    GLOSSARY_QUERY,
    { product },
    association,
  );

  const terms = data.glossary ?? [];

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
        <h1 className="mt-3 text-3xl font-bold">Glossary</h1>
        <p className="mt-1 text-sm text-white/75">{terms.length} terms</p>
      </header>

      <div className="px-8 py-8 max-w-4xl">
        <GlossaryBrowser terms={terms} />
      </div>
    </main>
  );
}
