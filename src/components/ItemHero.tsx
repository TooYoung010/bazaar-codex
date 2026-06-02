'use client';
import { useState } from 'react';
import type { Item } from '@/lib/types';

export default function ItemHero({ item }: { item: Item }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-lg overflow-hidden bg-[var(--bg-soft)] ring-${item.startingTier}`}>
      {failed ? (
        <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-dim)]">无图</div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={item.image}
          alt={item.nameDisplay}
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
