import { NextRequest, NextResponse } from 'next/server';

// حماية لوحة التحكم وواجهاتها. التحقق الكامل من الرمز يتم في الخادم
// (auth.ts يستخدم crypto غير المتاح في الـ Edge)، وهنا نتحقق من وجود الجلسة فقط
// ثم تتحقق مسارات /api/admin من صحتها فعلياً.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === '/admin/login' || pathname === '/api/admin/login';
  if (isLogin) return NextResponse.next();

  const token = req.cookies.get('qanunak_admin')?.value;
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
