export type ToolCard = {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

export default function ToolsForSuccessCarousel({ cards }: { cards: ToolCard[] }) {
  if (cards.length === 0) return null;

  return (
    <section className="px-8 py-8">
      <h2 className="text-xl font-semibold text-[var(--brand-accent-dark)] mb-4">
        Tools for Success
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cards.map((card) => (
          <div
            key={card.id}
            className="shrink-0 w-64 rounded-lg border border-gray-100 bg-white shadow-sm snap-start flex flex-col overflow-hidden"
          >
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.imageAlt ?? ''}
                className="w-full h-36 object-cover"
              />
            ) : (
              <div className="w-full h-36 bg-[var(--brand-accent-light)]" />
            )}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-sm font-semibold text-[var(--brand-accent-dark)] leading-snug">
                {card.title}
              </h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed flex-1">
                {card.description}
              </p>
              <a
                href={card.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-lg bg-[var(--brand-accent)] px-4 py-2 text-center text-xs font-medium text-white hover:opacity-90 transition-opacity"
              >
                {card.buttonLabel}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
