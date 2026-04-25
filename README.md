## Our Story ❤️

Premium romantic one-page website gift built with:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase backend
- Vercel deployment

## 1) Environment Variables

Already included in `.env.local` for this workspace.

For new environments, copy values from `.env.example` into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 2) Supabase Setup

Run SQL from `supabase/schema.sql` in the Supabase SQL editor to create:
- `memories` table
- RLS policy for public read
- optional starter memory rows

## 3) Run Locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## 4) Customize Content Quickly

- Edit romantic content in `src/lib/site-content.ts`:
  - names
  - hero text
  - reasons list
  - love letter
  - relationship start date
  - music track URL
- Edit structure/styles in `src/app/page.tsx` and `src/app/globals.css`
- Add/modify memories in Supabase `memories` table

## 5) Deploy to Vercel

1. Push this project to GitHub
2. Import the repo in [Vercel](https://vercel.com/new)
3. Add the two environment variables in Vercel Project Settings
4. Deploy

The app is optimized for Vercel with static assets and server-side Supabase fetch + graceful fallback content.
