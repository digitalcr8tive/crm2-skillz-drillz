begin;
alter table public.training_slots drop constraint if exists training_slots_starts_at_check;
alter table public.training_slots add constraint training_slots_training_day_check
  check (not is_open or extract(dow from starts_at at time zone 'America/Chicago') between 1 and 4) not valid;
alter table public.training_slots add column if not exists schedule_key text unique;

create or replace function public.reserve_slot(target_slot uuid, athletes integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if athletes is null or athletes < 1 or athletes > 12 then raise exception 'Choose between 1 and 12 athletes.'; end if;
  update public.training_slots set booked_count = booked_count + athletes
  where id = target_slot and is_open and starts_at > now() and booked_count + athletes <= capacity;
  if not found then raise exception 'This training time does not have enough spots available.'; end if;
end;
$$;
create or replace function public.release_slot(target_slot uuid, athletes integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if athletes is null or athletes < 1 or athletes > 12 then raise exception 'Invalid athlete count.'; end if;
  update public.training_slots set booked_count = greatest(booked_count - athletes, 0) where id = target_slot;
end;
$$;
-- Single-athlete member bookings retain the existing one-argument calls.
create or replace function public.reserve_slot(target_slot uuid)
returns void language sql security definer set search_path = public as $$ select public.reserve_slot(target_slot, 1); $$;
create or replace function public.release_slot(target_slot uuid)
returns void language sql security definer set search_path = public as $$ select public.release_slot(target_slot, 1); $$;
revoke execute on function public.reserve_slot(uuid, integer), public.release_slot(uuid, integer) from public, anon, authenticated;
grant execute on function public.reserve_slot(uuid, integer), public.release_slot(uuid, integer) to service_role;

create or replace function public.refresh_training_schedule()
returns integer language plpgsql security definer set search_path = public as $$
declare added integer;
begin
  -- Keep twelve weeks ahead. Local-time conversion follows Central daylight saving.
  -- Conflict handling preserves bookings and manually closed dates.
  insert into public.training_slots (starts_at, duration_minutes, capacity, schedule_key)
  select (day::date + make_time(hour, 0, 0)) at time zone 'America/Chicago', 60, 12,
    'weekly-' || day::date::text || '-' || hour::text
  from generate_series(0, 83) as offsets(n)
  cross join lateral (select (now() at time zone 'America/Chicago')::date + n as day) as dates
  cross join generate_series(15, 18) as hours(hour)
  where extract(dow from day) between 1 and 4
    and (day::date + make_time(hour, 0, 0)) at time zone 'America/Chicago' > now()
  on conflict (schedule_key) do nothing;
  get diagnostics added = row_count;
  return added;
end;
$$;
revoke execute on function public.refresh_training_schedule() from public, anon, authenticated;
select public.refresh_training_schedule();
create extension if not exists pg_cron;
select cron.schedule('crm2-refresh-training-schedule', '0 9 * * *', 'select public.refresh_training_schedule();');
commit;
