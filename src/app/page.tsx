import { getContent, getFeedback } from '@/lib/store';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [content, feedback] = await Promise.all([getContent(), getFeedback()]);
  return <HomeClient content={content} feedback={feedback} />;
}
