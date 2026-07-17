'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { ContentFile, FeedbackFile } from '@/lib/types';
import TopicArt from './TopicArt';

const plural = (n: number) => (n === 1 ? 'موضوع واحد' : n === 2 ? 'موضوعان' : `${n} مواضيع`);

/* أيقونات أصلية بسيطة (خط موحّد، تَرِث اللون) */
const Icons = {
  topics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  categories: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
  helped: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" />
      <path d="M7 11l4-7a2 2 0 0 1 2.7 2.6L12.5 10H19a2 2 0 0 1 2 2.3l-1.1 6A2 2 0 0 1 17.9 20H7" />
    </svg>
  ),
  hot: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-1.4.6-2.7 1.4-3.7C9 10 9.5 11 10 11.5 10 9 11 5 12 3z" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.4" /><circle cx="18" cy="6" r="2.4" />
      <circle cx="6" cy="18" r="2.4" /><circle cx="18" cy="18" r="2.4" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  ),
};

function CountUp({ target }: { target: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(target); return; }
    const step = Math.max(1, Math.round(target / 24));
    const t = setInterval(() => setN((v) => {
      const next = Math.min(target, v + step);
      if (next >= target) clearInterval(t);
      return next;
    }), 40);
    return () => clearInterval(t);
  }, [target]);
  return <b>{n}</b>;
}

export default function HomeClient({
  content,
  feedback,
  initialQ = '',
}: {
  content: ContentFile;
  feedback: FeedbackFile;
  initialQ?: string;
}) {
  const { categories, articles } = content;
  const [q, setQ] = useState(initialQ);
  const [cat, setCat] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return articles.filter((a) => {
      const okCat = !cat || a.cat === cat;
      if (!okCat) return false;
      if (!needle) return true;
      const hay = `${a.title} ${a.sub} ${a.body} ${a.terms.flat().join(' ')}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [articles, q, cat]);

  // كشف تدريجي عند التمرير
  useEffect(() => {
    const els = listRef.current?.querySelectorAll<HTMLElement>('.card.reveal');
    if (!els?.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); }
      }),
      { threshold: 0.08 },
    );
    els.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 45, 240)}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, [rows]);

  const totalHelped = Object.values(feedback).reduce((s, f) => s + f.up, 0);

  return (
    <>
      <div className="wrap">
        <section className="hero">
          <h1 className="hero-title">
            اعرف <span className="accent">حقوقك</span> في بريطانيا — بالعربية، ببساطة
          </h1>
          <p className="tag">
            القوانين البريطانية مشروحة بالعربية بطريقة بسيطة، ومع كل موضوع رابط المصدر الرسمي من
            مواقع الحكومة البريطانية وتاريخ آخر مراجعة.
          </p>

          <div className="stats">
            <div className="stat">
              <span className="stat-ic">{Icons.topics}</span>
              <div><CountUp target={articles.length} /><span>موضوعاً</span></div>
            </div>
            <div className="stat">
              <span className="stat-ic">{Icons.categories}</span>
              <div><CountUp target={categories.length} /><span>فئات</span></div>
            </div>
            <div className="stat">
              <span className="stat-ic">{Icons.helped}</span>
              <div><CountUp target={totalHelped} /><span>قالوا «أفادتني»</span></div>
            </div>
          </div>

          <div className="search">
            <input
              type="search"
              value={q}
              onChange={(e) => { setQ(e.target.value); setCat(null); }}
              placeholder="ابحث… مثال: رخصة قيادة، إيجار، لجوء، Universal Credit"
              aria-label="بحث في المواضيع"
            />
          </div>
        </section>

        <section>
          <div className="eyebrow"><span className="eyebrow-ic">{Icons.hot}</span>الأكثر شيوعاً / Most asked</div>
          <div className="pop-row">
            {articles.filter((a) => a.hot).map((a) => (
              <Link key={a.id} href={`/law/${a.id}`} className="pop">
                <TopicArt id={a.id} cat={a.cat} image={a.image} title={a.title} size="card" />
                <div>
                  <span className="k">{catName(a.cat)}</span>
                  <h3>{a.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="cats">
          <div className="eyebrow"><span className="eyebrow-ic">{Icons.grid}</span>الفئات / Categories</div>
          <div className="cats">
            {categories.map((c) => {
              const n = articles.filter((a) => a.cat === c.id).length;
              return (
                <button
                  key={c.id}
                  className={`plate ${cat === c.id ? '' : 'off'}`}
                  onClick={() => { setCat(cat === c.id ? null : c.id); setQ(''); }}
                >
                  <div className="cat-name">{c.name}</div>
                  <div className="cat-count">{plural(n)}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section id="results">
          <div className="eyebrow">
            <span className="eyebrow-ic">{cat ? Icons.grid : q ? Icons.search : Icons.list}</span>
            {cat ? catName(cat) : q ? 'نتائج البحث' : 'كل المواضيع'}
          </div>
          <div ref={listRef}>
            {rows.length === 0 && (
              <p className="empty">لا توجد نتائج. جرّب كلمة أبسط — مثل «رخصة» أو «طفل» أو «إيجار».</p>
            )}
            {rows.map((a) => {
              const fb = feedback[a.id];
              return (
                <Link key={a.id} href={`/law/${a.id}`} className="card reveal">
                  <TopicArt id={a.id} cat={a.cat} image={a.image} title={a.title} size="card" />
                  <div>
                    <h3>{a.title}</h3>
                    <p>{a.sub}</p>
                    <div className="meta">
                      <span className="chip">{catName(a.cat)}</span>
                      {a.hot && <span className="chip hot">الأكثر شيوعاً</span>}
                      {a.status === 'verified'
                        ? <span className="chip new">مُتحقَّق {a.checked}</span>
                        : <span className="chip">راجع المصدر</span>}
                      {fb && fb.up > 0 && <span className="chip">👍 {fb.up}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
