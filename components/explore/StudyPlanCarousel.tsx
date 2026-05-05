import Link from 'next/link';
import { type NodeProgressMap } from './DomainCarousel';

type TGFWithDomain = {
  name: string;
  domainName: string;
  title: string | null;
  shortdesc: string | null;
  readtime: number | null;
  total: number | null;
};

function ProgressBar({ percent, inHero }: { percent: number; inHero?: boolean }) {
  return (
    <div className={`mt-3 h-1.5 w-full rounded-full overflow-hidden ${inHero ? 'bg-white/20' : 'bg-gray-100'}`}>
      <div
        className={`h-full rounded-full ${inHero ? 'bg-white/70' : 'bg-[var(--brand-accent)]'}`}
        style={{ width: `${Math.min(100, Math.round(percent))}%` }}
      />
    </div>
  );
}

export default function StudyPlanCarousel({
  product,
  tgfs,
  pins,
  progress,
  quizStatus,
  onToggle,
  inHero = false,
}: {
  product: string;
  tgfs: TGFWithDomain[];
  pins: string[];
  progress: NodeProgressMap;
  quizStatus: Record<string, unknown>;
  onToggle: (nodeName: string) => void;
  inHero?: boolean;
}) {
  const pinned = tgfs.filter((t) => pins.includes(t.name));
  if (pinned.length === 0) return null;

  return (
    <section>
      <div className="mb-4">
        <h2 className={`text-sm font-semibold uppercase tracking-widest ${inHero ? 'text-white/60' : 'text-xl text-[var(--brand-accent-dark)]'}`}>
          My Study Plan
        </h2>
        {!inHero && <p className="mt-1 text-sm text-gray-500">Topics you&apos;ve added to study later</p>}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {pinned.map((tgf) => {
          const tgfProgress = progress[tgf.name];
          const percent = tgfProgress?.percent ?? 0;
          const isComplete = percent >= 100;
          const quizEntry = Object.entries(quizStatus).find(
            ([k]) => k === tgf.name || k.startsWith(tgf.name + '-'),
          );
          const quizPercent = quizEntry
            ? ((quizEntry[1] as { data?: { percent?: number } })?.data?.percent ?? 0)
            : null;

          return (
            <div key={tgf.name} className={`group shrink-0 w-56 rounded-lg p-4 snap-start relative ${inHero ? 'bg-white/15 border border-white/20 backdrop-blur-sm' : 'bg-white border border-[var(--brand-accent-light)] shadow-sm'}`}>
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/${product}/explore/${tgf.domainName}/${tgf.name}`}
                  className="flex-1 min-w-0"
                >
                  <h3 className={`line-clamp-2 text-sm font-semibold leading-snug hover:underline ${inHero ? 'text-white' : 'text-[var(--brand-accent)]'}`}>
                    {tgf.title ?? tgf.name}
                  </h3>
                </Link>
                <button
                  onClick={() => onToggle(tgf.name)}
                  title="Remove from study plan"
                  className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full border text-sm leading-none transition-colors ${inHero ? 'border-white/30 text-white/60 hover:border-red-300 hover:text-red-300' : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'}`}
                  aria-label="Remove from study plan"
                >
                  −
                </button>
                {isComplete && (
                  <span className="shrink-0 text-green-400 text-base" title="Complete">✓</span>
                )}
              </div>
              {tgf.shortdesc && (
                <p className={`mt-2 line-clamp-3 text-xs ${inHero ? 'text-white/70' : 'text-gray-500'}`}>{tgf.shortdesc}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {tgf.readtime != null && (
                  <span className={`rounded-full px-2 py-1 text-xs ${inHero ? 'bg-white/20 text-white/90' : 'bg-[var(--brand-accent-light)] text-[var(--brand-accent)]'}`}>
                    {tgf.readtime} min
                  </span>
                )}
                {tgf.total != null && (
                  <span className={`rounded-full px-2 py-1 text-xs ${inHero ? 'bg-white/20 text-white/90' : 'bg-gray-100 text-gray-600'}`}>
                    {tgf.total} topics
                  </span>
                )}
                {quizPercent === 100 && (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    Quiz ✓
                  </span>
                )}
              </div>
              {tgfProgress && <ProgressBar percent={percent} inHero={inHero} />}
              {tgfProgress && percent > 0 && (
                <p className={`mt-1.5 text-xs ${inHero ? 'text-white/50' : 'text-gray-400'}`}>{Math.round(percent)}% complete</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
