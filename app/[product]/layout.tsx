import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { gql } from '@/lib/graphql';
import { getAssociation } from '@/lib/associations';
import { hasProductAccess } from '@/lib/licenses';
import ProductNav from '@/components/ProductNav';

const THEME_QUERY = `
  query AssociationTheme($slug: String!) {
    association(slug: $slug) {
      theme {
        accent
        accentLight
        accentDark
        background
        headerGradient
      }
    }
  }
`;

const EXAM_QUERY = `
  query ExamState($product: String!) {
    userState(productSlug: $product) {
      hasExam
      examdate
      hideCountdown
    }
  }
`;

type Theme = {
  accent: string;
  accentLight: string;
  accentDark: string;
  background: string;
  headerGradient: string;
};

const FALLBACK_THEME: Theme = {
  accent: '#1B4F8A',
  accentLight: '#e8eef7',
  accentDark: '#0f2d50',
  background: '#f5f7fa',
  headerGradient: 'linear-gradient(135deg, #0f2d50 0%, #1B4F8A 55%, #4a7dc4 100%)',
};

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const association = await getAssociation();

  if (!hasProductAccess(user.privateMetadata as Record<string, unknown>, association, product)) {
    redirect('/access-denied');
  }

  let theme = FALLBACK_THEME;
  let examState = { hasExam: false, examdate: null as string | null, hideCountdown: false };
  try {
    const [themeData, examData] = await Promise.all([
      gql<{ association: { theme: Theme } | null }>(THEME_QUERY, { slug: association }, association, user.id),
      gql<{ userState: { hasExam: boolean | null; examdate: string | null; hideCountdown: boolean | null } | null }>(
        EXAM_QUERY, { product }, association, user.id,
      ),
    ]);
    if (themeData.association?.theme) theme = themeData.association.theme;
    if (examData.userState) {
      examState = {
        hasExam: examData.userState.hasExam ?? false,
        examdate: examData.userState.examdate,
        hideCountdown: examData.userState.hideCountdown ?? false,
      };
    }
  } catch {
    // API unreachable — use fallbacks
  }

  return (
    <div
      style={{
        '--brand-accent': theme.accent,
        '--brand-accent-light': theme.accentLight,
        '--brand-accent-dark': theme.accentDark,
        '--brand-background': theme.background,
        '--brand-header-gradient': theme.headerGradient,
      } as React.CSSProperties}
      className="min-h-screen flex flex-col bg-[var(--brand-background)]"
    >
      <ProductNav product={product} examState={examState} />
      {children}
    </div>
  );
}
