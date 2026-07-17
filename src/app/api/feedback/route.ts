import { NextRequest, NextResponse } from 'next/server';
import { getArticle, recordVote } from '@/lib/store';
import type { Vote } from '@/lib/types';

const VALID: (Vote | null)[] = ['up', 'down', null];

export async function POST(req: NextRequest) {
  let body: { id?: string; vote?: Vote | null; prev?: Vote | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }
  const { id, vote = null, prev = null } = body;
  if (!id || !VALID.includes(vote) || !VALID.includes(prev)) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const article = await getArticle(id);
  if (!article) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const fb = await recordVote(id, vote, prev);
  return NextResponse.json({ counts: fb[id] });
}
