# قانونك (Qanunak) — UK law explained in Arabic

Next.js 14 (App Router) + TypeScript. RTL Arabic site explaining UK law simply,
with an official government source on every article, per-article like/dislike
feedback, and a password-protected admin dashboard.

## Commands
- `npm run dev` — dev server at http://localhost:3000
- `npm run build && npm start` — production
- Admin: http://localhost:3000/admin (password = `ADMIN_PASSWORD` in `.env`)

## Setup
Copy `.env.example` to `.env` and set `ADMIN_PASSWORD` + a long random `ADMIN_SECRET`.

## Architecture
- `content/articles.json` — all categories + 32 seed articles (the datastore)
- `content/feedback.json` — aggregate 👍/👎 counts per article
- `src/lib/store.ts` — the ONLY module that touches the JSON files (atomic writes,
  serialized). To move to a database, reimplement this file only.
- `src/lib/auth.ts` + `middleware.ts` — admin session (HMAC cookie)
- `src/app/law/[id]` — server-rendered article pages (SEO + Article JSON-LD)
- `src/app/admin` — dashboard, editor at `/admin/edit/[id]` (`new` = create)
- `src/components/TopicArt.tsx` — original SVG artwork. Priority: admin `image`
  URL → per-article drawing (`ART_BY_ARTICLE`, 32 of them) → category drawing
  (`ART_BY_CAT`, the fallback for any new topic). All art is original — never
  add third-party images without a licence.

## Hard rules — do not break
1. **Every article must cite an official source.** The admin API rejects any
   `src.url` not on gov.uk / legislation.gov.uk / nhs.uk. Keep that validation.
2. **Arabic quality**: fusha (MSA), correct hamza (إ/أ/ا), ta marbuta (ة vs ه),
   ya (ي vs ى). Numbers/prices stay in Latin digits inside `.mono` spans.
3. **This is legal information, not advice.** Never remove the disclaimers.
   `status: "verified"` means a human checked the source ON that date — never
   set it programmatically.
4. Article `body`/`todo` HTML is admin-authored only; never render user input
   into them.

## Deployment note
The JSON file store works locally and on any persistent server (VPS). Vercel's
filesystem is ephemeral: before deploying there, port `src/lib/store.ts` to
Vercel Postgres (or KV) — same function signatures, storage only.

## Roadmap ideas
- English mirror pages for SEO; FAQPage JSON-LD
- Source-change monitor (hash gov.uk pages weekly, flag stale articles)
- Category management UI in admin
