import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';
import QuizPlayer, { type QuizData } from '@/components/quiz/QuizPlayer';

const PRETEST_QUIZ_QUERY = `
  query PretestQuiz($product: String!, $quizName: String!) {
    quiz(productSlug: $product, quizName: $quizName) {
      id
      kind
      passThreshold
      showFeedback
      timeLimit
      instructions {
        title
        begin
        done
        restart
      }
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

export default async function PretestTakePage({
  params,
}: {
  params: Promise<{ product: string; quizName: string }>;
}) {
  const { product, quizName } = await params;
  const [association, user] = await Promise.all([getAssociation(), currentUser()]);

  const data = await gql<{ quiz: QuizData | null }>(
    PRETEST_QUIZ_QUERY,
    { product, quizName },
    association,
    user?.id,
  );

  const quiz = data.quiz;
  const title = quiz?.instructions?.title ?? quizName;

  return (
    <main className="min-h-screen bg-[var(--brand-background)]">
      <header
        className="px-8 py-10 text-white"
        style={{ background: 'var(--brand-header-gradient)' }}
      >
        <Link
          href={`/${product}/pretests/${quizName}`}
          className="text-xs text-white/60 hover:text-white uppercase tracking-widest"
        >
          ← Instructions
        </Link>
        <h1 className="mt-3 text-3xl font-bold leading-tight">{title}</h1>
        {quiz && (
          <p className="mt-1 text-sm text-white/75">
            {quiz.questions.length} questions
          </p>
        )}
      </header>

      <div className="px-8 py-8">
        {quiz ? (
          <QuizPlayer
            quiz={quiz}
            product={product}
            domain=""
            tgf=""
            association={association}
            userId={user?.id ?? null}
            resultsHref={`/${product}/pretests/${quizName}/results`}
            hideFeedback
          />
        ) : (
          <p className="text-gray-400 italic max-w-2xl mx-auto">Pre-test not found.</p>
        )}
      </div>
    </main>
  );
}
