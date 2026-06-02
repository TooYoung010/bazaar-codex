import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '大巴扎图鉴 · Bazaar Codex',
  description: '《大巴扎》(The Bazaar) 物品图鉴：按角色分类查询所有物品的获取来源、最早出现天数与牌组。'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="sticky top-0 z-30 backdrop-blur bg-[#0e0d12cc] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
            <Link href="/" className="font-bold text-lg shrink-0">
              <span style={{ color: 'var(--accent)' }}>大巴扎</span>
              <span className="text-[var(--text-dim)] text-sm ml-2 hidden sm:inline">图鉴 · Codex</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-[var(--text-dim)]">
              <Link href="/" className="hover:text-white">物品图鉴</Link>
              <Link href="/builds" className="hover:text-white">牌组</Link>
              <Link href="/ranking" className="hover:text-white">排位查询</Link>
              <Link href="/news" className="hover:text-white">新闻</Link>
            </nav>
            <div className="ml-auto text-xs text-[var(--text-dim)] hidden md:block">数据源：howbazaar.gg · BPP</div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-7xl mx-auto px-4 py-8 text-xs text-[var(--text-dim)]">
          仅供学习交流；游戏数据来自 howbazaar.gg，中文翻译参考 bazaarplusplus.com 与游戏官方简体中文。
        </footer>
      </body>
    </html>
  );
}
