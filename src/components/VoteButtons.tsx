'use client';

import { useEffect, useState } from 'react';
import type { FeedbackCounts, Vote } from '@/lib/types';

const KEY = 'qanunak-votes';

function getLocal(): Record<string, Vote> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { return {}; }
}
function setLocal(id: string, v: Vote | null) {
  const all = getLocal();
  if (v === null) delete all[id]; else all[id] = v;
  localStorage.setItem(KEY, JSON.stringify(all));
}

export default function VoteButtons({ articleId, initial }: { articleId: string; initial: FeedbackCounts }) {
  const [counts, setCounts] = useState<FeedbackCounts>(initial);
  const [mine, setMine] = useState<Vote | null>(null);
  const [pulse, setPulse] = useState<Vote | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setMine(getLocal()[articleId] ?? null); }, [articleId]);

  async function vote(v: Vote) {
    if (busy) return;
    setBusy(true);
    const prev = mine;
    const next: Vote | null = prev === v ? null : v;

    // تحديث فوري في الواجهة
    setMine(next);
    setPulse(next);
    setCounts((c) => {
      const n = { ...c };
      if (prev) n[prev] = Math.max(0, n[prev] - 1);
      if (next) n[next] += 1;
      return n;
    });
    setLocal(articleId, next);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: articleId, vote: next, prev }),
      });
      if (res.ok) {
        const data = (await res.json()) as { counts: FeedbackCounts };
        setCounts(data.counts);
      }
    } catch {
      /* يبقى التقييم محفوظاً محلياً حتى لو تعذّر الاتصال */
    } finally {
      setBusy(false);
      setTimeout(() => setPulse(null), 500);
    }
  }

  return (
    <div className="vote">
      <h5>هل أفادتك هذه المعلومة؟</h5>
      <div className="vote-btns">
        <button
          className={`vbtn ${mine === 'up' ? 'on-up' : ''} ${pulse === 'up' ? 'pulse' : ''}`}
          aria-pressed={mine === 'up'}
          onClick={() => vote('up')}
        >
          👍 نعم، أفادتني <span className="mono">{counts.up}</span>
        </button>
        <button
          className={`vbtn ${mine === 'down' ? 'on-down' : ''} ${pulse === 'down' ? 'pulse' : ''}`}
          aria-pressed={mine === 'down'}
          onClick={() => vote('down')}
        >
          👎 لم تفدني <span className="mono">{counts.down}</span>
        </button>
      </div>
      <p className="vote-note">
        {mine ? 'شكراً لك — سُجِّل تقييمك.' : 'تقييمك يساعدنا على معرفة المواضيع الأكثر فائدة.'}
      </p>
    </div>
  );
}
