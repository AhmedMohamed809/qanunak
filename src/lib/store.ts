import { promises as fs } from 'fs';
import path from 'path';
import type { Article, ContentFile, FeedbackFile, Vote } from './types';

/**
 * مخزن البيانات: ملفات JSON على القرص.
 * يعمل محلياً وعلى أي خادم دائم (VPS).
 * ملاحظة للنشر على Vercel: نظام الملفات هناك مؤقت — انقل هاتين الدالتين
 * إلى Vercel Postgres أو KV (الواجهة نفسها، التخزين فقط يتغير).
 */
const CONTENT = path.join(process.cwd(), 'content', 'articles.json');
const FEEDBACK = path.join(process.cwd(), 'content', 'feedback.json');

// قفل بسيط داخل العملية لتفادي الكتابة المتزامنة
let writing: Promise<void> = Promise.resolve();
function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const run = writing.then(fn);
  writing = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function writeJsonAtomic(file: string, data: unknown): Promise<void> {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

export async function getContent(): Promise<ContentFile> {
  const raw = await fs.readFile(CONTENT, 'utf8');
  return JSON.parse(raw) as ContentFile;
}

export async function getArticle(id: string): Promise<Article | null> {
  const { articles } = await getContent();
  return articles.find((a) => a.id === id) ?? null;
}

export async function upsertArticle(article: Article): Promise<void> {
  return serialize(async () => {
    const content = await getContent();
    const i = content.articles.findIndex((a) => a.id === article.id);
    if (i >= 0) content.articles[i] = article;
    else content.articles.push(article);
    await writeJsonAtomic(CONTENT, content);
  });
}

export async function deleteArticle(id: string): Promise<boolean> {
  return serialize(async () => {
    const content = await getContent();
    const before = content.articles.length;
    content.articles = content.articles.filter((a) => a.id !== id);
    if (content.articles.length === before) return false;
    await writeJsonAtomic(CONTENT, content);
    return true;
  });
}

export async function getFeedback(): Promise<FeedbackFile> {
  try {
    const raw = await fs.readFile(FEEDBACK, 'utf8');
    return JSON.parse(raw) as FeedbackFile;
  } catch {
    return {};
  }
}

/** تسجيل تقييم: vote الجديد، وprev إن كان الزائر يبدّل تقييماً سابقاً أو يلغيه */
export async function recordVote(
  articleId: string,
  vote: Vote | null,
  prev: Vote | null,
): Promise<FeedbackFile> {
  return serialize(async () => {
    const fb = await getFeedback();
    const counts = fb[articleId] ?? { up: 0, down: 0 };
    if (prev) counts[prev] = Math.max(0, counts[prev] - 1);
    if (vote) counts[vote] += 1;
    fb[articleId] = counts;
    await writeJsonAtomic(FEEDBACK, fb);
    return fb;
  });
}
