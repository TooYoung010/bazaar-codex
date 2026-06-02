import Link from 'next/link';
import { getAllNews } from '@/lib/news';

// Refresh news every hour
export const revalidate = 3600;

const SOURCE_COLOR: Record<string, string> = {
  steam: 'bg-sky-500/80 text-white',
  'bazaar-builds': 'bg-amber-500/80 text-black',
  bazaarforge: 'bg-emerald-500/80 text-black'
};

const CATEGORY_COLOR: Record<string, string> = {
  '补丁': 'text-rose-300',
  '活动': 'text-fuchsia-300',
  '公告': 'text-sky-300',
  '社区': 'text-amber-300',
  '站点更新': 'text-emerald-300'
};

export default async function NewsPage() {
  const news = await getAllNews();
  const todayItems = news.filter(n => {
    const today = new Date().toISOString().slice(0, 10);
    return n.date.slice(0, 10) === today;
  });
  const latestSteam = news.find(n => n.source === 'steam');

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="text-2xl font-bold">官方新闻 & 社区动态</h1>
        <span className="text-xs text-[var(--text-dim)]">每小时自动更新</span>
      </div>
      <p className="text-[var(--text-dim)] text-sm mb-6">
        汇总 Steam 官方公告（最权威）· bazaar-builds.net 社区报道 · bazaarforge 站点更新
        {latestSteam && (
          <span className="ml-2">· 最新官方：<strong className="text-white">{latestSteam.title}</strong>（{latestSteam.date.slice(0, 10)}）</span>
        )}
      </p>

      {todayItems.length > 0 && (
        <div className="mb-4 text-xs text-emerald-300">
          🎉 今天有 {todayItems.length} 条新更新
        </div>
      )}

      <div className="space-y-3">
        {news.map(n => (
          <Link
            key={n.id}
            href={`/news/${encodeURIComponent(n.id)}`}
            className="card flex flex-col md:flex-row gap-4 p-4 hover:bg-[#2a2838] transition"
          >
            {n.image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={n.image}
                alt={n.title}
                loading="lazy"
                className="w-full md:w-44 md:h-24 h-32 object-cover rounded shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5 text-xs">
                <span className={`px-2 py-0.5 rounded font-medium ${SOURCE_COLOR[n.source] || 'bg-zinc-500/80'}`}>
                  {n.sourceLabel}
                </span>
                {n.category && (
                  <span className={CATEGORY_COLOR[n.category] || 'text-[var(--text-dim)]'}>
                    {n.category}
                  </span>
                )}
                <span className="text-[var(--text-dim)]">·</span>
                <span className="text-[var(--text-dim)]">{n.date.slice(0, 10)}</span>
                {n.author && (
                  <>
                    <span className="text-[var(--text-dim)]">·</span>
                    <span className="text-[var(--text-dim)]">{n.author}</span>
                  </>
                )}
              </div>
              <h2 className="font-semibold text-base leading-snug mb-1">{n.title}</h2>
              <p className="text-xs text-[var(--text-dim)] line-clamp-2">{n.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>

      {news.length === 0 && (
        <div className="card p-8 text-center text-[var(--text-dim)] text-sm">
          暂无新闻数据（数据源不可达，请稍后重试）
        </div>
      )}
    </div>
  );
}
