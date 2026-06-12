-- LifeCycle — Supabase schema (B-1)
-- Supabase SQL Editor에서 실행하거나 CLI migrate 사용

-- ——— categories ———
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_user_id_idx on public.categories (user_id);

-- ——— management_items ———
create table if not exists public.management_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_cycle_days int not null,
  category_id uuid not null references public.categories (id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'archived')),
  notification_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists management_items_user_id_idx on public.management_items (user_id);
create index if not exists management_items_category_id_idx on public.management_items (category_id);

-- ——— activity_logs ———
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references public.management_items (id) on delete cascade,
  performed_at date not null,
  cost numeric(12, 2),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activity_logs_user_id_idx on public.activity_logs (user_id);
create index if not exists activity_logs_item_id_idx on public.activity_logs (item_id);
create index if not exists activity_logs_performed_at_idx on public.activity_logs (performed_at);

-- ——— RLS ———
alter table public.categories enable row level security;
alter table public.management_items enable row level security;
alter table public.activity_logs enable row level security;

create policy "categories_select_own"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "categories_insert_own"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "categories_update_own"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories_delete_own"
  on public.categories for delete
  using (auth.uid() = user_id);

create policy "items_select_own"
  on public.management_items for select
  using (auth.uid() = user_id);

create policy "items_insert_own"
  on public.management_items for insert
  with check (auth.uid() = user_id);

create policy "items_update_own"
  on public.management_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "items_delete_own"
  on public.management_items for delete
  using (auth.uid() = user_id);

create policy "logs_select_own"
  on public.activity_logs for select
  using (auth.uid() = user_id);

create policy "logs_insert_own"
  on public.activity_logs for insert
  with check (auth.uid() = user_id);

create policy "logs_update_own"
  on public.activity_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "logs_delete_own"
  on public.activity_logs for delete
  using (auth.uid() = user_id);

-- ——— updated_at trigger ———
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists management_items_updated_at on public.management_items;
create trigger management_items_updated_at
  before update on public.management_items
  for each row execute function public.set_updated_at();

drop trigger if exists activity_logs_updated_at on public.activity_logs;
create trigger activity_logs_updated_at
  before update on public.activity_logs
  for each row execute function public.set_updated_at();
