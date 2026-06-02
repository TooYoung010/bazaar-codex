import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getNewsById } from '@/lib/news';

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const n = await getNewsById(decodeURIComponent(id));
  if (!n) return notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-xs text-[var(--text-dim)] mb-3">
        <Link href="/" className="hover:text-white">首页</Link>
        <span className="mx-1">/</span>
        <Link href="/news" className="hover:text-white">新闻</Link>
        <span className="mx-1">/</span>
        <span className="truncate">{n.title}</span>
      </nav>

      <header className="mb-6">
        <div className="flex items-center gap-2 flex-wrap mb-3 text-xs">
          <span className="px-2 py-0.5 rounded font-medium bg-sky-500/80 text-white">
            {n.sourceLabel}
          </span>
          {n.category && <span className="text-amber-300">{n.category}</span>}
          <span className="text-[var(--text-dim)]">{n.date.slice(0, 10)}</span>
          {n.author && <span className="text-[var(--text-dim)]">@ {n.author}</span>}
        </div>
        <h1 className="text-3xl font-bold leading-tight">{n.title}</h1>
        {n.image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={n.image} alt={n.title} className="w-full mt-4 rounded-lg" />
        )}
      </header>

      <article
        className="news-body prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: n.bodyHtml }}
      />

      <div className="mt-8 pt-4 border-t border-[var(--border)] text-sm">
        <a
          href={n.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-300 hover:underline"
        >
          查看原文 →
        </a>
      </div>
    </div>
  );
}
