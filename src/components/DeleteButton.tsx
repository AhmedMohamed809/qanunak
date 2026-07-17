'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm(`حذف «${title}» نهائياً؟`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/articles?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert('تعذّر الحذف');
  }

  return (
    <button className="btn danger" style={{ padding: '5px 12px', fontSize: 12.5 }} onClick={remove} disabled={busy}>
      حذف
    </button>
  );
}
