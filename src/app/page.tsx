import Link from 'next/link';
import { heroes, getLatestBuilds, getTopBuilds, items, builds } from '@/lib/data';
import BuildCard from '@/components/BuildCard';

export default function HomePage() {
  const latestBuilds = getLatestBuilds(8);
  const topBuilds = getTopBuilds(8);

  return (
    <div className="space-y-10">
      {/* Hero band */}
      <section>
        <h1 className="text-3xl font-bold mb-2">大巴扎图鉴</h1>
        <p className="text-[var(--text-dim)] text-sm">
          <strong className="text-white">{items.length}</strong> 个物品 ·
          <strong className="text-white ml-1">{builds.length}</strong> 套实战牌组 ·
          官方简体中文 · 商店来源 · 出现天数 · 排位查询
        </p>
      </section>

      {/* Hero selector */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold">选择角色</h2>
          <span className="text-xs text-[var(--text-dim)]">8 位英雄 + 中立</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {heroes.map(h => (
            <Link
              key={h.key}
              href={`/hero/${h.key}`}
              className="card p-4 hover:bg-[#2a2838] transition flex items-center justify-between"
            >
              <div className="min-w-0">
                <div className="font-medium text-base truncate">
                  {h.title && <span className="text-xs text-[var(--text-dim)] mr-1.5">{h.title}</span>}
                  {h.name}
                </div>
                <div className="text-xs text-[var(--text-dim)] mt-0.5">{h.nameEn}</div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{h.itemCount}</div>
                <div className="text-[10px] text-[var(--text-dim)]">物品</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top builds */}
      {topBuilds.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-lg font-semibold">高战绩牌组</h2>
            <Link href="/builds" className="text-xs text-amber-300 hover:underline">查看全部 →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {topBuilds.map(b => <BuildCard key={b.id} build={b} />)}
          </div>
        </section>
      )}

      {/* Latest builds */}
      {latestBuilds.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-lg font-semibold">最新牌组</h2>
            <Link href="/builds" className="text-xs text-amber-300 hover:underline">查看全部 →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {latestBuilds.map(b => <BuildCard key={b.id} build={b} />)}
          </div>
        </section>
      )}
    </div>
  );
}
