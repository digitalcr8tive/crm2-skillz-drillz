-- Apply to an existing project before deploying the updated booking functions.
alter table public.bookings
  add column if not exists email_notifications jsonb not null default '{}'::jsonb;

-- Only trusted booking functions may change reservation counts.
revoke execute on function public.reserve_slot(uuid) from public, anon, authenticated;
revoke execute on function public.release_slot(uuid) from public, anon, authenticated;
grant execute on function public.reserve_slot(uuid) to service_role;
grant execute on function public.release_slot(uuid) to service_role;
