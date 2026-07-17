'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { ContentFile, FeedbackFile } from '@/lib/types';
import TopicArt from './TopicArt';

const plural = (n: number) => (n === 1 ? 'موضوع واحد' : n === 2 ? 'موضوعان' : `${n} مواضيع`);

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

export default function HomeClient({ content, feedback }: { content: ContentFile; feedback: FeedbackFile }) {
  const { categories, articles } = content;
  const [q, setQ] = useState('');
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
        <div className="stats" style={{ marginTop: 22 }}>
          <div className="stat"><CountUp target={articles.length} /><span>موضوعاً</span></div>
          <div className="stat"><CountUp target={categories.length} /><span>فئات</span></div>
          <div className="stat"><CountUp target={totalHelped} /><span>قالوا «أفادتني»</span></div>
        </div>
        <div className="search" style={{ marginTop: 18 }}>
          <input
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setCat(null); }}
            placeholder="ابحث… مثال: رخصة قيادة، إيجار، مدرسة، ضمان"
            aria-label="بحث في المواضيع"
          />
        </div>

        <section>
          <div className="eyebrow">الأكثر شيوعاً / Most asked</div>
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

        <section>
          <div className="eyebrow">الفئات / Categories</div>
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

        <section>
          <div className="eyebrow">
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
