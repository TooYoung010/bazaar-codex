import { notFound } from 'next/navigation';
import Link from 'next/link';
import { items, getItemBySlug, getBuildsForItem, slug } from '@/lib/data';
import ItemHero from '@/components/ItemHero';
import BuildCard from '@/components/BuildCard';

export function generateStaticParams() {
  return items.map(i => ({ slug: slug(i.name) }));
}

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: s } = await params;
  const item = getItemBySlug(s);
  if (!item) return notFound();
  const relatedBuilds = getBuildsForItem(item.id, 24);

  return (
    <div>
      <nav className="text-xs text-[var(--text-dim)] mb-3">
        <Link href="/" className="hover:text-white">首页</Link>
        <span className="mx-1">/</span>
        <Link href={`/hero/${item.heroKey}`} className="hover:text-white">{item.heroPrimaryCn}</Link>
        <span className="mx-1">/</span>
        <span>{item.nameDisplay}</span>
      </nav>

      <header className={`card p-5 mb-6 flex items-start gap-5 flex-wrap sm:flex-nowrap ring-${item.startingTier}`}>
        <ItemHero item={item} />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-tight">{item.nameDisplay}</h1>
          {item.nameCn && (
            <div className="text-sm text-[var(--text-dim)] mt-1">{item.name}</div>
          )}
          <div className="flex items-center gap-2 flex-wrap text-sm mt-3">
            <span className={`tier-${item.startingTier} font-medium`}>{item.startingTierCn}</span>
            <span className="text-[var(--text-dim)]">·</span>
            <span>{item.heroPrimaryCn}</span>
            <span className="text-[var(--text-dim)]">·</span>
            <span>尺寸：{item.sizeCn}</span>
            {item.dataSource !== 'inferred' && (
              <>
                <span className="text-[var(--text-dim)]">·</span>
                <span className="text-amber-300">第 {item.earliestDay} 天起可获得</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 flex-wrap mt-3">
            {item.tags.map(t => <span key={t} className="chip">{t}</span>)}
            {item.hiddenTags.map(t => <span key={t} className="chip opacity-60">#{t}</span>)}
          </div>
        </div>
      </header>

      {item.dataSource === 'inferred' && (
        <div className="card p-3 mb-6 text-xs text-[var(--text-dim)] border-l-4 border-l-amber-400">
          <strong className="text-amber-300">数据补充说明：</strong>
          此物品由社区牌组反推识别（{item.inferredFrom}）。
          名称、中文翻译、图标、所属角色为可信数据，
          但<strong>各品级效果、商店来源、出现天数</strong>等字段暂缺，
          需等待 howbazaar.gg 数据源更新。
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Effects per tier */}
        <section className="card p-5">
          <h2 className="text-base font-semibold mb-3">各品级效果</h2>
          <div className="space-y-3">
            {item.tierData.map(td => (
              <div key={td.tier}>
                <div className={`text-sm font-medium mb-1 tier-${td.tier}`}>{td.tierCn}</div>
                <ul className="text-sm space-y-1 text-[var(--text)]">
                  {td.tooltips.map((t, i) => (
                    <li key={i} className="leading-relaxed">{t}</li>
                  ))}
                </ul>
              </div>
            ))}
            {item.tierData.length === 0 && (
              <div className="text-sm text-[var(--text-dim)]">
                {item.dataSource === 'inferred'
                  ? '该物品的效果数据暂未收录（数据源 howbazaar.gg 未更新该物品）'
                  : '暂无效果数据'}
              </div>
            )}
          </div>
        </section>

        {/* Sources */}
        <section className="card p-5">
          <h2 className="text-base font-semibold mb-3">
            获取来源 <span className="text-xs text-[var(--text-dim)] font-normal">商店 / 事件</span>
          </h2>
          {item.sources.length === 0 ? (
            <div className="text-sm text-[var(--text-dim)]">
              {item.dataSource === 'inferred'
                ? '商店来源数据暂未收录（参考下方"相关牌组"了解实战使用）'
                : '无固定商店来源（可能仅由特殊事件 / 怪物掉落）'}
            </div>
          ) : (
            <ul className="space-y-2 text-sm">
              {item.sources.map(src => (
                <li key={src.id} className="flex items-baseline gap-2">
                  <span className="font-medium text-amber-200 shrink-0">{src.name}</span>
                  <span className="text-[var(--text-dim)] text-xs">{src.description}</span>
                </li>
              ))}
            </ul>
          )}

          {item.combatEncounters.length > 0 && (
            <>
              <h3 className="text-sm font-semibold mt-4 mb-2">出现于战斗事件</h3>
              <ul className="text-sm space-y-1 text-[var(--text-dim)]">
                {item.combatEncounters.map((c, i) => (
                  <li key={i}>{c.name}{c.day ? ` · 第 ${c.day} 天` : ''}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      {/* Enchantments */}
      {item.enchantments.length > 0 && (
        <section className="card p-5 mt-6">
          <h2 className="text-base font-semibold mb-3">附魔变体</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {item.enchantments.map(e => (
              <div key={e.type} className="bg-[var(--bg-soft)] rounded p-3 border border-[var(--border)]">
                <div className="font-medium text-amber-200 mb-1">{e.type}</div>
                <ul className="text-xs space-y-0.5 text-[var(--text)]">
                  {e.tooltips.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related builds */}
      <section className="card p-5 mt-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold">
            相关牌组 <span className="text-xs text-[var(--text-dim)] font-normal">围绕此物品构筑</span>
          </h2>
          {relatedBuilds.length > 0 && (
            <Link href={`/builds?item=${encodeURIComponent(item.name)}`} className="text-xs text-amber-300 hover:underline">
              共 {relatedBuilds.length}+ 套
            </Link>
          )}
        </div>
        {relatedBuilds.length === 0 ? (
          <div className="text-sm text-[var(--text-dim)]">
            暂无围绕此物品的牌组（前往 <Link href="/builds" className="text-amber-300 hover:underline">牌组库</Link> 查看全部）
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {relatedBuilds.map(b => <BuildCard key={b.id} build={b} />)}
          </div>
        )}
      </section>
    </div>
  );
}
