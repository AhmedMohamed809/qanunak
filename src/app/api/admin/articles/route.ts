import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, tokenIsValid } from '@/lib/auth';
import { deleteArticle, getContent, upsertArticle } from '@/lib/store';
import type { Article } from '@/lib/types';

function authorized(req: NextRequest): boolean {
  return tokenIsValid(req.cookies.get(ADMIN_COOKIE)?.value);
}

function validate(a: Partial<Article>, knownCats: string[]): string | null {
  if (!a.id || !/^[a-z0-9-]{2,60}$/.test(a.id)) {
    return 'المعرّف (id) مطلوب: حروف إنجليزية صغيرة وأرقام وشرطات فقط';
  }
  if (!a.title?.trim()) return 'العنوان مطلوب';
  if (!a.sub?.trim()) return 'الوصف المختصر مطلوب';
  if (!a.body?.trim()) return 'نص الموضوع مطلوب';
  if (!a.cat || !knownCats.includes(a.cat)) return 'الفئة غير صحيحة';
  if (!a.src?.url || !/^https:\/\/([a-z0-9-]+\.)*(gov\.uk|nhs\.uk)(\/|$)/.test(a.src.url)) {
    return 'رابط المصدر مطلوب ويجب أن يكون من gov.uk أو legislation.gov.uk أو nhs.uk';
  }
  if (!a.src.org?.trim()) return 'اسم جهة المصدر مطلوب';
  if (!a.checked || !/^\d{4}-\d{2}-\d{2}$/.test(a.checked)) return 'تاريخ المراجعة بصيغة YYYY-MM-DD';
  if (a.status !== 'verified' && a.status !== 'review') return 'الحالة يجب أن تكون verified أو review';
  if (!Array.isArray(a.todo)) return 'قائمة الإجراءات غير صحيحة';
  if (!Array.isArray(a.terms)) return 'قائمة المصطلحات غير صحيحة';
  if (a.image && !/^https:\/\//.test(a.image)) return 'رابط الصورة يجب أن يبدأ بـ https://';
  return null;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const input = (await req.json().catch(() => null)) as Partial<Article> | null;
  if (!input) return NextResponse.json({ error: 'bad json' }, { status: 400 });

  const content = await getContent();
  const err = validate(input, content.categories.map((c) => c.id));
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const article: Article = {
    id: input.id!,
    cat: input.cat!,
    hot: Boolean(input.hot),
    status: input.status!,
    checked: input.checked!,
    title: input.title!.trim(),
    sub: input.sub!.trim(),
    body: input.body!,
    todo: (input.todo as string[]).map((t) => t.trim()).filter(Boolean),
    penalty: (input.penalty ?? '').trim(),
    terms: (input.terms as [string, string][]).filter(([en, ar]) => en?.trim() && ar?.trim()),
    src: { url: input.src!.url.trim(), org: input.src!.org.trim() },
    image: input.image?.trim() || null,
  };

  await upsertArticle(article);
  return NextResponse.json({ ok: true, id: article.id });
}

export async function DELETE(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
  const removed = await deleteArticle(id);
  if (!removed) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
