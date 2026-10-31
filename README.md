# PZX Arena – Pitch-Zen-Xplosive

Modern, fast cricket quiz + community platform built with **Vite + React + TypeScript + Tailwind + Supabase**.

## Features

- **Real email OTP** authentication (no passwords stored in code)
- **Quizzes** – one-at-a-time (Marks style), green/red highlight + sound effects
  - Easy (+5 / –1) – always open
  - Medium (+7 / –0.5) – unlocks at 50★
  - Hardcore (+10 / 0) – unlocks at 100★
- **Updates** – admin-published news with images, tags, load-more
- **Community** – text + image posts, realtime, delete own posts
- **Leaderboard** – auto-sorted by stars + announced winners
- **Roles**
  - **Owner** (Vasudev): everything + promote/demote admins, ban users, edit About
  - **Admin**: create/edit quizzes & updates
  - **User**: view updates, attempt quizzes, chat
- **4 Themes**: Light (default), Dark, Cricket, Neon
- **AdSense-ready**: Privacy Policy, Terms, Contact pages
- Favicon retained as logo, site name unchanged

## Quick Start

### 1. Create Supabase project
1. Go to [supabase.com](https://supabase.com) → New project
2. Copy **Project URL** and **anon public key**

### 2. Run the SQL schema
Open Supabase Dashboard → SQL Editor → paste the contents of `supabase-schema.sql` → Run.

### 3. Create Storage bucket
Dashboard → Storage → New bucket → name: `uploads` → make it **Public**.

### 4. Environment
```bash
cp .env.example .env.local
```
Edit `.env.local`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 5. Install & run
```bash
npm install
npm run dev
```
Open http://localhost:5173

### 6. Become Owner
1. Sign up with your email (`vasudevsarswat48@gmail.com`)
2. In Supabase Table Editor → `profiles` → find your row → set `role` = `owner`

**Never put the owner password in any code or env file that is committed.**  
The owner is identified solely by the `role` column in the database.

## Deploy

### Frontend (Vercel / Netlify / Cloudflare Pages)
```bash
npm run build
```
Upload the `dist/` folder or connect the Git repo.  
Add the same `VITE_SUPABASE_*` env vars in the hosting dashboard.

### Custom domain
Point your domain to the hosting provider and update Supabase Auth → URL Configuration with the new domain.

## Project Structure
```
src/
  components/   Layout, LoadingScreen
  context/      AuthContext, ThemeContext
  lib/          supabase client, utils (rich text, sounds)
  pages/        all screens
  types/        TypeScript interfaces
public/         favicon.png
supabase-schema.sql
```

## Notes
- Owner credentials are **never** hard-coded.
- All data lives in Supabase → every user sees the same quizzes, updates, community posts.
- Matches section completely removed as requested.
- Text enhancements: write `*bold*` or `**bold**` in questions, updates, posts.
