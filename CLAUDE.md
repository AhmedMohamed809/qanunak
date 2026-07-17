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
- `src/components/TopicArt.tsx` — topic imagery (client component). Priority:
  admin `image` URL → real category photo (`CATEGORY_IMAGE`, Wikimedia Commons
  via `Special:FilePath`) → on load error, falls back to original SVG artwork
  (`ART_BY_ARTICLE` per-topic, then `ART_BY_CAT` per-category). Category photos
  are free/openly licensed; attribution in `content/IMAGE_CREDITS.md`. The SVG
  art is original — any external image must be free-licensed and credited there.

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
filesystem is ephemeral, so **feedback** (👍/👎 counts) uses, in order:
1. **Vercel KV (Upstash Redis)** when `KV_REST_API_URL` + `KV_REST_API_TOKEN`
   are present (set automatically once a KV store is connected) — private, full
   up/down, homepage per-card counts.
2. Else on Vercel (`process.env.VERCEL`), a **zero-config free counter**
   (Abacus, `abacus.jasoncameron.dev`) so "قالوا أفادتني" works with no setup —
   one-way "helpful" increments only (no decrement), homepage shows the global
   total via `getTotalHelped()`, per-card counts are omitted.
3. Else (local/VPS) `content/feedback.json`.
Voting is one-way (VoteButtons locks after one click). `store.ts` exposes
`getFeedback`, `getTotalHelped`, `getArticleFeedback`, `recordVote`. Article
content is still file-based (read-only bundle → reads fine on Vercel; admin
edits need a persistent host or a KV/DB port).

## Roadmap ideas
- English mirror pages for SEO; FAQPage JSON-LD
- Source-change monitor (hash gov.uk pages weekly, flag stale articles)
- Category management UI in admin
