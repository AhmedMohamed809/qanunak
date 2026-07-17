import Link from 'next/link';
import { getContent, getFeedback } from '@/lib/store';
import DeleteButton from '@/components/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [content, feedback] = await Promise.all([getContent(), getFeedback()]);
  const { categories, articles } = content;
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  const totalUp = Object.values(feedback).reduce((s, f) => s + f.up, 0);
  const totalDown = Object.values(feedback).reduce((s, f) => s + f.down, 0);

  return (
    <div className="wrap" style={{ padding: '30px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: "'Readex Pro',sans-serif" }}>لوحة التحكم</h2>
        <Link href="/admin/edit/new" className="btn">+ موضوع جديد</Link>
      </div>

      <div className="stats" style={{ margin: '16px 0 22px' }}>
        <div className="stat"><b style={{ color: 'var(--ink)' }}>{articles.length}</b><span>موضوعاً</span></div>
        <div className="stat"><b style={{ color: 'var(--sign)' }}>{totalUp} 👍</b><span>إجمالي «أفادتني»</span></div>
        <div className="stat"><b style={{ color: 'var(--alert)' }}>{totalDown} 👎</b><span>إجمالي «لم تفدني»</span></div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>الموضوع</th>
            <th>الفئة</th>
            <th>الحالة</th>
            <th>آخر مراجعة</th>
            <th>👍</th>
            <th>👎</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => {
            const fb = feedback[a.id] ?? { up: 0, down: 0 };
            return (
              <tr key={a.id}>
                <td>
                  <Link href={`/law/${a.id}`} style={{ textDecoration: 'none', fontWeight: 500 }}>
                    {a.title}
                  </Link>
                  {a.hot && <span className="chip hot" style={{ marginInlineStart: 6 }}>شائع</span>}
                </td>
                <td>{catName(a.cat)}</td>
                <td>{a.status === 'verified'
                  ? <span className="chip new">مُتحقَّق</span>
                  : <span className="chip">راجع المصدر</span>}
                </td>
                <td className="mono">{a.checked}</td>
                <td>{fb.up}</td>
                <td>{fb.down}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <Link href={`/admin/edit/${a.id}`} className="btn ghost" style={{ padding: '5px 12px', fontSize: 12.5 }}>تعديل</Link>{' '}
                  <DeleteButton id={a.id} title={a.title} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
