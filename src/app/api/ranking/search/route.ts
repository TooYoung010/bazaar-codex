import { NextRequest, NextResponse } from 'next/server';
import { searchByUsername } from '@/lib/mrmao';

// GET /api/ranking/search?q=foo
// Searches the mrmao leaderboard for usernames containing the query.
// Note: mrmao's API has no native search, so we walk pages server-side
// (cached by Next's fetch ISR for 5 min per page).
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  if (q.trim().length < 2) {
    return NextResponse.json({ items: [], message: '请输入至少 2 个字符' });
  }
  // Default: scan top 1000 (10 pages × 100). Configurable via maxPages query.
  const maxPages = Math.min(parseInt(req.nextUrl.searchParams.get('maxPages') || '20'), 50);
  const items = await searchByUsername(q, maxPages, 100);
  return NextResponse.json({ items, scannedPages: maxPages, query: q });
}
