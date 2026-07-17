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

/**
 * تخزين التقييمات:
 *  - على Vercel: نظام الملفات مؤقّت، لذا نستخدم Vercel KV (Upstash Redis) إن توفّر.
 *    يكفي ربط متجر KV بالمشروع في Vercel؛ فيُحقن المتغيّران تلقائياً:
 *    KV_REST_API_URL و KV_REST_API_TOKEN — عندها تُحفظ التقييمات بشكل دائم.
 *  - محلياً/على VPS (بلا KV): نعود إلى ملف feedback.json كما كان.
 * لا حاجة لأي تبعية npm — نستخدم REST API عبر fetch.
 */
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const USE_KV = Boolean(KV_URL && KV_TOKEN);
const FB_KEY = 'qanunak:feedback';

async function kv(cmd: (string | number)[]): Promise<unknown> {
  const res = await fetch(KV_URL as string, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`KV ${res.status}`);
  return ((await res.json()) as { result: unknown }).result;
}

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
  if (USE_KV) {
    try {
      // HGETALL يرجع مصفوفة مسطّحة: [field, value, field, value, ...]
      const flat = ((await kv(['HGETALL', FB_KEY])) as string[]) ?? [];
      const fb: FeedbackFile = {};
      for (let i = 0; i + 1 < flat.length; i += 2) {
        const m = /^(.+):(up|down)$/.exec(flat[i]);
        if (!m) continue;
        const id = m[1];
        const kind = m[2] as Vote;
        const val = Math.max(0, parseInt(flat[i + 1], 10) || 0);
        (fb[id] ??= { up: 0, down: 0 })[kind] = val;
      }
      return fb;
    } catch (err) {
      console.warn('getFeedback: تعذّرت قراءة KV، الرجوع إلى الملف', err);
    }
  }
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
  // المسار الدائم على Vercel: عدّادات ذرّية في Redis (HINCRBY)
  if (USE_KV) {
    try {
      if (prev) {
        const n = Number(await kv(['HINCRBY', FB_KEY, `${articleId}:${prev}`, -1]));
        if (n < 0) await kv(['HSET', FB_KEY, `${articleId}:${prev}`, 0]);
      }
      if (vote) await kv(['HINCRBY', FB_KEY, `${articleId}:${vote}`, 1]);
      const up = Math.max(0, Number(await kv(['HGET', FB_KEY, `${articleId}:up`])) || 0);
      const down = Math.max(0, Number(await kv(['HGET', FB_KEY, `${articleId}:down`])) || 0);
      return { [articleId]: { up, down } };
    } catch (err) {
      console.warn('recordVote: تعذّرت الكتابة إلى KV، الرجوع إلى الملف', err);
    }
  }
  return serialize(async () => {
    const fb = await getFeedback();
    const counts = fb[articleId] ?? { up: 0, down: 0 };
    if (prev) counts[prev] = Math.max(0, counts[prev] - 1);
    if (vote) counts[vote] += 1;
    fb[articleId] = counts;
    try {
      await writeJsonAtomic(FEEDBACK, fb);
    } catch (err) {
      // على خادم دائم (VPS) تُحفظ التقييمات عادةً. أما على أنظمة ملفات للقراءة فقط
      // (مثل Vercel) فقد يفشل الحفظ — لا نُسقط الطلب، بل نُعيد العدّ المحسوب.
      // لحفظ دائم على Vercel: انقل هذه الدالة إلى Vercel KV/Postgres (انظر CLAUDE.md).
      console.warn('recordVote: تعذّر حفظ التقييم (نظام ملفات للقراءة فقط؟)', err);
    }
    return fb;
  });
}
