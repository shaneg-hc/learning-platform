import Link from 'next/link';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';
import FlashcardViewer, { type Flashcard } from '@/components/flashcards/FlashcardViewer';

const TGF_TITLE_QUERY = `
  query TGFTitle($product: String!, $domain: String!, $tgf: String!) {
    tgf(productSlug: $product, domainName: $domain, tgfName: $tgf) {
      title
      quizNames
    }
    flashcards(productSlug: $product, tgfName: $tgf) {
      tgfName
      cards {
        id
        term
        definition
      }
    }
  }
`;

type FlashcardDeck = {
  tgfName: string;
  cards: Flashcard[];
};

type TGFMeta = {
  title: string | null;
  quizNames: string[];
};

export default async function FlashcardsPage({
  params,
}: {
  params: Promise<{ product: string; domain: string; tgf: string }>;
}) {
  const { product, domain, tgf } = await params;
  const association = await getAssociation();

  const data = await gql<{ flashcards: FlashcardDeck | null; tgf: TGFMeta | null }>(
    TGF_TITLE_QUERY,
    { product, domain, tgf },
    association,
  );

  const deck = data.flashcards;
  const tgfMeta = data.tgf;
  const backHref = `/${product}/explore/${domain}/${tgf}`;

  return (
    <main className="min-h-screen bg-[var(--brand-background)]">
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
          {tgfMeta?.title ?? tgf}
        </h1>
        <p className="mt-1 text-sm text-white/75">
          Flashcards · {deck?.cards.length ?? 0} terms
        </p>
      </header>

      {tgfMeta?.quizNames && tgfMeta.quizNames.length > 0 && (
        <div className="px-8 pt-6 max-w-2xl mx-auto">
          <div className="flex justify-end">
            {tgfMeta.quizNames.map((quizName) => (
              <Link
                key={quizName}
                href={`/${product}/explore/${domain}/${tgf}/quiz/${quizName}`}
                className="text-sm text-[var(--brand-accent)] hover:underline"
              >
                Switch to Quiz →
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="px-8 py-8 max-w-2xl mx-auto">
        {deck ? (
          <FlashcardViewer cards={deck.cards} />
        ) : (
          <p className="text-gray-400 italic">No flashcards available for this topic.</p>
        )}
      </div>
    </main>
  );
}
