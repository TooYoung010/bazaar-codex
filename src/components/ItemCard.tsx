'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Item } from '@/lib/types';
import { slug } from '@/lib/data';

interface Props {
  item: Item;
  variant?: 'grid' | 'compact' | 'inline';
}

export default function ItemCard({ item, variant = 'grid' }: Props) {
  const [imgFailed, setImgFailed] = useState(false);

  if (variant === 'compact') {
    return (
      <Link href={`/item/${slug(item.name)}`} className={`card flex items-center gap-2 p-2 hover:bg-[#2a2838] ring-${item.startingTier}`}>
        <Thumbnail item={item} failed={imgFailed} setFailed={setImgFailed} sizeCls="w-10 h-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-xs leading-tight truncate">{item.nameDisplay}</div>
          <div className="text-[10px] text-[var(--text-dim)] truncate">{item.name}</div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/item/${slug(item.name)}`}
      className={`card overflow-hidden hover:bg-[#2a2838] transition group ring-${item.startingTier} flex flex-col`}
    >
      <div className="relative aspect-[3/2] bg-[var(--bg-soft)]">
        <Thumbnail item={item} failed={imgFailed} setFailed={setImgFailed} sizeCls="w-full h-full" rounded={false} />
        <span className={`absolute top-1 left-1 chip text-[10px] tier-${item.startingTier} bg-black/60`}>
          {item.startingTierCn}
        </span>
        {item.dataSource !== 'inferred' && (
          <span className="absolute top-1 right-1 chip text-[10px] bg-black/60">D{item.earliestDay}+</span>
        )}
        {item.dataSource === 'inferred' && (
          <span title="数据补充：来自社区牌组反推" className="absolute top-1 right-1 chip text-[10px] bg-amber-500/80 text-black">补</span>
        )}
      </div>
      <div className="p-2.5">
        <div className="font-medium text-sm leading-tight group-hover:text-amber-300 truncate">
          {item.nameDisplay}
        </div>
        {item.nameCn && (
          <div className="text-[11px] text-[var(--text-dim)] truncate">{item.name}</div>
        )}
        <div className="flex items-center gap-1 flex-wrap mt-1.5">
          <span className="chip text-[10px]">{item.sizeCn}</span>
          {item.tags.slice(0, 2).map(t => (
            <span key={t} className="chip text-[10px]">{t}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function Thumbnail({
  item, failed, setFailed, sizeCls, rounded = true
}: {
  item: Item;
  failed: boolean;
  setFailed: (v: boolean) => void;
  sizeCls: string;
  rounded?: boolean;
}) {
  const radiusCls = rounded ? 'rounded' : '';
  if (failed) {
    return (
      <div className={`${sizeCls} ${radiusCls} bg-[var(--bg-soft)] flex items-center justify-center`}>
        <span className="text-[10px] text-[var(--text-dim)] truncate px-1">无图</span>
      </div>
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={item.image}
      alt={item.nameDisplay}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${sizeCls} ${radiusCls} object-cover`}
    />
  );
}
