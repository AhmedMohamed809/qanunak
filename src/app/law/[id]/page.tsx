import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticle, getContent, getArticleFeedback } from '@/lib/store';
import TopicArt from '@/components/TopicArt';
import VoteButtons from '@/components/VoteButtons';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const a = await getArticle(params.id);
  if (!a) return { title: 'غير موجود — قانونك' };
  return { title: `${a.title} — قانونك`, description: a.sub };
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const [a, content, counts] = await Promise.all([
    getArticle(params.id),
    getContent(),
    getArticleFeedback(params.id),
  ]);
  if (!a) notFound();

  const catName = content.categories.find((c) => c.id === a.cat)?.name ?? a.cat;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.sub,
    inLanguage: 'ar',
    dateModified: a.checked,
    isBasedOn: a.src.url,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="doc-top">
        <div className="wrap">
          <div className="crumbs">
            <Link href="/">قانونك</Link> ← {catName}
          </div>
          <div className="doc-hero">
            <TopicArt id={a.id} cat={a.cat} image={a.image} title={a.title} size="hero" />
            <h2>{a.title}</h2>
          </div>
        </div>
      </div>

      <div className="wrap doc-body">
        {/* المحتوى يُدار من لوحة التحكم فقط */}
        <div dangerouslySetInnerHTML={{ __html: a.body }} />

        <h4>ما الذي يجب أن تفعله</h4>
        <ul>
          {a.todo.map((t, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: t }} />
          ))}
        </ul>

        {a.penalty && (
          <>
            <h4>العقوبة عند المخالفة</h4>
            <div className="penalty">{a.penalty}</div>
          </>
        )}

        <h4>المصطلحات كما ستقابلها بالإنجليزية</h4>
        <div className="terms">
          {a.terms.map(([en, ar], i) => (
            <div className="term" key={i}>
              <b>{en}</b>
              <span>{ar}</span>
            </div>
          ))}
        </div>

        <div className="source">
          <div className="source-head">
            <span>Official source</span>
            <span>{a.status === 'verified' ? `Verified ${a.checked}` : 'Check source'}</span>
          </div>
          <div className="source-body">
            <a href={a.src.url} target="_blank" rel="noopener noreferrer">{a.src.url}</a>
            <div className="src-row">
              <span className="dot" />
              <span>{a.src.org}</span>
              <span>·</span>
              <span>آخر مراجعة: <span className="mono">{a.checked}</span></span>
            </div>
          </div>
        </div>

        <VoteButtons articleId={a.id} initial={counts} />

        <p className="legal-note">
          معلومات عامة فقط، وليست استشارة قانونية ولا تنشئ علاقة محامٍ بموكّل. القوانين تتغير —
          إذا كان تاريخ آخر مراجعة قديماً فاعتمد على رابط المصدر أعلاه. للحالات الفردية راجع
          محامياً مرخّصاً أو <span className="mono">Citizens Advice</span>.
        </p>
      </div>
    </>
  );
}
