'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import DomainCarousel, { type DomainData, type NodeProgressMap } from './DomainCarousel';
import StudyPlanCarousel from './StudyPlanCarousel';
import HeroSection, { type HeroContent } from '@/components/cms/HeroSection';

const PIN_MUTATION = `
  mutation PinTgf($product: String!, $nodeName: String!) {
    pinTgf(productSlug: $product, nodeName: $nodeName)
  }
`;

const UNPIN_MUTATION = `
  mutation UnpinTgf($product: String!, $nodeName: String!) {
    unpinTgf(productSlug: $product, nodeName: $nodeName)
  }
`;

export default function StudyPlanManager({
  product,
  association,
  userId,
  domains,
  progress,
  quizStatus,
  initialPins,
  hero,
  children,
}: {
  product: string;
  association: string;
  userId: string;
  domains: DomainData[];
  progress: NodeProgressMap;
  quizStatus: Record<string, unknown>;
  initialPins: string[];
  hero: HeroContent | null;
  children?: ReactNode;
}) {
  const [pins, setPins] = useState<string[]>(initialPins);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001/graphql';

  async function togglePin(nodeName: string) {
    const isPinned = pins.includes(nodeName);
    setPins((prev) => isPinned ? prev.filter((n) => n !== nodeName) : [...prev, nodeName]);
    await fetch(`${apiUrl}?association=${association}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({
        query: isPinned ? UNPIN_MUTATION : PIN_MUTATION,
        variables: { product, nodeName },
      }),
    });
  }

  const allTgfs = domains.flatMap((d) =>
    d.children.map((c) => ({ ...c, domainName: d.name })),
  );

  const studyPlanCarousel = (
    <StudyPlanCarousel
      product={product}
      tgfs={allTgfs}
      pins={pins}
      progress={progress}
      quizStatus={quizStatus}
      onToggle={togglePin}
      inHero
    />
  );

  return (
    <>
      {hero
        ? <HeroSection hero={hero} studyPlanSlot={studyPlanCarousel} />
        : pins.length > 0 && (
            <section className="px-8 py-6 border-b border-gray-100">
              {studyPlanCarousel}
            </section>
          )
      }
      {children}
      <div className="px-8 py-8 space-y-10">
        {domains.map((domain) => (
          <DomainCarousel
            key={domain.name}
            product={product}
            domain={domain}
            progress={progress}
            quizStatus={quizStatus}
            pinnedItems={pins}
            onTogglePin={togglePin}
          />
        ))}
      </div>
    </>
  );
}
