import StudyPlanCarousel from '@/components/cms/StudyPlanCarousel';

export type HeroContent = {
  title: string;
  subtitle: string | null;
  body: string | null;
  backgroundImageUrl: string | null;
  backgroundImageAlt: string | null;
  backgroundImageWidth: number | null;
  backgroundImageHeight: number | null;
};

export default function HeroSection({ hero }: { hero: HeroContent }) {
  return (
    <section
      className="relative px-8 py-10 text-white overflow-hidden"
      style={{ background: 'var(--brand-accent)' }}
    >
      {hero.backgroundImageUrl && (
        <img
          src={hero.backgroundImageUrl}
          alt={hero.backgroundImageAlt ?? ''}
          width={hero.backgroundImageWidth ?? undefined}
          height={hero.backgroundImageHeight ?? undefined}
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
      )}
      <div className="relative text-center">
        <h1 className="text-3xl font-bold">{hero.title}</h1>
        {hero.subtitle && (
          <p className="mt-1 text-sm text-white/75">{hero.subtitle}</p>
        )}
        {hero.body && (
          <p className="mt-3 text-sm text-white/70 leading-relaxed">{hero.body}</p>
        )}
      </div>
      <div className="relative mt-8">
        <StudyPlanCarousel />
      </div>
    </section>
  );
}
