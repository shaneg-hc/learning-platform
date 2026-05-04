import Link from 'next/link';

type TGFSummary = {
  name: string;
  title: string | null;
  shortdesc: string | null;
  readtime: number | null;
  total: number | null;
};

export type DomainData = {
  name: string;
  title: string | null;
  shortdesc: string | null;
  children: TGFSummary[];
};

export default function DomainCarousel({
  product,
  domain,
}: {
  product: string;
  domain: DomainData;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-[var(--brand-accent-dark)] capitalize">
          {domain.title ?? domain.name}
        </h2>
        {domain.shortdesc && (
          <p className="mt-1 text-sm text-gray-500">{domain.shortdesc}</p>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {domain.children.map((tgf) => (
          <Link
            key={tgf.name}
            href={`/${product}/explore/${domain.name}/${tgf.name}`}
            className="group shrink-0 w-64 rounded-lg border border-gray-100 bg-white p-5 shadow-sm snap-start transition-shadow hover:shadow-md"
          >
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--brand-accent)] group-hover:underline">
              {tgf.title ?? tgf.name}
            </h3>
            {tgf.shortdesc && (
              <p className="mt-2 line-clamp-3 text-xs text-gray-500">
                {tgf.shortdesc}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {tgf.readtime != null && (
                <span className="rounded-full bg-[var(--brand-accent-light)] px-2 py-1 text-xs text-[var(--brand-accent)]">
                  {tgf.readtime} min
                </span>
              )}
              {tgf.total != null && (
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {tgf.total} topics
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
