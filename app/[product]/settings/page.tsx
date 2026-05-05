import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';
import SettingsForm, { type QuizPatterns, type SettingsValues } from '@/components/settings/SettingsForm';

const SETTINGS_QUERY = `
  query Settings($product: String!, $association: String!) {
    userState(productSlug: $product) {
      quizPattern
      hasExam
      examdate
      hideCountdown
      alwaysResume
    }
    siteConfig(associationSlug: $association, productSlug: $product) {
      config
    }
  }
`;

type UserStateSettings = {
  quizPattern: string | null;
  hasExam: boolean | null;
  examdate: string | null;
  hideCountdown: boolean | null;
  alwaysResume: boolean | null;
};

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  const [association, user] = await Promise.all([getAssociation(), currentUser()]);

  if (!user) redirect('/sign-in');

  const data = await gql<{
    userState: UserStateSettings | null;
    siteConfig: { config: Record<string, unknown> } | null;
  }>(SETTINGS_QUERY, { product, association }, association, user.id);

  const us = data.userState;
  const quizPatterns: QuizPatterns =
    (data.siteConfig?.config?.quizpatterns as QuizPatterns) ?? {};

  const initial: SettingsValues = {
    quizPattern: us?.quizPattern ?? null,
    hasExam: us?.hasExam ?? null,
    examdate: us?.examdate ?? null,
    hideCountdown: us?.hideCountdown ?? null,
    alwaysResume: us?.alwaysResume ?? null,
  };

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
        <h1 className="mt-3 text-3xl font-bold leading-tight">Settings</h1>
        <p className="mt-1 text-sm text-white/75">Personalise your study experience</p>
      </header>

      <div className="px-8 py-10">
        <SettingsForm
          product={product}
          association={association}
          userId={user.id}
          initial={initial}
          quizPatterns={quizPatterns}
        />
      </div>
    </main>
  );
}
