import { builds } from '@/lib/data';
import BuildBrowser from '@/components/BuildBrowser';

export default function BuildsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">牌组</h1>
      <p className="text-[var(--text-dim)] text-sm mb-6">
        共 <strong className="text-white">{builds.length}</strong> 套来自 bazaar-builds.net 的实战牌组（含战绩、作者、原文链接），按角色 / 战绩筛选
      </p>
      <BuildBrowser builds={builds} />
    </div>
  );
}
