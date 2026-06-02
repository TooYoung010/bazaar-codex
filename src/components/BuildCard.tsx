'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Build } from '@/lib/types';

const HERO_COLOR: Record<string, string> = {
  vanessa: 'border-l-sky-400',
  dooley: 'border-l-emerald-400',
  pygmalien: 'border-l-amber-400',
  mak: 'border-l-fuchsia-400',
  jules: 'border-l-rose-400',
  stelle: 'border-l-teal-400',
  karnok: 'border-l-orange-500',
  unknown: 'border-l-zinc-500'
};

export default function BuildCard({ build }: { build: Build }) {
  const [imgFailed, setImgFailed] = useState(false);
  const accent = HERO_COLOR[build.heroKey] || HERO_COLOR.unknown;

  return (
    <Link
      href={`/builds/${build.id}`}
      className={`card overflow-hidden hover:bg-[#2a2838] transition group border-l-4 ${accent} flex flex-col`}
    >
      <div className="relative aspect-[16/9] bg-[var(--bg-soft)] overflow-hidden">
        {build.image && !imgFailed ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={build.image}
            alt={build.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-dim)]">
            {build.heroName}
          </div>
        )}
        {build.result && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold bg-amber-500/90 text-black">
            {build.result}
          </span>
        )}
        <span className="absolute top-2 left-2 chip text-[10px] bg-black/60">{build.heroName}</span>
        {build.dataSource === 'bazaarforge' && (
          <span title="数据源：bazaarforge.gg（活跃）" className="absolute bottom-2 left-2 chip text-[10px] bg-emerald-500/80 text-black">
            FORGE
          </span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="font-medium text-sm leading-snug group-hover:text-amber-300 line-clamp-2">
          {build.name}
        </div>
        <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-[var(--text-dim)]">
          <span className="truncate">{build.author ? `@${build.author}` : '匿名'}</span>
          <span className="shrink-0 ml-2">{build.itemIds.length} 件物品</span>
        </div>
      </div>
    </Link>
  );
}
