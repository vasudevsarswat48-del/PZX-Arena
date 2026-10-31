-- ============================================================
-- PZX Arena – Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text not null,
  role text not null default 'user' check (role in ('owner', 'admin', 'user')),
  stars numeric(10,1) not null default 0,
  avatar_url text,
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- QUIZZES ----------
create table if not exists public.quizzes (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  options text[] not null,
  correct_index int, -- null = pending
  difficulty text not null check (difficulty in ('easy', 'medium', 'hardcore')),
  created_by uuid references public.profiles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- QUIZ ATTEMPTS ----------
create table if not exists public.quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  chosen_index int not null,
  is_correct boolean,
  stars_delta numeric(5,1) not null default 0,
  created_at timestamptz not null default now(),
  unique (quiz_id, user_id)
);

-- ---------- UPDATES ----------
create table if not exists public.updates (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  tags text[] default '{}',
  image_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- COMMUNITY POSTS ----------
create table if not exists public.community_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text default '',
  image_url text,
  created_at timestamptz not null default now()
);

-- ---------- WINNERS ----------
create table if not exists public.winners (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  rankings text not null,
  created_at timestamptz not null default now()
);

-- ---------- INFO LINKS ----------
create table if not exists public.info_links (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  url text not null,
  sort_order int default 0
);

-- ---------- APP CONFIG (single row) ----------
create table if not exists public.app_config (
  id uuid primary key default uuid_generate_v4(),
  app_name text default 'PZX Arena - Pitch-Zen-Xplosive',
  app_logo text,
  account_name text default 'Vasudev',
  about_text text default 'Welcome to PZX Arena – the ultimate cricket quiz, prediction & community platform.',
  social_links jsonb default '[]',
  contact_email text default 'vasudevsarswat48@gmail.com'
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.updates enable row level security;
alter table public.community_posts enable row level security;
alter table public.winners enable row level security;
alter table public.info_links enable row level security;
alter table public.app_config enable row level security;

-- Profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Owner can update any profile (promote/ban)
create policy "Owner can update any profile"
  on public.profiles for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

-- Quizzes: everyone can read active; admins/owner can write
create policy "Anyone can read active quizzes"
  on public.quizzes for select using (is_active = true or exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin','owner')
  ));

create policy "Admins can insert quizzes"
  on public.quizzes for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','owner'))
  );

create policy "Admins can update quizzes"
  on public.quizzes for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','owner'))
  );

create policy "Admins can delete quizzes"
  on public.quizzes for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','owner'))
  );

-- Quiz attempts
create policy "Users can read own attempts"
  on public.quiz_attempts for select using (auth.uid() = user_id or exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin','owner')
  ));

create policy "Users can insert own attempts"
  on public.quiz_attempts for insert with check (auth.uid() = user_id);

-- Updates
create policy "Anyone can read updates"
  on public.updates for select using (true);

create policy "Admins can manage updates"
  on public.updates for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','owner'))
  );

-- Community
create policy "Anyone can read community posts"
  on public.community_posts for select using (true);

create policy "Authenticated users can insert posts"
  on public.community_posts for insert with check (auth.uid() = user_id);

create policy "Users can delete own posts"
  on public.community_posts for delete using (auth.uid() = user_id);

create policy "Owner can delete any post"
  on public.community_posts for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

-- Winners & links & config: public read, admin write
create policy "Anyone can read winners" on public.winners for select using (true);
create policy "Admins manage winners" on public.winners for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','owner'))
);

create policy "Anyone can read links" on public.info_links for select using (true);
create policy "Admins manage links" on public.info_links for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','owner'))
);

create policy "Anyone can read config" on public.app_config for select using (true);
create policy "Owner manages config" on public.app_config for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
);

-- ============================================================
-- STORAGE BUCKET (run in Storage or via API)
-- Create a public bucket named "uploads"
-- ============================================================
-- In Dashboard → Storage → New bucket → name: uploads → Public: ON
-- Then add policy:
-- create policy "Public read" on storage.objects for select using (bucket_id = 'uploads');
-- create policy "Auth upload" on storage.objects for insert with check (bucket_id = 'uploads' and auth.role() = 'authenticated');
-- create policy "Owner update/delete" on storage.objects for update using (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- AFTER FIRST SIGNUP AS OWNER:
-- Go to Table Editor → profiles → find your row → set role = 'owner'
-- ============================================================
