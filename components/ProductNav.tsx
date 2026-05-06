import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

export default function ProductNav({ product }: { product: string }) {
  return (
    <nav className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-100 shadow-sm">
      <Link
        href={`/${product}/explore`}
        className="text-sm font-semibold text-[var(--brand-accent)] hover:opacity-80 uppercase tracking-widest"
      >
        {product}
      </Link>
      <div className="flex items-center gap-1">
        <Link
          href={`/${product}/explore`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Explore
        </Link>
        <Link
          href={`/${product}/glossary`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Glossary
        </Link>
        <Link
          href={`/${product}/resources`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Resources
        </Link>
        <Link
          href={`/${product}/settings`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Settings
        </Link>
        <div className="ml-2">
          <UserMenu product={product} />
        </div>
      </div>
    </nav>
  );
}
