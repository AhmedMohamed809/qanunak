import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'قانونك — القوانين البريطانية بالعربية',
  description:
    'القوانين البريطانية مشروحة بالعربية بطريقة بسيطة، ومع كل موضوع رابط المصدر الرسمي من مواقع الحكومة البريطانية.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Tajawal:wght@300;400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <nav className="nav">
          <div className="wrap">
            <Link href="/" className="nav-brand">قانونك</Link>
            <div className="nav-links">
              <Link href="/">الرئيسية</Link>
              <Link href="/#cats">الفئات</Link>
              <Link href="/#results">كل المواضيع</Link>
            </div>
            <form className="nav-search" action="/" method="get" role="search">
              <input type="search" name="q" placeholder="ابحث…" aria-label="ابحث في المواضيع" />
              <button type="submit" aria-label="بحث">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.5" y2="16.5" />
                </svg>
              </button>
            </form>
          </div>
        </nav>

        <div className="disclaimer">
          <div className="wrap">
            <span>⚠</span>
            <span>
              هذه معلومات عامة وليست استشارة قانونية. للحالات الفردية راجع محامياً مرخّصاً أو{' '}
              <span className="mono">Citizens Advice</span>. بعض القوانين تختلف بين إنجلترا
              واسكتلندا وويلز وأيرلندا الشمالية.
            </span>
          </div>
        </div>

        {children}

        <footer className="site-footer">
          <div className="wrap">
            <div className="foot-brand">قانونك</div>
            المحتوى مُعاد صياغته بالعربية من مصادر حكومية بريطانية منشورة تحت{' '}
            <span className="mono">Open Government Licence v3.0</span> مع رابط المصدر الأصلي في كل
            موضوع. القوانين تتغير — اعتمد دائماً على رابط المصدر للتفاصيل النهائية.
            <br />
            معلومات عامة فقط، وليست استشارة قانونية، ولا تنشئ علاقة محامٍ بموكّل.
            <br />
            صور الفئات من{' '}
            <a href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer">
              Wikimedia Commons
            </a>{' '}
            برخص حرة — التفاصيل في <span className="mono">content/IMAGE_CREDITS.md</span>.
          </div>
        </footer>
      </body>
    </html>
  );
}
