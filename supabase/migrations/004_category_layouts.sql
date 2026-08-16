-- Per-discipline grid settings for the landing page index, mirroring the
-- per-project grid_* columns that drive a work page's image grid.
create table if not exists public.category_layouts (
  category   text primary key check (category in ('art', 'architecture', 'concept', 'venture', 'university')),
  row_height integer not null default 320,
  h_gap      integer not null default 3,
  v_gap      integer not null default 22,
  last_row   text    not null default 'left' check (last_row in ('left', 'center', 'fill')),
  updated_at timestamptz default now()
);

insert into public.category_layouts (category)
values ('art'), ('architecture'), ('concept'), ('venture'), ('university')
on conflict (category) do nothing;

alter table public.category_layouts enable row level security;

drop policy if exists "Public read category_layouts" on public.category_layouts;
create policy "Public read category_layouts"
  on public.category_layouts for select
  using (true);

drop policy if exists "Admin category_layouts" on public.category_layouts;
create policy "Admin category_layouts"
  on public.category_layouts for all
  using (auth.jwt() ->> 'email' = 'blakeaitkenwork@gmail.com');
