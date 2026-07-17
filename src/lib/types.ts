export type ArticleStatus = 'verified' | 'review';

export interface Category {
  id: string;
  name: string;
}

export interface Source {
  url: string;
  org: string;
}

export interface Article {
  id: string;
  cat: string;
  hot: boolean;
  status: ArticleStatus;
  /** تاريخ آخر مراجعة بصيغة YYYY-MM-DD */
  checked: string;
  title: string;
  sub: string;
  /** HTML مُدار من لوحة التحكم فقط (لا مدخلات من الزوار) */
  body: string;
  todo: string[];
  penalty: string;
  /** أزواج [المصطلح بالإنجليزية، الترجمة العربية] */
  terms: [string, string][];
  src: Source;
  /** رابط صورة اختياري يضبطه الأدمن؛ عند غيابه تُعرض أيقونة الفئة */
  image: string | null;
}

export interface ContentFile {
  categories: Category[];
  articles: Article[];
}

export interface FeedbackCounts {
  up: number;
  down: number;
}

export type FeedbackFile = Record<string, FeedbackCounts>;

export type Vote = 'up' | 'down';
