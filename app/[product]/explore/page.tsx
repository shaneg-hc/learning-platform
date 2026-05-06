import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';
import { type DomainData, type NodeProgressMap } from '@/components/explore/DomainCarousel';
import StudyPlanManager from '@/components/explore/StudyPlanManager';
import { type HeroContent } from '@/components/cms/HeroSection';
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

const USER_STATE_QUERY = `
  query UserState($product: String!) {
    userState(productSlug: $product) {
      status
      quizStatus
      hasExam
      examdate
      hideCountdown
      studyPlan
      alwaysResume
      location
    }
  }
`;

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  const [association, user] = await Promise.all([getAssociation(), currentUser()]);
  const userId = user?.id;

  const [domainsData, heroData, instructionsData, toolCardsData, userStateData] = await Promise.all([
    gql<{ domains: DomainData[] }>(EXPLORE_QUERY, { product }, association, userId),
    gql<{ heroContent: HeroContent | null }>(
      HERO_QUERY,
      { association, product },
      association,
      userId,
    ).catch(() => ({ heroContent: null })),
    gql<{ exploreInstructions: ExploreInstructionsType | null }>(
      INSTRUCTIONS_QUERY,
      { association, product },
      association,
      userId,
    ).catch(() => ({ exploreInstructions: null })),
    gql<{ toolCards: ToolCard[] }>(
      TOOL_CARDS_QUERY,
      { association, product },
      association,
      userId,
    ).catch(() => ({ toolCards: [] })),
    gql<{ userState: { status: Record<string, { data: { percent: number; complete: number; total: number } }> | null; quizStatus: Record<string, unknown> | null; hasExam: boolean | null; examdate: string | null; hideCountdown: boolean | null; studyPlan: string[] | null; alwaysResume: boolean | null; location: string | null } | null }>(
      USER_STATE_QUERY,
      { product },
      association,
      userId,
    ).catch(() => ({ userState: null })),
  ]);

  const hero = heroData.heroContent;
  const instructions = instructionsData.exploreInstructions;
  const toolCards = toolCardsData.toolCards;

  // Flatten status tree into NodeProgressMap for carousel consumption
  const rawStatus = userStateData.userState?.status ?? {};
  const progress: NodeProgressMap = Object.fromEntries(
    Object.entries(rawStatus).map(([name, entry]) => [
      name,
      { percent: entry.data.percent, complete: entry.data.complete, total: entry.data.total },
    ]),
  );

  const quizStatus = userStateData.userState?.quizStatus ?? {};
  const alwaysResume = userStateData.userState?.alwaysResume ?? false;
  const lastLocation = userStateData.userState?.location ?? null;

  if (alwaysResume && lastLocation && lastLocation !== '/explore') {
    redirect(`/${product}${lastLocation}`);
  }
  const initialPins = userStateData.userState?.studyPlan ?? [];

  return (
    <main className="min-h-screen bg-[var(--brand-background)]">
      <header
        className="px-8 py-10 text-white"
        style={{ background: 'var(--brand-header-gradient)' }}
      >
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="mt-1 text-sm text-white/75">Browse all learning domains</p>
      </header>
      <StudyPlanManager
        product={product}
        association={association}
        userId={userId ?? ''}
        domains={domainsData.domains}
        progress={progress}
        quizStatus={quizStatus}
        initialPins={initialPins}
        hero={hero}
      >
        {instructions && <ExploreInstructions instructions={instructions} />}
      </StudyPlanManager>
      <ToolsForSuccessCarousel cards={toolCards} />
    </main>
  );
}
