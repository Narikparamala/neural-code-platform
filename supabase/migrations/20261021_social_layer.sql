-- CosmicSpirit0 social layer
-- Profiles, shared presets + reviews, session history/streaks, and Circles (groups).
-- Safe to re-run: everything is IF NOT EXISTS / CREATE OR REPLACE.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create or replace function public.is_owner()
returns boolean language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'narikparamala@gmail.com';
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null,
  display_name text not null default 'Listener',
  bio text,
  avatar_url text,
  streak_days int not null default 0,
  longest_streak int not null default 0,
  last_session_date date,
  total_sessions int not null default 0,
  total_minutes int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_handle_unique on public.profiles (lower(handle));

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select using (true);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_admin on public.profiles;
create policy profiles_admin on public.profiles for all
using (public.is_owner()) with check (public.is_owner());

-- Create a profile for every new auth user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  base := lower(regexp_replace(split_part(coalesce(new.email, 'listener'), '@', 1), '[^a-zA-Z0-9]+', '', 'g'));
  if base is null or base = '' then base := 'listener'; end if;
  base := left(base, 18);
  candidate := base;
  while exists (select 1 from public.profiles where lower(handle) = lower(candidate)) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;
  insert into public.profiles (id, handle, display_name)
  values (new.id, candidate, initcap(base))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill profiles for accounts created before the trigger.
insert into public.profiles (id, handle, display_name)
select u.id,
       left(lower(regexp_replace(split_part(coalesce(u.email, 'listener'), '@', 1), '[^a-zA-Z0-9]+', '', 'g')), 18) || '1',
       initcap(left(coalesce(u.email, 'listener'), 1))
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- presets
-- ---------------------------------------------------------------------------
create table if not exists public.presets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  lab text not null,
  title text not null,
  description text,
  config jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  plays int not null default 0,
  rating_sum int not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists presets_lab_idx on public.presets (lab, created_at desc);
create index if not exists presets_owner_idx on public.presets (owner_id, created_at desc);

drop trigger if exists presets_touch on public.presets;
create trigger presets_touch before update on public.presets
for each row execute function public.touch_updated_at();

alter table public.presets enable row level security;

drop policy if exists presets_read on public.presets;
create policy presets_read on public.presets for select
using (is_public or auth.uid() = owner_id or public.is_owner());

drop policy if exists presets_insert_own on public.presets;
create policy presets_insert_own on public.presets for insert
with check (auth.uid() = owner_id);

drop policy if exists presets_update_own on public.presets;
create policy presets_update_own on public.presets for update
using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists presets_delete_own on public.presets;
create policy presets_delete_own on public.presets for delete
using (auth.uid() = owner_id or public.is_owner());

-- ---------------------------------------------------------------------------
-- preset reviews (one per person per preset)
-- ---------------------------------------------------------------------------
create table if not exists public.preset_reviews (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.presets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (preset_id, user_id)
);

create index if not exists preset_reviews_preset_idx on public.preset_reviews (preset_id, created_at desc);

drop trigger if exists preset_reviews_touch on public.preset_reviews;
create trigger preset_reviews_touch before update on public.preset_reviews
for each row execute function public.touch_updated_at();

alter table public.preset_reviews enable row level security;

drop policy if exists preset_reviews_read on public.preset_reviews;
create policy preset_reviews_read on public.preset_reviews for select using (true);

drop policy if exists preset_reviews_insert_own on public.preset_reviews;
create policy preset_reviews_insert_own on public.preset_reviews for insert
with check (auth.uid() = user_id);

drop policy if exists preset_reviews_update_own on public.preset_reviews;
create policy preset_reviews_update_own on public.preset_reviews for update
using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists preset_reviews_delete_own on public.preset_reviews;
create policy preset_reviews_delete_own on public.preset_reviews for delete
using (auth.uid() = user_id or public.is_owner());

create or replace function public.sync_preset_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target uuid := coalesce(new.preset_id, old.preset_id);
begin
  update public.presets p
  set rating_sum = coalesce((select sum(rating) from public.preset_reviews where preset_id = target), 0),
      rating_count = coalesce((select count(*) from public.preset_reviews where preset_id = target), 0)
  where p.id = target;
  return null;
end $$;

