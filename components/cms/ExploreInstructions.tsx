export type ExploreInstructions = {
  heading: string;
  content: string;
};

export default function ExploreInstructions({ instructions }: { instructions: ExploreInstructions }) {
  return (
    <section className="px-8 py-8 max-w-3xl mx-auto text-center">
      <h2 className="text-xl font-semibold text-[var(--brand-accent-dark)]">
        {instructions.heading}
      </h2>
      <p className="mt-3 text-sm text-gray-600 leading-relaxed">
        {instructions.content}
      </p>
    </section>
  );
}
