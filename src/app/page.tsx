import { getContent, getFeedback, getTotalHelped } from '@/lib/store';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string | string[] };
}) {
  const [content, feedback, totalHelped] = await Promise.all([
    getContent(),
    getFeedback(),
    getTotalHelped(),
  ]);
  const raw = searchParams?.q;
  const initialQ = (Array.isArray(raw) ? raw[0] : raw) ?? '';
  return (
    <HomeClient content={content} feedback={feedback} initialQ={initialQ} totalHelped={totalHelped} />
  );
}
