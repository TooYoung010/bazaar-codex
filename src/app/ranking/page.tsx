import { getTopEntries, getSeasons } from '@/lib/mrmao';
import RankingClient from '@/components/RankingClient';

// Revalidate the page every 5 minutes
export const revalidate = 300;

export default async function RankingPage() {
  const [topEntries, seasons] = await Promise.all([
    getTopEntries(200).catch(() => []),
    getSeasons().catch(() => [])
  ]);
  const currentSeason = seasons[0];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">排位查询</h1>
      <p className="text-[var(--text-dim)] text-sm mb-6">
        传奇段位榜单 ·
        {currentSeason && (
          <span className="ml-1">{currentSeason.name}（{currentSeason.startTime.split(' ')[0]} 起）</span>
        )}
        <span className="ml-1">· 数据来源：bazaar.mrmao.life</span>
      </p>
      <RankingClient topEntries={topEntries} />
    </div>
  );
}
