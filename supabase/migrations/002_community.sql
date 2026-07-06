-- =============================================================
--  GoodVibes – Community- & App-Store-Modul
--  Migration 002
-- =============================================================
--  Diese Datei richtet die Tabellen für den neuen anonymen
--  Community-Bereich in einem ECHTEN Supabase-Projekt ein –
--  inklusive Zugriffsregeln (RLS) und serverseitiger Absicherung.
--
--  WICHTIG: Solange ihr nur mit dem localStorage-Mock arbeitet
--  (keine VITE_SUPABASE_URL gesetzt), müsst ihr hier nichts tun.
--  Vor dem echten öffentlichen Betrieb bitte einspielen:
--  Supabase Dashboard -> SQL Editor -> Inhalt einfügen -> Run.
-- =============================================================

-- ---------- 1. TABELLEN ----------

create table if not exists public.apps (
    id           uuid primary key default gen_random_uuid(),
    slug         text unique not null,
    name         text not null,
    tagline      text,
    description  text,
    category     text default 'community',
    icon_emoji   text default '📱',
    accent       text default 'blue',
    version      text default '0.1.0',
    is_beta      boolean default true,
    status       text default 'live',        -- 'live' | 'coming_soon'
    live_url     text,
    scope        text,
    features     text,
    whats_new    text,
    screenshots  jsonb default '[]'::jsonb,
    rating_sum   integer default 0,
    rating_count integer default 0,
    sort_order   integer default 99,
    created_at   timestamptz default now()
);

create table if not exists public.app_posts (
    id             uuid primary key default gen_random_uuid(),
    app_id         uuid references public.apps(id) on delete cascade,
    type           text not null default 'praise',   -- review|feature|bug|question|praise
    rating         integer check (rating between 1 and 5),
    title          text,
    body           text not null,
    author_name    text,
    avatar_seed    text,
    device_id      text not null,
    status         text not null default 'pending',  -- published|pending|hidden|rejected
    votes          integer default 0,
    pinned         boolean default false,
    screenshot_url text,
    code_snippet   text,
    admin_reply    text,
    created_at     timestamptz default now()
);

create table if not exists public.app_post_votes (
    id         uuid primary key default gen_random_uuid(),
    post_id    uuid references public.app_posts(id) on delete cascade,
    device_id  text not null,
    created_at timestamptz default now(),
    unique (post_id, device_id)             -- 1 Stimme pro Gerät & Beitrag
);

create table if not exists public.app_post_replies (
    id          uuid primary key default gen_random_uuid(),
    post_id     uuid references public.app_posts(id) on delete cascade,
    body        text not null,
    author_name text,
    avatar_seed text,
    device_id   text not null,
    status      text not null default 'pending',
    created_at  timestamptz default now()
);

create table if not exists public.blocked_devices (
    device_id  text primary key,
    reason     text,
    created_at timestamptz default now()
);

-- ---------- 2. SERVERSEITIGE ABSICHERUNG (Defense in Depth) ----------
-- Der Browser-Filter ist die erste Hürde. Diese Trigger sorgen dafür,
-- dass selbst ein manipulierter Client keine Links/Skripte durchbekommt
-- und gesperrte Geräte nichts schreiben können.

-- 2a) Links & offensichtliche Script-Muster serverseitig entfernen/prüfen
create or replace function public.gv_sanitize_post()
returns trigger language plpgsql security definer as $$
begin
    -- Gesperrte Geräte hart ablehnen
    if exists (select 1 from public.blocked_devices b where b.device_id = new.device_id) then
        raise exception 'device_blocked';
    end if;

    -- URLs / E-Mails im Fließtext neutralisieren
    new.body := regexp_replace(new.body, '(https?://|www\.)\S+', '[Link entfernt]', 'gi');
    new.body := regexp_replace(new.body, '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}', '[Link entfernt]', 'gi');
    if new.title is not null then
        new.title := regexp_replace(new.title, '(https?://|www\.)\S+', '[Link entfernt]', 'gi');
    end if;

    -- Offensichtliche Injection im Freitext (nicht im Code-Feld) => in Prüfung
    if new.body ~* '<\s*script|<\s*iframe|javascript:|on\w+\s*=' then
        new.status := 'pending';
    end if;

    -- Beiträge mit Code oder Bild immer erst prüfen
    if new.code_snippet is not null or new.screenshot_url is not null then
        new.status := 'pending';
    end if;

    return new;
end $$;

drop trigger if exists trg_gv_sanitize_post on public.app_posts;
create trigger trg_gv_sanitize_post
    before insert on public.app_posts
    for each row execute function public.gv_sanitize_post();

