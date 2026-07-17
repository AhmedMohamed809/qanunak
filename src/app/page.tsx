import { getContent, getFeedback } from '@/lib/store';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string | string[] };
}) {
  const [content, feedback] = await Promise.all([getContent(), getFeedback()]);
  const raw = searchParams?.q;
  const initialQ = (Array.isArray(raw) ? raw[0] : raw) ?? '';
  return <HomeClient content={content} feedback={feedback} initialQ={initialQ} />;
}
