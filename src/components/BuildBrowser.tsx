'use client';
import { useMemo, useState } from 'react';
import type { Build } from '@/lib/types';
import BuildCard from './BuildCard';

interface Props {
  builds: Build[];
}

const HEROES = [
  { key: 'all', label: '全部角色' },
  { key: 'vanessa', label: '凡妮莎' },
  { key: 'dooley', label: '杜利' },
  { key: 'pygmalien', label: '皮格马利安' },
  { key: 'mak', label: '马克' },
  { key: 'jules', label: '朱尔斯' },
  { key: 'stelle', label: '斯黛拉' },
  { key: 'karnok', label: '卡诺克' }
];

const RESULTS = [
  { key: 'all', label: '全部战绩' },
  { key: '10-0', label: '10-0 完美' },
  { key: '10-low', label: '10-1~10-3' },
  { key: '10-mid', label: '10-4~10-6' },
  { key: '10-any', label: '所有 10 胜' }
];

const SOURCES = [
  { key: 'all', label: '全部来源' },
  { key: 'bazaarforge', label: '活跃站 (Forge)' },
  { key: 'bazaar-builds', label: '历史站 (BB)' }
];

const PAGE_SIZE = 30;

export default function BuildBrowser({ builds }: Props) {
  const [q, setQ] = useState('');
  const [hero, setHero] = useState('all');
  const [result, setResult] = useState('all');
  const [source, setSource] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return builds.filter(b => {
      if (hero !== 'all' && b.heroKey !== hero) return false;
      if (source !== 'all' && b.dataSource !== source) return false;
      if (result !== 'all') {
        const r = b.result || '';
        const m = r.match(/(\d+)[-–](\d+)/);
        const losses = m ? parseInt(m[2]) : null;
        if (result === '10-0' && losses !== 0) return false;
        if (result === '10-low' && (losses === null || losses < 1 || losses > 3)) return false;
        if (result === '10-mid' && (losses === null || losses < 4 || losses > 6)) return false;
        if (result === '10-any' && !r.startsWith('10')) return false;
      }
      if (qq) {
        const inTitle = b.name.toLowerCase().includes(qq);
        const inAuthor = (b.author || '').toLowerCase().includes(qq);
        if (!inTitle && !inAuthor) return false;
      }
      return true;
    });
  }, [builds, q, hero, result, source]);

  const total = filtered.length;
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < total;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1); }}
          placeholder="搜索牌组名 / 作者..."
          className="card px-3 py-1.5 outline-none focus:ring-1 focus:ring-amber-400 min-w-[220px]"
        />
        <select value={hero} onChange={e => { setHero(e.target.value); setPage(1); }} className="card px-2 py-1.5">
          {HEROES.map(h => <option key={h.key} value={h.key}>{h.label}</option>)}
        </select>
        <select value={result} onChange={e => { setResult(e.target.value); setPage(1); }} className="card px-2 py-1.5">
          {RESULTS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        <select value={source} onChange={e => { setSource(e.target.value); setPage(1); }} className="card px-2 py-1.5">
          {SOURCES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <span className="text-[var(--text-dim)] ml-auto">{total} / {builds.length}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {visible.map(b => <BuildCard key={b.id} build={b} />)}
      </div>

      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => setPage(p => p + 1)}
            className="card px-5 py-2 text-sm hover:bg-[#2a2838]"
          >
            加载更多（剩余 {total - visible.length}）
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center text-[var(--text-dim)] py-12">没有符合条件的牌组</div>
      )}
    </div>
  );
}
