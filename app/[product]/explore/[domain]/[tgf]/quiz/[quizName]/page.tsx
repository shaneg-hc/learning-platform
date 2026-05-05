import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';
import QuizPlayer, { type QuizData } from '@/components/quiz/QuizPlayer';

const QUIZ_QUERY = `
  query Quiz($product: String!, $domain: String!, $tgf: String!, $quizName: String!) {
    tgf(productSlug: $product, domainName: $domain, tgfName: $tgf) {
      title
      hasFlashcards
    }
    quiz(productSlug: $product, quizName: $quizName) {
      id
      kind
      passThreshold
      showFeedback
      timeLimit
      questions {
        id
        contentId
        type
        stem
        feedback
        randomize
        points
        choices {
          id
          contentId
          text
          correct
        }
      }
    }
  }
`;

type TGFMeta = {
  title: string | null;
  hasFlashcards: boolean;
};

export default async function QuizPage({
  params,
}: {
  params: Promise<{
    product: string;
    domain: string;
    tgf: string;
    quizName: string;
  }>;
}) {
  const { product, domain, tgf, quizName } = await params;
  const [association, user] = await Promise.all([getAssociation(), currentUser()]);

  const data = await gql<{ quiz: QuizData | null; tgf: TGFMeta | null }>(
    QUIZ_QUERY,
    { product, domain, tgf, quizName },
    association,
    user?.id,
  );

  const quiz = data.quiz;
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
          {quiz
            ? `Quiz · ${quiz.questions.length} questions · pass mark ${quiz.passThreshold}%`
            : 'Quiz'}
        </p>
      </header>

      {tgfMeta?.hasFlashcards && (
        <div className="px-8 pt-6 max-w-2xl mx-auto flex justify-end">
          <Link
            href={`/${product}/explore/${domain}/${tgf}/flashcards`}
            className="text-sm text-[var(--brand-accent)] hover:underline"
          >
            ← Switch to Flashcards
          </Link>
        </div>
      )}

      <div className="px-8 py-8">
        {quiz ? (
          <QuizPlayer
            quiz={quiz}
            product={product}
            domain={domain}
            tgf={tgf}
            association={association}
            userId={user?.id ?? null}
          />
        ) : (
          <p className="text-gray-400 italic max-w-2xl mx-auto">
            Quiz not found.
          </p>
        )}
      </div>
    </main>
  );
}