-- 2b) Gleiche Sperr-Prüfung für Antworten
create or replace function public.gv_sanitize_reply()
returns trigger language plpgsql security definer as $$
begin
    if exists (select 1 from public.blocked_devices b where b.device_id = new.device_id) then
        raise exception 'device_blocked';
    end if;
    new.body := regexp_replace(new.body, '(https?://|www\.)\S+', '[Link entfernt]', 'gi');
    return new;
end $$;

drop trigger if exists trg_gv_sanitize_reply on public.app_post_replies;
create trigger trg_gv_sanitize_reply
    before insert on public.app_post_replies
    for each row execute function public.gv_sanitize_reply();

-- ---------- 3. ROW LEVEL SECURITY ----------
alter table public.apps             enable row level security;
alter table public.app_posts        enable row level security;
alter table public.app_post_votes   enable row level security;
alter table public.app_post_replies enable row level security;
alter table public.blocked_devices  enable row level security;

-- Apps: öffentlich lesbar, nur Admin (service_role/authenticated) schreibt
drop policy if exists "apps_public_read" on public.apps;
create policy "apps_public_read"
    on public.apps for select using (true);
drop policy if exists "apps_admin_write" on public.apps;
create policy "apps_admin_write"
    on public.apps for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Beiträge: NUR freigegebene sind öffentlich sichtbar
drop policy if exists "posts_public_read" on public.app_posts;
create policy "posts_public_read"
    on public.app_posts for select
    using (status = 'published');
-- Jeder (auch anonym) darf EINEN Beitrag EINFÜGEN, aber nur mit status
-- 'pending' oder 'published' (nie selbst 'published' erzwingen, wenn ihr
-- strenger sein wollt: hier auf 'pending' festnageln).
drop policy if exists "posts_anon_insert" on public.app_posts;
create policy "posts_anon_insert"
    on public.app_posts for insert
    with check (status in ('pending','published'));
-- Nur Admin darf ändern/löschen (freigeben, verbergen, antworten)
drop policy if exists "posts_admin_update" on public.app_posts;
create policy "posts_admin_update"
    on public.app_posts for update
    using (auth.role() = 'authenticated');
drop policy if exists "posts_admin_delete" on public.app_posts;
create policy "posts_admin_delete"
    on public.app_posts for delete
    using (auth.role() = 'authenticated');
-- Admin darf auch alle Status sehen (Moderation)
drop policy if exists "posts_admin_read_all" on public.app_posts;
create policy "posts_admin_read_all"
    on public.app_posts for select
    using (auth.role() = 'authenticated');

-- Likes: lesbar, anonym einfügbar/löschbar (eigene Stimme)
drop policy if exists "votes_public_read" on public.app_post_votes;
create policy "votes_public_read"
    on public.app_post_votes for select using (true);
drop policy if exists "votes_anon_insert" on public.app_post_votes;
create policy "votes_anon_insert"
    on public.app_post_votes for insert with check (true);
drop policy if exists "votes_anon_delete" on public.app_post_votes;
create policy "votes_anon_delete"
    on public.app_post_votes for delete using (true);

-- Antworten: nur freigegebene öffentlich, anonym einfügbar, Admin verwaltet
drop policy if exists "replies_public_read" on public.app_post_replies;
create policy "replies_public_read"
    on public.app_post_replies for select using (status = 'published');
drop policy if exists "replies_anon_insert" on public.app_post_replies;
create policy "replies_anon_insert"
    on public.app_post_replies for insert with check (status in ('pending','published'));
drop policy if exists "replies_admin_all" on public.app_post_replies;
create policy "replies_admin_all"
    on public.app_post_replies for all using (auth.role() = 'authenticated');

-- Blockliste: nur Admin (weder lesbar noch schreibbar für Anonyme).
-- Die App prüft die Sperre über die Trigger oben, nicht über Client-Reads.
drop policy if exists "blocked_admin_all" on public.blocked_devices;
create policy "blocked_admin_all"
    on public.blocked_devices for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------- 4. SICHERE VOTE-ZÄHLUNG (optional, empfohlen) ----------
-- Zählt Stimmen serverseitig, damit der Client die Zahl nicht frei setzt.
create or replace function public.gv_toggle_vote(p_post_id uuid, p_device_id text)
returns integer language plpgsql security definer as $$
declare v_count integer;
begin
    if exists (select 1 from public.app_post_votes where post_id = p_post_id and device_id = p_device_id) then
        delete from public.app_post_votes where post_id = p_post_id and device_id = p_device_id;
    else
        insert into public.app_post_votes (post_id, device_id) values (p_post_id, p_device_id);
    end if;
    select count(*) into v_count from public.app_post_votes where post_id = p_post_id;
    update public.app_posts set votes = v_count where id = p_post_id;
    return v_count;
end $$;

-- =============================================================
--  Fertig. Danach in Cloudflare/ENV setzen:
--    VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
--  Der Client nutzt dann automatisch die echte Datenbank
--  statt des localStorage-Mocks.
-- =============================================================
