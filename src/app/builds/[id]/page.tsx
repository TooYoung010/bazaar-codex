import { notFound } from 'next/navigation';
import Link from 'next/link';
import { builds, getBuildById, getItemById } from '@/lib/data';
import ItemCard from '@/components/ItemCard';

// Pre-generate only the most recent / popular builds at build time.
// Others are rendered on-demand (Incremental Static Regeneration).
export const dynamicParams = true;

export function generateStaticParams() {
  // Only pre-render the 200 newest builds — keeps build fast and
  // serverless function bundle small. Others render on first request.
  return builds.slice(0, 200).map(b => ({ id: b.id }));
}

export default async function BuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const build = getBuildById(id);
  if (!build) return notFound();

  const buildItems = build.itemIds
    .map(iid => getItemById(iid))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));
  const coreItem = build.coreItemId ? getItemById(build.coreItemId) : null;

  const sourceLabel = build.dataSource === 'bazaarforge' ? 'bazaarforge.gg（活跃）' :
                      build.dataSource === 'bazaar-builds' ? 'bazaar-builds.net（历史归档）' :
                      '社区';

  // Forge-specific match stats
  const hasMatchStats =
    build.wins !== null && build.wins !== undefined ||
    build.maxHealth || build.level || build.gold;

  return (
    <div>
      <nav className="text-xs text-[var(--text-dim)] mb-3">
        <Link href="/" className="hover:text-white">首页</Link>
        <span className="mx-1">/</span>
        <Link href="/builds" className="hover:text-white">牌组</Link>
        <span className="mx-1">/</span>
        <span className="truncate">{build.name}</span>
      </nav>

      <header className="card overflow-hidden mb-6">
        {build.image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={build.image}
            alt={build.name}
            className="w-full max-h-[400px] object-cover"
          />
        )}
        <div className="p-5">
          <div className="flex items-baseline gap-3 flex-wrap mb-2">
            {build.result && (
              <span className="px-2 py-0.5 rounded text-sm font-bold bg-amber-500/90 text-black">
                {build.result}
              </span>
            )}
            <span className="chip">{build.heroName}</span>
            {build.dataSource === 'bazaarforge' && (
              <span className="chip text-emerald-300 border-emerald-700">FORGE · 活跃源</span>
            )}
            <span className="text-xs text-[var(--text-dim)]">
              {build.author ? `作者 @${build.author}` : '匿名'}
              {build.createdAt && ` · ${build.createdAt.split('T')[0]}`}
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight">{build.name}</h1>
          {build.description && (
            <p className="text-sm text-[var(--text-dim)] mt-2 whitespace-pre-line">{build.description}</p>
          )}

          {hasMatchStats && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {build.wins !== null && build.wins !== undefined && (
                <Stat label="胜场" value={`${build.wins}W`} highlight />
              )}
              {build.maxHealth && <Stat label="最大生命" value={String(build.maxHealth)} />}
              {build.level && <Stat label="等级" value={String(build.level)} />}
              {build.gold && <Stat label="金币" value={String(build.gold)} />}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3 text-xs text-[var(--text-dim)]">
            <span>数据源：{sourceLabel}</span>
            <a
              href={build.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:underline"
            >
              查看原文 →
            </a>
          </div>
        </div>
      </header>

      {coreItem && (
        <section className="card p-5 mb-6">
          <h2 className="text-base font-semibold mb-3">核心物品</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <ItemCard item={coreItem} />
          </div>
        </section>
      )}

      <section className="card p-5">
        <h2 className="text-base font-semibold mb-1">
          牌组物品 <span className="text-xs text-[var(--text-dim)] font-normal">{buildItems.length} 件</span>
        </h2>
        <p className="text-xs text-[var(--text-dim)] mb-3">
          {buildItems.length === 0
            ? '此牌组未关联具体物品（点击下方原文链接查看完整截图）'
            : build.dataSource === 'bazaarforge'
              ? '由 bazaarforge.gg 上传时直接选择的物品（精确匹配）'
              : '根据原文 WP 标签自动提取的关联物品'}
        </p>
        {buildItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {buildItems.map(it => <ItemCard key={it.id} item={it} />)}
          </div>
        ) : (
          <div className="text-sm text-[var(--text-dim)]">
            <a href={build.link} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline">
              前往原站查看完整牌组 →
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-[var(--bg-soft)] rounded p-2.5 border border-[var(--border)]">
      <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${highlight ? 'text-amber-300' : ''}`}>{value}</div>
    </div>
  );
}
