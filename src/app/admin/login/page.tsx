'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit() {
    setBusy(true);
    setErr('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) router.push('/admin');
    else setErr('كلمة المرور غير صحيحة');
  }

  return (
    <div className="wrap" style={{ maxWidth: 420, padding: '48px 18px' }}>
      <h2 style={{ fontFamily: "'Readex Pro',sans-serif", marginBottom: 18 }}>لوحة التحكم</h2>
      {err && <div className="notice err">{err}</div>}
      <label className="field">
        <span>كلمة المرور</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoFocus
        />
      </label>
      <button className="btn" onClick={submit} disabled={busy || !password}>
        {busy ? '...' : 'دخول'}
      </button>
    </div>
  );
}
