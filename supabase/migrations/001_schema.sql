-- Blake Aitken Portfolio — Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── Projects ──────────────────────────────────────────────────────────────
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text unique not null,
  category    text not null check (category in ('art', 'architecture', 'concept', 'venture')),
  date        text not null,
  location    text,
  description text,
  featured    boolean default false,
  archived    boolean default false,
  sort_order  integer default 0,
  tags        text[] default '{}',
  model_url   text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── Project Images ─────────────────────────────────────────────────────────
create table if not exists project_images (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid references projects(id) on delete cascade,
  url          text not null,
  alt          text,
  width        integer not null,
  height       integer not null,
  sort_order   integer default 0,
  is_thumbnail boolean default false
);

-- ─── Blog Posts ─────────────────────────────────────────────────────────────
create table if not exists blog_posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text unique not null,
  excerpt      text,
  content      text not null,
  category     text,
  published    boolean default false,
  published_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─── Form Submissions ───────────────────────────────────────────────────────
create table if not exists form_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  read       boolean default false,
  created_at timestamptz default now()
);

-- ─── Ensure only one featured project ──────────────────────────────────────
create or replace function enforce_single_featured()
returns trigger language plpgsql as $$
begin
  if new.featured = true then
    update projects set featured = false where id != new.id;
  end if;
  return new;
end;
$$;

create or replace trigger single_featured
  before insert or update on projects
  for each row execute function enforce_single_featured();

-- ─── Updated-at trigger ─────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

create or replace trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function update_updated_at();

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table projects        enable row level security;
alter table project_images  enable row level security;
alter table blog_posts      enable row level security;
alter table form_submissions enable row level security;

-- Public read: non-archived projects + their images
create policy "Public read projects"
  on projects for select
  using (archived = false);

create policy "Public read project_images"
  on project_images for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_images.project_id
        and projects.archived = false
    )
  );

-- Public read: published blog posts
create policy "Public read blog_posts"
  on blog_posts for select
  using (published = true);

-- Public insert: contact form (anyone can submit)
create policy "Public insert form_submissions"
  on form_submissions for insert
  with check (true);

-- Admin full access (replace with your email)
create policy "Admin projects"
  on projects for all
  using (auth.jwt() ->> 'email' = 'blakeaitkenwork@gmail.com');

create policy "Admin project_images"
  on project_images for all
  using (auth.jwt() ->> 'email' = 'blakeaitkenwork@gmail.com');

create policy "Admin blog_posts"
  on blog_posts for all
  using (auth.jwt() ->> 'email' = 'blakeaitkenwork@gmail.com');

create policy "Admin form_submissions"
  on form_submissions for all
  using (auth.jwt() ->> 'email' = 'blakeaitkenwork@gmail.com');

-- ─── Storage: project-images bucket ─────────────────────────────────────────
-- Run this separately after creating the bucket in the dashboard:
-- insert into storage.buckets (id, name, public) values ('project-images', 'project-images', true);

create policy "Public read storage"
  on storage.objects for select
  using (bucket_id = 'project-images');

create policy "Admin upload storage"
  on storage.objects for insert
  with check (
    bucket_id = 'project-images'
    and auth.jwt() ->> 'email' = 'blakeaitkenwork@gmail.com'
  );

create policy "Admin delete storage"
  on storage.objects for delete
  using (
    bucket_id = 'project-images'
    and auth.jwt() ->> 'email' = 'blakeaitkenwork@gmail.com'
  );
