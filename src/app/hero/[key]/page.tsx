import { notFound } from 'next/navigation';
import Link from 'next/link';
import { heroes, getItemsByHero, getHero } from '@/lib/data';
import ItemGrid from '@/components/ItemGrid';

export function generateStaticParams() {
  return heroes.map(h => ({ key: h.key }));
}

export default async function HeroPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const hero = getHero(key);
  if (!hero) return notFound();
  const items = getItemsByHero(key);

  return (
    <div>
      <nav className="text-xs text-[var(--text-dim)] mb-3">
        <Link href="/" className="hover:text-white">首页</Link>
        <span className="mx-1">/</span>
        <span>{hero.name}</span>
      </nav>
      <h1 className="text-2xl font-bold mb-1">
        {hero.title && <span className="text-base text-[var(--text-dim)] mr-2 font-normal">{hero.title}</span>}
        {hero.name}
        <span className="text-base text-[var(--text-dim)] ml-2 font-normal">{hero.nameEn}</span>
      </h1>
      <p className="text-sm text-[var(--text-dim)] mb-6">共 {hero.itemCount} 个物品</p>
      <ItemGrid items={items} />
    </div>
  );
}
