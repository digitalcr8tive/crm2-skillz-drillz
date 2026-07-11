create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  parent_name text not null,
  phone text,
  athlete_name text,
  athlete_age text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.training_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null check (extract(dow from starts_at at time zone 'America/Chicago') not in (3, 5)),
  duration_minutes integer not null default 60 check (duration_minutes between 30 and 180),
  capacity integer not null default 4 check (capacity > 0),
  booked_count integer not null default 0 check (booked_count >= 0),
  is_open boolean not null default true,
  location text not null default 'Little Rock, Arkansas',
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.training_slots(id),
  user_id uuid references auth.users(id),
  parent_name text not null,
  phone text not null,
  email text not null,
  athlete_age text,
  athlete_count integer not null default 1 check (athlete_count > 0),
  notes text,
  status text not null default 'pending_deposit' check (status in ('pending_deposit', 'confirmed', 'cancelled', 'completed')),
  deposit_amount numeric(8,2) not null default 25,
  balance_due numeric(8,2) not null default 25,
  deposit_received_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists training_slots_starts_at_idx on public.training_slots(starts_at);
create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists bookings_slot_id_idx on public.bookings(slot_id);

alter table public.profiles enable row level security;
alter table public.training_slots enable row level security;
alter table public.bookings enable row level security;

create policy "Anyone can view open future slots" on public.training_slots
for select using (is_open = true and starts_at >= now());

create policy "Members can view their profile" on public.profiles
for select using (auth.uid() = id);

create policy "Members can update their profile" on public.profiles
for update using (auth.uid() = id);

create policy "Members can view their bookings" on public.bookings
for select using (auth.uid() = user_id);

create or replace function public.reserve_slot(target_slot uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.training_slots
  set booked_count = booked_count + 1
  where id = target_slot
    and is_open = true
    and booked_count < capacity;
  if not found then
    raise exception 'This training time is no longer available.';
  end if;
end;
$$;

create or replace function public.release_slot(target_slot uuid)
returns void
language sql
security definer
as $$
  update public.training_slots
  set booked_count = greatest(booked_count - 1, 0)
  where id = target_slot;
$$;

-- Starter availability. Replace these with dates managed from the Supabase table editor.
insert into public.training_slots (starts_at, capacity)
select date_trunc('day', now()) + interval '3 days 17 hours', 4
where not exists (select 1 from public.training_slots);
insert into public.training_slots (starts_at, capacity)
select date_trunc('day', now()) + interval '5 days 10 hours', 4
where (select count(*) from public.training_slots) = 1;
insert into public.training_slots (starts_at, capacity)
select date_trunc('day', now()) + interval '7 days 18 hours', 6
where (select count(*) from public.training_slots) = 2;
