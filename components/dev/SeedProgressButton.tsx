'use client';

import { useState } from 'react';

export default function SeedProgressButton({
  onSeed,
}: {
  onSeed: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleClick() {
    setLoading(true);
    await onSeed();
    setLoading(false);
    setDone(true);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || done}
      className="rounded border border-dashed border-yellow-400 bg-yellow-50 px-3 py-1 text-xs text-yellow-700 hover:bg-yellow-100 disabled:opacity-50"
    >
      {done ? 'Seeded ✓ — reload to see progress' : loading ? 'Seeding…' : '⚙ Seed test progress'}
    </button>
  );
}
