import { promises as fs } from 'fs';
import path from 'path';
import type { Article, ContentFile, FeedbackCounts, FeedbackFile, Vote } from './types';

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

/**
 * بديل بلا أي إعداد على Vercel: عدّاد مجاني عام (Abacus) لا يتطلّب تسجيلاً.
 * يُستعمل تلقائياً على Vercel عند غياب KV، فتعمل «قالوا أفادتني» فوراً دون خطوات منك.
 * لا يُرسَل سوى معرّف الموضوع المجهول + زيادة/قراءة عدّاد — بلا أي بيانات شخصية.
 * القيمة تُحفظ بشكل دائم. (للخصوصية/التحكّم الكامل يمكن لاحقاً ربط Vercel KV فيُقدَّم عليه.)
 */
const USE_ABACUS = !USE_KV && Boolean(process.env.VERCEL);
const AB_BASE = 'https://abacus.jasoncameron.dev';
const AB_NS = 'qanunak-uk-law-ar';
const AB_TOTAL = 'helped-total';
const abKey = (id: string, kind: Vote) => `${kind}-${id}`;

async function abFetch(pathname: string): Promise<number> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3500);
  try {
    const res = await fetch(`${AB_BASE}${pathname}`, { cache: 'no-store', signal: ctrl.signal });
    if (res.status === 404) return 0; // مفتاح لم يُنشأ بعد
    if (!res.ok) throw new Error(`Abacus ${res.status}`);
    const data = (await res.json()) as { value?: number };
    return Math.max(0, Number(data.value) || 0);
  } finally {
    clearTimeout(timer);
  }
}
const abHit = (key: string) => abFetch(`/hit/${AB_NS}/${key}`); // +1 (يُنشئ عند أول استدعاء)
const abGet = (key: string) => abFetch(`/get/${AB_NS}/${key}`); // القيمة الحالية

// تخزين مؤقّت قصير لإجمالي «أفادتني» على الصفحة الرئيسية (يخفّف طلبات Abacus)
let totalCache: { at: number; val: number } | null = null;

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
  // مع Abacus لا نجلب كل العدّادات دفعةً واحدة (طلب لكل موضوع مكلف)؛
  // الصفحة الرئيسية تستخدم getTotalHelped، وصفحة المقال تستخدم getArticleFeedback.
  if (USE_ABACUS) return {};
  try {
    const raw = await fs.readFile(FEEDBACK, 'utf8');
    return JSON.parse(raw) as FeedbackFile;
  } catch {
    return {};
  }
}

/** إجمالي عدد من ضغطوا «أفادتني» عبر كل المواضيع (لإحصاء الصفحة الرئيسية). */
export async function getTotalHelped(): Promise<number> {
  if (USE_KV) {
    try {
      const flat = ((await kv(['HGETALL', FB_KEY])) as string[]) ?? [];
      let total = 0;
      for (let i = 0; i + 1 < flat.length; i += 2) {
        if (flat[i].endsWith(':up')) total += Math.max(0, parseInt(flat[i + 1], 10) || 0);
      }
      return total;
    } catch (err) {
      console.warn('getTotalHelped: تعذّرت قراءة KV', err);
    }
  }
  if (USE_ABACUS) {
    if (totalCache && Date.now() - totalCache.at < 15000) return totalCache.val;
    try {
      const val = await abGet(AB_TOTAL);
      totalCache = { at: Date.now(), val };
      return val;
    } catch (err) {
      console.warn('getTotalHelped: تعذّرت قراءة Abacus', err);
      return totalCache?.val ?? 0;
    }
  }
  const fb = await getFeedback();
  return Object.values(fb).reduce((s, f) => s + f.up, 0);
}

/** عدّادات موضوع واحد (لصفحة المقال). */
export async function getArticleFeedback(id: string): Promise<FeedbackCounts> {
  if (USE_KV) {
    try {
      const up = Math.max(0, Number(await kv(['HGET', FB_KEY, `${id}:up`])) || 0);
      const down = Math.max(0, Number(await kv(['HGET', FB_KEY, `${id}:down`])) || 0);
      return { up, down };
    } catch (err) {
      console.warn('getArticleFeedback: تعذّرت قراءة KV', err);
    }
  }
  if (USE_ABACUS) {
    try {
      const [up, down] = await Promise.all([abGet(abKey(id, 'up')), abGet(abKey(id, 'down'))]);
      return { up, down };
    } catch (err) {
      console.warn('getArticleFeedback: تعذّرت قراءة Abacus', err);
      return { up: 0, down: 0 };
    }
  }
  const fb = await getFeedback();
  return fb[id] ?? { up: 0, down: 0 };
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
  // المسار المجاني بلا إعداد على Vercel: زيادة عدّاد Abacus (تصويت لمرّة واحدة، بلا إنقاص)
  if (USE_ABACUS) {
    try {
      if (vote === 'up' && prev !== 'up') {
        await Promise.all([abHit(abKey(articleId, 'up')), abHit(AB_TOTAL)]);
        totalCache = null; // أبطِل التخزين المؤقّت ليعكس الإجمالي الزيادة فوراً
      } else if (vote === 'down' && prev !== 'down') {
        await abHit(abKey(articleId, 'down'));
      }
      const [up, down] = await Promise.all([abGet(abKey(articleId, 'up')), abGet(abKey(articleId, 'down'))]);
      return { [articleId]: { up, down } };
    } catch (err) {
      console.warn('recordVote: تعذّرت الكتابة إلى Abacus', err);
      return { [articleId]: { up: 0, down: 0 } };
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