drop trigger if exists preset_reviews_sync on public.preset_reviews;
create trigger preset_reviews_sync
after insert or update or delete on public.preset_reviews
for each row execute function public.sync_preset_rating();

-- ---------------------------------------------------------------------------
-- preset likes
-- ---------------------------------------------------------------------------
create table if not exists public.preset_likes (
  preset_id uuid not null references public.presets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (preset_id, user_id)
);

alter table public.preset_likes enable row level security;

drop policy if exists preset_likes_read on public.preset_likes;
create policy preset_likes_read on public.preset_likes for select using (true);

drop policy if exists preset_likes_insert_own on public.preset_likes;
create policy preset_likes_insert_own on public.preset_likes for insert
with check (auth.uid() = user_id);

drop policy if exists preset_likes_delete_own on public.preset_likes;
create policy preset_likes_delete_own on public.preset_likes for delete
using (auth.uid() = user_id);

-- Count a play without letting the client edit anything else.
create or replace function public.increment_preset_plays(p_preset_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.presets set plays = plays + 1
  where id = p_preset_id and (is_public or owner_id = auth.uid() or public.is_owner());
$$;

-- ---------------------------------------------------------------------------
-- sessions + streaks
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lab text not null,
  preset_id uuid references public.presets(id) on delete set null,
  duration_seconds int not null default 0 check (duration_seconds between 0 and 21600),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_idx on public.sessions (user_id, created_at desc);

alter table public.sessions enable row level security;

drop policy if exists sessions_read_own on public.sessions;
create policy sessions_read_own on public.sessions for select
using (auth.uid() = user_id or public.is_owner());

drop policy if exists sessions_insert_own on public.sessions;
create policy sessions_insert_own on public.sessions for insert
with check (auth.uid() = user_id);

drop policy if exists sessions_delete_own on public.sessions;
create policy sessions_delete_own on public.sessions for delete
using (auth.uid() = user_id or public.is_owner());

create or replace function public.record_session(
  p_lab text,
  p_duration_seconds int default 0,
  p_details jsonb default '{}'::jsonb,
  p_preset_id uuid default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  today date := (now() at time zone 'utc')::date;
  prof public.profiles;
  new_streak int;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;
  if p_lab is null or length(trim(p_lab)) = 0 then
    raise exception 'Lab is required';
  end if;

  insert into public.sessions (user_id, lab, preset_id, duration_seconds, details)
  values (uid, left(p_lab, 40), p_preset_id, greatest(0, least(coalesce(p_duration_seconds, 0), 21600)), coalesce(p_details, '{}'::jsonb));

  select * into prof from public.profiles where id = uid for update;
  if prof.id is null then
    raise exception 'Profile missing';
  end if;

  if prof.last_session_date = today then
    new_streak := greatest(prof.streak_days, 1);
  elsif prof.last_session_date = today - 1 then
    new_streak := greatest(prof.streak_days, 0) + 1;
  else
    new_streak := 1;
  end if;

  update public.profiles
  set streak_days = new_streak,
      longest_streak = greatest(longest_streak, new_streak),
      last_session_date = today,
      total_sessions = total_sessions + 1,
      total_minutes = total_minutes + greatest(0, round(coalesce(p_duration_seconds, 0) / 60.0)::int)
  where id = uid;

  return jsonb_build_object(
    'streak_days', new_streak,
    'longest_streak', greatest(prof.longest_streak, new_streak),
    'total_sessions', prof.total_sessions + 1,
    'total_minutes', prof.total_minutes + greatest(0, round(coalesce(p_duration_seconds, 0) / 60.0)::int)
  );
end $$;

-- ---------------------------------------------------------------------------
-- circles (groups)
-- ---------------------------------------------------------------------------
create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  invite_code text not null default substr(md5(random()::text || clock_timestamp()::text), 1, 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists circles_slug_unique on public.circles (lower(slug));
create unique index if not exists circles_code_unique on public.circles (invite_code);

drop trigger if exists circles_touch on public.circles;
create trigger circles_touch before update on public.circles
for each row execute function public.touch_updated_at();

alter table public.circles enable row level security;

create table if not exists public.circle_members (
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);

create index if not exists circle_members_user_idx on public.circle_members (user_id);

create or replace function public.is_circle_member(p_circle_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.circle_members
    where circle_id = p_circle_id and user_id = auth.uid()
  );
$$;

drop policy if exists circles_read on public.circles;
create policy circles_read on public.circles for select
using (visibility = 'public' or public.is_circle_member(id) or owner_id = auth.uid() or public.is_owner());

drop policy if exists circles_insert_own on public.circles;
create policy circles_insert_own on public.circles for insert
with check (auth.uid() = owner_id);

drop policy if exists circles_update_owner on public.circles;
create policy circles_update_owner on public.circles for update
using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists circles_delete_owner on public.circles;
create policy circles_delete_owner on public.circles for delete
using (auth.uid() = owner_id or public.is_owner());

alter table public.circle_members enable row level security;

drop policy if exists circle_members_read on public.circle_members;
create policy circle_members_read on public.circle_members for select
using (
  user_id = auth.uid()
  or public.is_circle_member(circle_id)
  or exists (select 1 from public.circles c where c.id = circle_id and c.visibility = 'public')
  or public.is_owner()
);

drop policy if exists circle_members_insert_self on public.circle_members;
create policy circle_members_insert_self on public.circle_members for insert
with check (user_id = auth.uid());

drop policy if exists circle_members_delete_self on public.circle_members;
create policy circle_members_delete_self on public.circle_members for delete
using (user_id = auth.uid() or public.is_owner());

drop policy if exists circle_members_update_self on public.circle_members;
create policy circle_members_update_self on public.circle_members for update
using (user_id = auth.uid() or public.is_owner())
with check (user_id = auth.uid() or public.is_owner());

-- Owner joins automatically.
create or replace function public.add_circle_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.circle_members (circle_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (circle_id, user_id) do update set role = 'owner';
  return new;
end $$;

drop trigger if exists circles_add_owner on public.circles;
create trigger circles_add_owner after insert on public.circles
for each row execute function public.add_circle_owner();

create table if not exists public.circle_messages (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text,
  preset_id uuid references public.presets(id) on delete set null,
  created_at timestamptz not null default now(),
  check (body is not null or preset_id is not null),
  check (body is null or char_length(body) <= 2000)
);

create index if not exists circle_messages_idx on public.circle_messages (circle_id, created_at desc);

alter table public.circle_messages enable row level security;

drop policy if exists circle_messages_read on public.circle_messages;
create policy circle_messages_read on public.circle_messages for select
using (public.is_circle_member(circle_id) or public.is_owner());

drop policy if exists circle_messages_insert_member on public.circle_messages;
create policy circle_messages_insert_member on public.circle_messages for insert
with check (user_id = auth.uid() and public.is_circle_member(circle_id));

drop policy if exists circle_messages_delete_own on public.circle_messages;
create policy circle_messages_delete_own on public.circle_messages for delete
using (user_id = auth.uid() or public.is_owner());

create or replace function public.join_circle(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  c public.circles;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  select * into c from public.circles where invite_code = lower(trim(p_code)) or lower(slug) = lower(trim(p_code));
  if c.id is null then raise exception 'Circle not found'; end if;
  insert into public.circle_members (circle_id, user_id, role)
  values (c.id, uid, 'member')
  on conflict (circle_id, user_id) do nothing;
  return jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'visibility', c.visibility);
end $$;

create or replace function public.mark_circle_read(p_circle_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.circle_members set last_read_at = now()
  where circle_id = p_circle_id and user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- grants
-- ---------------------------------------------------------------------------
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

grant select on public.presets, public.preset_reviews, public.preset_likes to anon, authenticated;
grant insert, update, delete on public.presets to authenticated;
grant insert, update, delete on public.preset_reviews to authenticated;
grant insert, delete on public.preset_likes to authenticated;

grant select, insert, delete on public.sessions to authenticated;

grant select on public.circles to anon, authenticated;
grant insert, update, delete on public.circles to authenticated;
grant select on public.circle_members to anon, authenticated;
grant insert, update, delete on public.circle_members to authenticated;
grant select, insert, delete on public.circle_messages to authenticated;

grant execute on function public.record_session(text, int, jsonb, uuid) to authenticated;
grant execute on function public.join_circle(text) to authenticated;
grant execute on function public.mark_circle_read(uuid) to authenticated;
grant execute on function public.increment_preset_plays(uuid) to anon, authenticated;
grant execute on function public.is_circle_member(uuid) to anon, authenticated;
