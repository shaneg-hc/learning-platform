import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import ExamCountdown from '@/components/explore/ExamCountdown';
import { type Features, ALL_ENABLED } from '@/lib/features';

type ExamState = { hasExam: boolean; examdate: string | null; hideCountdown: boolean };

export default function ProductNav({
  product,
  examState,
  features = ALL_ENABLED,
}: {
  product: string;
  examState?: ExamState;
  features?: Features;
}) {
  const navLinkClass = 'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors';

  return (
    <nav className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-100 shadow-sm">
      <Link
        href={`/${product}/explore`}
        className="text-sm font-semibold text-[var(--brand-accent)] hover:opacity-80 uppercase tracking-widest"
      >
        {product}
      </Link>
      <div className="flex items-center gap-1">
        <Link href={`/${product}/explore`} className={navLinkClass}>
          Explore
        </Link>
        {features.pretests && (
          <Link href={`/${product}/pretests`} className={navLinkClass}>
            Pre-Tests
          </Link>
        )}
        {features.progress && (
          <Link href={`/${product}/quizzes`} className={navLinkClass}>
            Progress
          </Link>
        )}
        {features.glossary && (
          <Link href={`/${product}/glossary`} className={navLinkClass}>
            Glossary
          </Link>
        )}
        {features.resources && (
          <Link href={`/${product}/resources`} className={navLinkClass}>
            Resources
          </Link>
        )}
        {features.settings && (
          <Link href={`/${product}/settings`} className={navLinkClass}>
            Settings
          </Link>
        )}
        {examState && (
          <ExamCountdown
            hasExam={examState.hasExam}
            examdate={examState.examdate}
            hideCountdown={examState.hideCountdown}
          />
        )}
        <div className="ml-2">
          <UserMenu product={product} />
        </div>
      </div>
    </nav>
  );
}
