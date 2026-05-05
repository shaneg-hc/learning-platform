import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import { getAssociation } from '@/lib/associations';
import { getProductsForAssociation, type License } from '@/lib/licenses';
import { gql } from '@/lib/graphql';

const ASSOCIATION_QUERY = `
  query Association($slug: String!) {
    association(slug: $slug) {
      name
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

type AssociationData = {
  name: string;
  theme: {
    accent: string;
    accentLight: string;
    accentDark: string;
    background: string;
    headerGradient: string;
  };
};

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const association = await getAssociation();
  const licenses = (user.privateMetadata?.licenses ?? []) as License[];
  const products = getProductsForAssociation(licenses, association);

  if (products.length === 0) {
    redirect('/access-denied');
  }

  let assocData: AssociationData | null = null;
  try {
    const data = await gql<{ association: AssociationData | null }>(
      ASSOCIATION_QUERY,
      { slug: association },
      association,
    );
    assocData = data.association;
  } catch {
    // use fallback styling
  }

  const theme = assocData?.theme;

  return (
    <div
      style={{
        '--brand-accent': theme?.accent ?? '#1B4F8A',
        '--brand-accent-light': theme?.accentLight ?? '#e8eef7',
        '--brand-accent-dark': theme?.accentDark ?? '#0f2d50',
        '--brand-background': theme?.background ?? '#f5f7fa',
        '--brand-header-gradient': theme?.headerGradient ?? 'linear-gradient(135deg, #0f2d50 0%, #1B4F8A 55%, #4a7dc4 100%)',
      } as React.CSSProperties}
      className="min-h-screen bg-[var(--brand-background)]"
    >
      <header
        className="relative px-8 py-10 text-white"
        style={{ background: 'var(--brand-header-gradient)' }}
      >
        <p className="text-sm font-medium uppercase tracking-widest text-white/60">
          {assocData?.name ?? association}
        </p>
        <h1 className="mt-1 text-3xl font-bold">My Products</h1>
        <p className="mt-1 text-sm text-white/75">Select a product to continue</p>
        <div className="absolute top-8 right-8">
          <UserMenu />
        </div>
      </header>

      <div className="px-8 py-8 max-w-2xl">
        <ul className="space-y-4">
          {products.map((productSlug) => (
            <li key={productSlug}>
              <Link
                href={`/${productSlug}/explore`}
                className="group flex items-center justify-between rounded-lg border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <h2 className="text-base font-semibold text-[var(--brand-accent)] group-hover:underline">
                    {productSlug.toUpperCase()}
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {assocData?.name ?? association}
                  </p>
                </div>
                <span className="text-[var(--brand-accent)] text-lg">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
