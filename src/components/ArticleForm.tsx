'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Article, Category } from '@/lib/types';

const today = () => new Date().toISOString().slice(0, 10);

const empty = (cat: string): Article => ({
  id: '',
  cat,
  hot: false,
  status: 'review',
  checked: today(),
  title: '',
  sub: '',
  body: '<p></p>',
  todo: [''],
  penalty: '',
  terms: [['', '']],
  src: { url: 'https://www.gov.uk/', org: 'GOV.UK' },
  image: null,
});

export default function ArticleForm({
  categories,
  article,
}: {
  categories: Category[];
  article: Article | null;
}) {
  const router = useRouter();
  const isNew = article === null;
  const [a, setA] = useState<Article>(article ?? empty(categories[0]?.id ?? ''));
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof Article>(k: K, v: Article[K]) => setA((p) => ({ ...p, [k]: v }));

  async function save() {
    setBusy(true);
    setMsg(null);
    const res = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(a),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (res.ok) {
      setMsg({ kind: 'ok', text: 'تم الحفظ بنجاح.' });
      if (isNew) router.push(`/admin/edit/${a.id}`);
      router.refresh();
    } else {
      setMsg({ kind: 'err', text: data.error ?? 'تعذّر الحفظ' });
    }
  }

  return (
    <div>
      {msg && <div className={`notice ${msg.kind}`}>{msg.text}</div>}

      <div className="form-grid">
        <label className="field">
          <span>المعرّف (id)</span>
          <input
            className="mono"
            value={a.id}
            onChange={(e) => set('id', e.target.value)}
            disabled={!isNew}
            placeholder="my-new-topic"
          />
          <small>حروف إنجليزية صغيرة وأرقام وشرطات فقط — يظهر في الرابط ولا يتغير لاحقاً.</small>
        </label>

        <label className="field">
          <span>الفئة</span>
          <select value={a.cat} onChange={(e) => set('cat', e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="field full">
          <span>العنوان</span>
          <input value={a.title} onChange={(e) => set('title', e.target.value)} />
        </label>

        <label className="field full">
          <span>الوصف المختصر (يظهر في البطاقة)</span>
          <input value={a.sub} onChange={(e) => set('sub', e.target.value)} />
        </label>

        <label className="field full">
          <span>نص الموضوع (HTML: فقرات &lt;p&gt; و&lt;b&gt; و&lt;ul&gt;)</span>
          <textarea
            className="mono"
            dir="rtl"
            style={{ minHeight: 180, fontFamily: "'IBM Plex Sans Arabic'" }}
            value={a.body}
            onChange={(e) => set('body', e.target.value)}
          />
        </label>

        <label className="field full">
          <span>ما الذي يجب أن تفعله (سطر لكل إجراء)</span>
          <textarea
            value={a.todo.join('\n')}
            onChange={(e) => set('todo', e.target.value.split('\n'))}
          />
        </label>

        <label className="field full">
          <span>العقوبة عند المخالفة (اختياري)</span>
          <textarea style={{ minHeight: 70 }} value={a.penalty} onChange={(e) => set('penalty', e.target.value)} />
        </label>

        <label className="field full">
          <span>المصطلحات (سطر لكل مصطلح بصيغة: English = العربية)</span>
          <textarea
            value={a.terms.map(([en, ar]) => `${en} = ${ar}`).join('\n')}
            onChange={(e) =>
              set(
                'terms',
                e.target.value
                  .split('\n')
                  .map((line) => {
                    const i = line.indexOf('=');
                    if (i < 0) return ['', ''] as [string, string];
                    return [line.slice(0, i).trim(), line.slice(i + 1).trim()] as [string, string];
                  }),
              )
            }
          />
        </label>

        <label className="field">
          <span>رابط المصدر الرسمي</span>
          <input className="mono" value={a.src.url} onChange={(e) => set('src', { ...a.src, url: e.target.value })} />
          <small>إلزامي — يُقبل فقط gov.uk أو legislation.gov.uk أو nhs.uk.</small>
        </label>

        <label className="field">
          <span>جهة المصدر</span>
          <input value={a.src.org} onChange={(e) => set('src', { ...a.src, org: e.target.value })} placeholder="GOV.UK — DVLA" />
        </label>

        <label className="field">
          <span>تاريخ آخر مراجعة</span>
          <input type="date" className="mono" value={a.checked} onChange={(e) => set('checked', e.target.value)} />
        </label>

        <label className="field">
          <span>الحالة</span>
          <select value={a.status} onChange={(e) => set('status', e.target.value as Article['status'])}>
            <option value="verified">مُتحقَّق (راجعتُ المصدر بهذا التاريخ)</option>
            <option value="review">راجع المصدر</option>
          </select>
        </label>

        <label className="field">
          <span>رابط صورة الموضوع (اختياري)</span>
          <input className="mono" value={a.image ?? ''} onChange={(e) => set('image', e.target.value || null)} placeholder="https://..." />
          <small>عند تركه فارغاً تُعرض أيقونة الفئة تلقائياً. استخدم صوراً تملك حق استخدامها.</small>
        </label>

        <label className="field" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 28 }}>
          <input type="checkbox" style={{ width: 'auto' }} checked={a.hot} onChange={(e) => set('hot', e.target.checked)} />
          <span style={{ margin: 0 }}>ضمن «الأكثر شيوعاً»</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn" onClick={save} disabled={busy}>{busy ? '...' : 'حفظ'}</button>
        <button className="btn ghost" onClick={() => router.push('/admin')}>رجوع</button>
      </div>
    </div>
  );
}
