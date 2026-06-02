'use client';
import { useMemo, useState } from 'react';
import type { Item } from '@/lib/types';
import ItemCard from './ItemCard';

interface Props {
  items: Item[];
}

const TIER_ORDER = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Legendary'];

export default function ItemGrid({ items }: Props) {
  const [q, setQ] = useState('');
  const [tier, setTier] = useState<string>('all');
  const [size, setSize] = useState<string>('all');

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const qqRaw = q.trim();
    return items
      .filter(it => {
        if (tier !== 'all' && it.startingTier !== tier) return false;
        if (size !== 'all' && it.size !== size) return false;
        if (!qq && !qqRaw) return true;
        return (
          it.name.toLowerCase().includes(qq) ||
          (it.nameCn && it.nameCn.includes(qqRaw)) ||
          it.tags.some(t => t.toLowerCase().includes(qq))
        );
      })
      .sort((a, b) => {
        const ta = TIER_ORDER.indexOf(a.startingTier);
        const tb = TIER_ORDER.indexOf(b.startingTier);
        if (ta !== tb) return ta - tb;
        return a.nameDisplay.localeCompare(b.nameDisplay, 'zh-CN');
      });
  }, [items, q, tier, size]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="搜索 中文 / 英文 / 标签..."
          className="card px-3 py-1.5 outline-none focus:ring-1 focus:ring-amber-400 min-w-[220px]"
        />
        <select value={tier} onChange={e => setTier(e.target.value)} className="card px-2 py-1.5">
          <option value="all">全部品级</option>
          <option value="Bronze">青铜</option>
          <option value="Silver">白银</option>
          <option value="Gold">黄金</option>
          <option value="Diamond">钻石</option>
          <option value="Legendary">传说</option>
        </select>
        <select value={size} onChange={e => setSize(e.target.value)} className="card px-2 py-1.5">
          <option value="all">全部尺寸</option>
          <option value="Small">小</option>
          <option value="Medium">中</option>
          <option value="Large">大</option>
        </select>
        <span className="text-[var(--text-dim)] ml-auto">{filtered.length} / {items.length}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map(it => (
          <ItemCard key={it.id} item={it} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-[var(--text-dim)] py-12">没有符合条件的物品</div>
      )}
    </div>
  );
}
