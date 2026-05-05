import Link from 'next/link';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';
import DomainCarousel, { type DomainData } from '@/components/explore/DomainCarousel';
import HeroSection, { type HeroContent } from '@/components/cms/HeroSection';

const EXPLORE_QUERY = `
  query Explore($product: String!) {
    domains(productSlug: $product) {
      name
      title
      shortdesc
      children {
        name
        title
        shortdesc
        readtime
        total
      }
    }
  }
`;

const HERO_QUERY = `
  query HeroContent($association: String!, $product: String!) {
    heroContent(associationSlug: $association, productSlug: $product) {
      title
      subtitle
      body
      backgroundImageUrl
      backgroundImageAlt
      backgroundImageWidth
      backgroundImageHeight
    }
  }
`;

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  const association = await getAssociation();

  const [domainsData, heroData] = await Promise.all([
    gql<{ domains: DomainData[] }>(EXPLORE_QUERY, { product }, association),
    gql<{ heroContent: HeroContent | null }>(
      HERO_QUERY,
      { association, product },
      association,
    ).catch(() => ({ heroContent: null })),
  ]);

  const hero = heroData.heroContent;

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
            <h1 className="mt-1 text-3xl font-bold">Explore</h1>
            <p className="mt-1 text-sm text-white/75">Browse all learning domains</p>
          </div>
          <Link
            href={`/${product}/glossary`}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>📖</span> Glossary
          </Link>
        </div>
      </header>
      {hero && <HeroSection hero={hero} />}

      <div className="px-8 py-8 space-y-10">
        {domainsData.domains.map((domain) => (
          <DomainCarousel key={domain.name} product={product} domain={domain} />
        ))}
      </div>
    </main>
  );
}
