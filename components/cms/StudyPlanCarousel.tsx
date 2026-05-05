const PLACEHOLDER_CARDS = [
  {
    id: '1',
    title: 'Leadership & Navigation',
    shortdesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    readtime: 31,
  },
  {
    id: '2',
    title: 'Ethical Practice',
    shortdesc: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.',
    readtime: 22,
  },
  {
    id: '3',
    title: 'Business Acumen',
    shortdesc: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    readtime: 61,
  },
  {
    id: '4',
    title: 'Relationship Management',
    shortdesc: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.',
    readtime: 28,
  },
  {
    id: '5',
    title: 'Communication',
    shortdesc: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.',
    readtime: 30,
  },
];

export default function StudyPlanCarousel() {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60 mb-3 text-center">
        My Study Plan
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PLACEHOLDER_CARDS.map((card) => (
          <div
            key={card.id}
            className="shrink-0 w-56 rounded-lg bg-white/15 border border-white/20 p-4 snap-start backdrop-blur-sm"
          >
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">
              {card.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-xs text-white/70">
              {card.shortdesc}
            </p>
            <div className="mt-4">
              <span className="rounded-full bg-white/20 px-2 py-1 text-xs text-white/90">
                {card.readtime} min
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
