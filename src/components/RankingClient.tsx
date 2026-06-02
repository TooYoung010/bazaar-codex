'use client';
import { useEffect, useState } from 'react';
import type { LeaderboardEntry } from '@/lib/mrmao';

const HERO_FILTER = [
  { code: 'all', label: '全部角色' },
  { code: 'v', label: '凡妮莎' },
  { code: 'd', label: '杜利' },
  { code: 'p', label: '皮格马利安' },
  { code: 'm', label: '马克' },
  { code: 'j', label: '朱尔斯' },
  { code: 's', label: '斯黛拉' },
  { code: 'k', label: '卡诺克' }
];

const HERO_NAME: Record<string, string> = {
  v: '凡妮莎', d: '杜利', p: '皮格马利安', m: '马克',
  j: '朱尔斯', s: '斯黛拉', k: '卡诺克',
  '未知': '未知'
};

function heroLabel(code: string): string {
  return HERO_NAME[code] || code || '未知';
}

interface Props {
  topEntries: LeaderboardEntry[];
}

export default function RankingClient({ topEntries }: Props) {
  const [q, setQ] = useState('');
  const [hero, setHero] = useState('all');
  const [searchResults, setSearchResults] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(0);

  // Debounced search
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setSearchResults(null);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/ranking/search?q=${encodeURIComponent(term)}&maxPages=20`);
        const data = await res.json();
        setSearchResults(data.items || []);
        setScanned(data.scannedPages || 0);
      } catch {
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const baseList = searchResults ?? topEntries;
  const visible = baseList.filter(e => hero === 'all' || e.mainClass === hero);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="按用户名搜索（至少 2 字符）..."
          className="card px-3 py-1.5 outline-none focus:ring-1 focus:ring-amber-400 min-w-[260px]"
        />
        <select value={hero} onChange={e => setHero(e.target.value)} className="card px-2 py-1.5">
          {HERO_FILTER.map(h => <option key={h.code} value={h.code}>{h.label}</option>)}
        </select>
        <span className="text-[var(--text-dim)] ml-auto">
          {loading ? '搜索中…' :
           searchResults ? `搜索结果：${visible.length} 条 (扫描 ${scanned * 100} 名)` :
           `当前赛季前 ${visible.length} 名`}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="card p-8 text-center text-[var(--text-dim)] text-sm">
          {searchResults ? '未找到匹配的玩家。可尝试更短关键词，或上传完整用户名后再过滤角色。' : '加载中…'}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-soft)] text-[var(--text-dim)] text-xs">
              <tr>
                <th className="text-right p-2 w-16">#</th>
                <th className="text-left p-2">玩家</th>
                <th className="text-center p-2 w-28">主玩角色</th>
                <th className="text-right p-2 w-20">分数</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((e, idx) => {
                const pos = e.position ?? idx + 1;
                return (
                  <tr key={`${e.username}-${idx}`} className="border-t border-[var(--border)] hover:bg-[#2a2838]">
                    <td className="text-right p-2 text-[var(--text-dim)] tabular-nums">
                      {pos <= 3 ? <span className="text-amber-300 font-bold">{pos}</span> : pos}
                    </td>
                    <td className="p-2 font-medium">{e.username}</td>
                    <td className="text-center p-2 text-xs text-[var(--text-dim)]">
                      {heroLabel(e.mainClass)}
                    </td>
                    <td className="text-right p-2 font-bold text-amber-300 tabular-nums">{e.rating}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
