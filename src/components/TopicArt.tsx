/**
 * صور المواضيع.
 *
 * الأولوية:
 *  1) صورة يضبطها الأدمن برابط (حقل image) — تُعرض كما هي.
 *  2) رسم خاص بالموضوع نفسه (ART_BY_ARTICLE).
 *  3) رسم الفئة (ART_BY_CAT) — احتياطي لأي موضوع جديد يضيفه الأدمن.
 *
 * كل الرسوم أصلية بأسلوب لوحات الإشارة البريطانية (هوية الموقع)،
 * ولا تعتمد على صور خارجية أو حقوق طرف ثالث.
 */

const W = '#fff';
const G = '#006747';
const D = '#0C2B23';

/* ---------- رسوم خاصة بمواضيع بعينها ---------- */
const ART_BY_ARTICLE: Record<string, JSX.Element> = {
  'nongb-licence': (
    <g>
      <rect x="12" y="20" width="40" height="26" rx="4" fill={W} />
      <circle cx="23" cy="30" r="5" fill={G} />
      <rect x="32" y="27" width="16" height="3" rx="1.5" fill={G} />
      <rect x="32" y="34" width="12" height="3" rx="1.5" fill={G} opacity=".6" />
      <rect x="16" y="40" width="32" height="2" rx="1" fill={G} opacity=".4" />
    </g>
  ),
  'car-basics': (
    <g>
      <path d="M32 14 L47 20 V33 C47 42 40 47 32 50 C24 47 17 42 17 33 V20 Z" fill={W} />
      <path d="M25 32 l5 5 l10 -11" stroke={G} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  'child-seats': (
    <g>
      <path d="M22 44 V24 a6 6 0 0 1 6 -6 h8 a6 6 0 0 1 6 6 v20 z" fill={W} />
      <rect x="18" y="42" width="28" height="6" rx="3" fill={W} opacity=".85" />
      <path d="M28 26 L36 38 M36 26 L28 38" stroke={G} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  'mobile-driving': (
    <g>
      <rect x="24" y="16" width="16" height="30" rx="3" fill={W} />
      <rect x="28" y="20" width="8" height="18" rx="1" fill={G} opacity=".35" />
      <path d="M16 50 L48 14" stroke={W} strokeWidth="4" strokeLinecap="round" />
      <path d="M16 50 L48 14" stroke={G} strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  'drink-drive': (
    <g>
      <path d="M23 18 h18 l-7 12 v12 h5 v3 H25 v-3 h5 V30 z" fill={W} />
      <path d="M16 50 L48 14" stroke={W} strokeWidth="4" strokeLinecap="round" />
      <path d="M16 50 L48 14" stroke={G} strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  escooter: (
    <g>
      <circle cx="20" cy="44" r="5" fill="none" stroke={W} strokeWidth="3" />
      <circle cx="44" cy="44" r="5" fill="none" stroke={W} strokeWidth="3" />
      <path d="M20 44 L38 44 L42 22 H34" stroke={W} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 44 L44 44" stroke={W} strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  'min-wage': (
    <g>
      <circle cx="28" cy="36" r="13" fill={W} />
      <text x="28" y="42" textAnchor="middle" fontSize="16" fontWeight="700" fill={G}>£</text>
      <path d="M38 26 L48 16" stroke={W} strokeWidth="3" strokeLinecap="round" />
      <path d="M40 16 H48 V24" stroke={W} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  'contract-payslip': (
    <g>
      <rect x="18" y="14" width="28" height="36" rx="3" fill={W} />
      <rect x="23" y="21" width="18" height="2.5" rx="1.25" fill={G} />
      <rect x="23" y="28" width="18" height="2.5" rx="1.25" fill={G} opacity=".6" />
      <rect x="23" y="35" width="11" height="2.5" rx="1.25" fill={G} opacity=".6" />
      <text x="38" y="46" textAnchor="middle" fontSize="10" fontWeight="700" fill={G}>£</text>
    </g>
  ),
  holiday: (
    <g>
      <rect x="15" y="18" width="34" height="30" rx="3" fill={W} />
      <rect x="15" y="18" width="34" height="8" rx="3" fill={G} />
      <rect x="21" y="14" width="3" height="8" rx="1.5" fill={W} />
      <rect x="40" y="14" width="3" height="8" rx="1.5" fill={W} />
      <path d="M25 37 l4 4 l9 -10" stroke={G} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  'sick-pay': (
    <g>
      <rect x="16" y="22" width="32" height="24" rx="4" fill={W} />
      <rect x="29" y="26" width="6" height="16" rx="1.5" fill={G} />
      <rect x="24" y="31" width="16" height="6" rx="1.5" fill={G} />
      <path d="M24 22 v-3 a4 4 0 0 1 4 -4 h8 a4 4 0 0 1 4 4 v3" fill="none" stroke={W} strokeWidth="3" />
    </g>
  ),
  'section-21': (
    <g>
      <rect x="19" y="14" width="26" height="34" rx="3" fill={W} />
      <rect x="24" y="21" width="16" height="2.5" rx="1.25" fill={G} opacity=".6" />
      <rect x="24" y="28" width="16" height="2.5" rx="1.25" fill={G} opacity=".6" />
      <path d="M16 48 L48 16" stroke={W} strokeWidth="4" strokeLinecap="round" />
      <path d="M16 48 L48 16" stroke={G} strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  deposit: (
    <g>
      <rect x="18" y="30" width="28" height="20" rx="4" fill={W} />
      <path d="M25 30 v-6 a7 7 0 0 1 14 0 v6" fill="none" stroke={W} strokeWidth="3.5" />
      <text x="32" y="45" textAnchor="middle" fontSize="13" fontWeight="700" fill={G}>£</text>
    </g>
  ),
  repairs: (
    <g>
      <path d="M44 16 a9 9 0 0 0 -12 11 L16 43 l5 5 l16 -16 a9 9 0 0 0 11 -12 l-6 6 l-5 -5 z" fill={W} />
    </g>
  ),
  'council-tax': (
    <g>
      <path d="M32 14 L50 24 H14 Z" fill={W} />
      <rect x="18" y="26" width="4" height="16" fill={W} />
      <rect x="27" y="26" width="4" height="16" fill={W} />
      <rect x="36" y="26" width="4" height="16" fill={W} />
      <rect x="44" y="26" width="4" height="16" fill={W} />
      <rect x="14" y="44" width="36" height="5" rx="2" fill={W} />
    </g>
  ),
  'marriage-age': (
    <g>
      <circle cx="25" cy="34" r="9" fill="none" stroke={W} strokeWidth="3.5" />
      <circle cx="39" cy="34" r="9" fill="none" stroke={W} strokeWidth="3.5" />
      <rect x="24" y="12" width="18" height="12" rx="3" fill={W} />
      <text x="33" y="22" textAnchor="middle" fontSize="10" fontWeight="700" fill={G}>18</text>
    </g>
  ),
  divorce: (
    <g>
      <circle cx="22" cy="36" r="9" fill="none" stroke={W} strokeWidth="3.5" />
      <circle cx="42" cy="36" r="9" fill="none" stroke={W} strokeWidth="3.5" />
      <path d="M32 14 L32 26" stroke={W} strokeWidth="3" strokeLinecap="round" />
      <path d="M28 20 L32 26 L36 20" stroke={W} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  'domestic-abuse': (
    <g>
      <path d="M32 14 L47 20 V33 C47 42 40 47 32 50 C24 47 17 42 17 33 V20 Z" fill={W} />
      <path d="M32 40 c-7 -5 -10 -9 -10 -13 a5 5 0 0 1 10 -3 a5 5 0 0 1 10 3 c0 4 -3 8 -10 13 z" fill={G} />
    </g>
  ),
  'forced-marriage': (
    <g>
      <circle cx="32" cy="32" r="17" fill="none" stroke={W} strokeWidth="3.5" />
      <path d="M22 42 L42 22" stroke={W} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="27" cy="30" r="4" fill="none" stroke={W} strokeWidth="2.5" />
      <circle cx="37" cy="34" r="4" fill="none" stroke={W} strokeWidth="2.5" />
    </g>
  ),
  'child-alone': (
    <g>
      <path d="M32 14 L49 29 H44 V48 H20 V29 H15 Z" fill={W} />
      <circle cx="32" cy="34" r="4" fill={G} />
      <path d="M26 47 C26 39 38 39 38 47 Z" fill={G} />
    </g>
  ),
  smacking: (
    <g>
      <path d="M25 46 V28 a3 3 0 0 1 6 0 v-6 a3 3 0 0 1 6 0 v6 a3 3 0 0 1 6 0 v14 a6 6 0 0 1 -6 6 z" fill={W} />
      <path d="M16 50 L48 16" stroke={W} strokeWidth="4" strokeLinecap="round" />
      <path d="M16 50 L48 16" stroke={G} strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  school: (
    <g>
      <path d="M32 18 L52 27 L32 36 L12 27 Z" fill={W} />
      <path d="M20 31 v9 c0 4 24 4 24 0 v-9" fill="none" stroke={W} strokeWidth="3" strokeLinecap="round" />
      <path d="M50 28 v10" stroke={W} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  gp: (
    <g>
      <path d="M22 16 v10 a8 8 0 0 0 16 0 V16" fill="none" stroke={W} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M30 34 v4 a8 8 0 0 0 16 0 v-4" fill="none" stroke={W} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="46" cy="30" r="5" fill={W} />
    </g>
  ),
  emergency: (
    <g>
      <path d="M22 16 l7 -2 l4 9 l-5 4 c2 6 6 10 12 12 l4 -5 l9 4 l-2 7 c-1 3 -4 4 -7 3 C33 44 20 31 19 23 c-1 -3 0 -6 3 -7 z" fill={W} />
    </g>
  ),
  prescriptions: (
    <g>
      <rect x="16" y="24" width="32" height="24" rx="4" fill={W} />
      <rect x="16" y="24" width="32" height="7" rx="3" fill={G} opacity=".35" />
      <rect x="29" y="34" width="6" height="10" rx="1.5" fill={G} />
      <rect x="27" y="37" width="10" height="4" rx="1.5" fill={G} />
      <rect x="26" y="16" width="12" height="6" rx="2" fill={W} />
    </g>
  ),
  'ni-number': (
    <g>
      <rect x="12" y="20" width="40" height="26" rx="4" fill={W} />
      <rect x="17" y="27" width="12" height="12" rx="2" fill={G} opacity=".3" />
      <rect x="33" y="28" width="15" height="3" rx="1.5" fill={G} />
      <rect x="33" y="35" width="10" height="3" rx="1.5" fill={G} opacity=".6" />
    </g>
  ),
  'child-benefit': (
    <g>
      <circle cx="26" cy="24" r="6" fill={W} />
      <path d="M15 45 C15 33 37 33 37 45 Z" fill={W} />
      <circle cx="43" cy="38" r="10" fill={W} />
      <text x="43" y="43" textAnchor="middle" fontSize="12" fontWeight="700" fill={G}>£</text>
    </g>
  ),
  'tv-licence': (
    <g>
      <rect x="12" y="20" width="40" height="26" rx="4" fill={W} />
      <rect x="17" y="25" width="30" height="16" rx="2" fill={G} opacity=".3" />
      <path d="M24 16 L32 22 L40 16" stroke={W} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="26" y="48" width="12" height="3" rx="1.5" fill={W} />
    </g>
  ),
  'stop-search': (
    <g>
      <circle cx="28" cy="28" r="12" fill="none" stroke={W} strokeWidth="4" />
      <path d="M37 37 L48 48" stroke={W} strokeWidth="4" strokeLinecap="round" />
    </g>
  ),
  arrested: (
    <g>
      <path d="M32 14 v34" stroke={W} strokeWidth="3" strokeLinecap="round" />
      <path d="M16 22 h32" stroke={W} strokeWidth="3" strokeLinecap="round" />
      <path d="M16 22 l-5 10 h10 z" fill={W} />
      <path d="M48 22 l-5 10 h10 z" fill={W} />
      <rect x="24" y="46" width="16" height="4" rx="2" fill={W} />
    </g>
  ),
  knives: (
    <g>
      <path d="M18 40 L36 18 l4 4 L22 44 z" fill={W} />
      <path d="M16 50 L48 16" stroke={W} strokeWidth="4" strokeLinecap="round" />
      <path d="M16 50 L48 16" stroke={G} strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  'alcohol-age': (
    <g>
      <path d="M22 16 h14 l-5 12 v14 h4 v3 H23 v-3 h4 V28 z" fill={W} />
      <circle cx="43" cy="40" r="10" fill={W} />
      <text x="43" y="45" textAnchor="middle" fontSize="11" fontWeight="700" fill={G}>18</text>
    </g>
  ),
  evisa: (
    <g>
      <rect x="18" y="14" width="28" height="36" rx="3" fill={W} />
      <circle cx="32" cy="26" r="5" fill={G} />
      <rect x="24" y="35" width="16" height="2.5" rx="1.25" fill={G} opacity=".6" />
      <rect x="24" y="41" width="10" height="2.5" rx="1.25" fill={G} opacity=".6" />
      <path d="M42 44 l3 3 l6 -7" stroke={W} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
};

/* ---------- رسوم احتياطية لكل فئة ---------- */
const ART_BY_CAT: Record<string, JSX.Element> = {
  driving: (
    <g>
      <rect x="14" y="30" width="36" height="14" rx="4" fill={W} />
      <circle cx="22" cy="46" r="5" fill={D} stroke={W} strokeWidth="2" />
      <circle cx="42" cy="46" r="5" fill={D} stroke={W} strokeWidth="2" />
      <rect x="20" y="22" width="20" height="10" rx="3" fill={W} opacity=".85" />
    </g>
  ),
  work: (
    <g>
      <rect x="16" y="26" width="32" height="22" rx="4" fill={W} />
      <rect x="26" y="20" width="12" height="8" rx="2" fill={W} opacity=".85" />
      <rect x="16" y="34" width="32" height="3" fill={G} />
    </g>
  ),
  housing: (
    <g>
      <path d="M32 16 L50 32 H44 V48 H20 V32 H14 Z" fill={W} />
      <rect x="28" y="38" width="8" height="10" fill={G} />
    </g>
  ),
  family: (
    <g>
      <circle cx="24" cy="26" r="6" fill={W} />
      <circle cx="40" cy="26" r="6" fill={W} />
      <path d="M14 48 C14 38 34 38 34 48 Z" fill={W} />
      <path d="M30 48 C30 38 50 38 50 48 Z" fill={W} opacity=".85" />
    </g>
  ),
  child: (
    <g>
      <circle cx="32" cy="24" r="7" fill={W} />
      <path d="M20 50 C20 36 44 36 44 50 Z" fill={W} />
      <path d="M32 12 L34 17 L39 17 L35 20 L37 25 L32 22 L27 25 L29 20 L25 17 L30 17 Z" fill={W} opacity=".7" />
    </g>
  ),
  health: (
    <g>
      <rect x="26" y="16" width="12" height="32" rx="3" fill={W} />
      <rect x="16" y="26" width="32" height="12" rx="3" fill={W} />
    </g>
  ),
  money: (
    <g>
      <circle cx="32" cy="32" r="16" fill={W} />
      <text x="32" y="39" textAnchor="middle" fontSize="20" fontWeight="700" fill={G}>£</text>
    </g>
  ),
  police: (
    <g>
      <path d="M32 14 L46 20 V32 C46 42 40 47 32 50 C24 47 18 42 18 32 V20 Z" fill={W} />
      <path d="M32 22 L34 27 H39 L35 30 L37 35 L32 32 L27 35 L29 30 L25 27 H30 Z" fill={G} />
    </g>
  ),
  daily: (
    <g>
      <circle cx="32" cy="32" r="16" fill={W} />
      <path d="M32 22 V32 L39 37" stroke={G} strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
  ),
  status: (
    <g>
      <rect x="18" y="16" width="28" height="32" rx="3" fill={W} />
      <circle cx="32" cy="28" r="5" fill={G} />
      <rect x="24" y="38" width="16" height="3" rx="1.5" fill={G} />
    </g>
  ),
};

export default function TopicArt({
  id,
  cat,
  image,
  title,
  size = 'card',
}: {
  id: string;
  cat: string;
  image?: string | null;
  title: string;
  size?: 'card' | 'hero';
}) {
  if (image) {
    // صورة يضبطها الأدمن برابط
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={title} className={`topic-img topic-img-${size}`} loading="lazy" />;
  }
  const art = ART_BY_ARTICLE[id] ?? ART_BY_CAT[cat] ?? ART_BY_CAT.daily;
  return (
    <svg viewBox="0 0 64 64" className={`topic-art topic-art-${size}`} role="img" aria-label={title}>
      <rect x="2" y="2" width="60" height="60" rx="12" fill={G} />
      <rect x="5" y="5" width="54" height="54" rx="9" fill="none" stroke={W} strokeWidth="2" opacity=".85" />
      {art}
    </svg>
  );
}
