import { getArticle, getContent } from '@/lib/store';
import { notFound } from 'next/navigation';
import ArticleForm from '@/components/ArticleForm';

export const dynamic = 'force-dynamic';

export default async function EditPage({ params }: { params: { id: string } }) {
  const content = await getContent();
  const isNew = params.id === 'new';
  const article = isNew ? null : await getArticle(params.id);
  if (!isNew && !article) notFound();

  return (
    <div className="wrap" style={{ padding: '30px 18px' }}>
      <h2 style={{ fontFamily: "'Readex Pro',sans-serif", marginBottom: 18 }}>
        {isNew ? 'موضوع جديد' : `تعديل: ${article!.title}`}
      </h2>
      <ArticleForm categories={content.categories} article={article} />
    </div>
  );
}
