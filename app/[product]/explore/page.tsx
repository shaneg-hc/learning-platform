import Link from 'next/link';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';
import DomainCarousel, { type DomainData } from '@/components/explore/DomainCarousel';
import HeroSection, { type HeroContent } from '@/components/cms/HeroSection';
import ExploreInstructions, { type ExploreInstructions as ExploreInstructionsType } from '@/components/cms/ExploreInstructions';
import ToolsForSuccessCarousel, { type ToolCard } from '@/components/cms/ToolsForSuccessCarousel';

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

const INSTRUCTIONS_QUERY = `
  query ExploreInstructions($association: String!, $product: String!) {
    exploreInstructions(associationSlug: $association, productSlug: $product) {
      heading
      content
    }
  }
`;

const TOOL_CARDS_QUERY = `
  query ToolCards($association: String!, $product: String!) {
    toolCards(associationSlug: $association, productSlug: $product) {
      id
      title
      description
      buttonLabel
      buttonUrl
      imageUrl
      imageAlt
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

  const [domainsData, heroData, instructionsData, toolCardsData] = await Promise.all([
    gql<{ domains: DomainData[] }>(EXPLORE_QUERY, { product }, association),
    gql<{ heroContent: HeroContent | null }>(
      HERO_QUERY,
      { association, product },
      association,
    ).catch(() => ({ heroContent: null })),
    gql<{ exploreInstructions: ExploreInstructionsType | null }>(
      INSTRUCTIONS_QUERY,
      { association, product },
      association,
    ).catch(() => ({ exploreInstructions: null })),
    gql<{ toolCards: ToolCard[] }>(
      TOOL_CARDS_QUERY,
      { association, product },
      association,
    ).catch(() => ({ toolCards: [] })),
  ]);

  const hero = heroData.heroContent;
  const instructions = instructionsData.exploreInstructions;
  const toolCards = toolCardsData.toolCards;

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
          <div className="flex gap-2">
            <Link
              href={`/${product}/resources`}
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span>📚</span> Resources
            </Link>
            <Link
              href={`/${product}/glossary`}
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span>📖</span> Glossary
            </Link>
          </div>
        </div>
      </header>
      {hero && <HeroSection hero={hero} />}
      {instructions && <ExploreInstructions instructions={instructions} />}

      <div className="px-8 py-8 space-y-10">
        {domainsData.domains.map((domain) => (
          <DomainCarousel key={domain.name} product={product} domain={domain} />
        ))}
      </div>
      <ToolsForSuccessCarousel cards={toolCards} />
    </main>
  );
}
