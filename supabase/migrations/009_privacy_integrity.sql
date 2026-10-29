-- =============================================================
--  GoodVibes – Datenschutz & Datenintegritaet
--  Migration 009
-- =============================================================
--  Behebt:
--   1. Kontaktangaben (z. B. E-Mail) aus dem Fehlermelder waren
--      oeffentlich lesbar  -> nur noch fuer den Admin sichtbar.
--   2. Jeder konnte alle Likes loeschen -> Likes nur noch ueber
--      sichere Server-Funktionen.
--   3. Geraete-Kennungen waren oeffentlich lesbar -> verborgen.
--   4. Likes, Bewertungen und Bug-Stimmen wurden live nicht
--      gespeichert (Rechte fehlten) -> laufen jetzt serverseitig.
--   5. App-Bewertungen werden automatisch aus den freigegebenen
--      Bewertungen berechnet (kein Verzaehlen mehr moeglich).
--
--  Komplett markieren, im SQL-Editor einfuegen, "Run".
--  Gefahrlos mehrfach ausfuehrbar.
-- =============================================================


-- =============================================================
-- Hilfsfunktion: Spalten fuer Besucher verbergen
-- Besucher (anon) duerfen nur noch die "harmlosen" Spalten lesen.
-- Der eingeloggte Admin sieht weiterhin alles.
-- =============================================================
create or replace function pg_temp.hide_columns(p_table text, p_hidden text[])
returns void language plpgsql as $$
declare v_cols text;
begin
    select string_agg(quote_ident(column_name), ', ')
      into v_cols
      from information_schema.columns
     where table_schema = 'public' and table_name = p_table
       and column_name <> all (p_hidden);

    execute format('revoke select on public.%I from anon', p_table);
    execute format('grant select (%s) on public.%I to anon', v_cols, p_table);
    execute format('grant select on public.%I to authenticated', p_table);
end $$;


-- =============================================================
-- 1) FEHLERMELDER (bug_reports / bug_report_votes)
-- =============================================================
alter table public.bug_reports      enable row level security;
alter table public.bug_report_votes enable row level security;

-- Alle bisherigen Regeln entfernen und sauber neu aufsetzen
do $$
declare r record;
begin
    for r in select policyname, tablename from pg_policies
             where schemaname = 'public' and tablename in ('bug_reports', 'bug_report_votes')
    loop
        execute format('drop policy %I on public.%I', r.policyname, r.tablename);
    end loop;
end $$;

create policy "bug_public_read"   on public.bug_reports for select using (true);
create policy "bug_public_insert" on public.bug_reports for insert
    with check (status = 'new' and coalesce(votes, 0) = 0);
create policy "bug_admin_all"     on public.bug_reports for all to authenticated
    using (true) with check (true);

-- Stimmen: nur der Admin liest/aendert direkt, Besucher gehen ueber die Funktionen unten
create policy "bugvotes_admin_all" on public.bug_report_votes for all to authenticated
    using (true) with check (true);

-- Kontaktangabe + Geraete-Kennung fuer Besucher unsichtbar machen
select pg_temp.hide_columns('bug_reports', array['contact_info', 'reporter_device_id']);
revoke select on public.bug_report_votes from anon;

-- Stimme fuer eine Fehlermeldung an-/abschalten
create or replace function public.gv_toggle_bug_vote(p_report_id text, p_device_id text)
returns integer
language plpgsql security definer set search_path = public
as $$
declare v_count integer;
begin
    if coalesce(trim(p_device_id), '') = '' then
        raise exception 'device_required';
    end if;

    if exists (select 1 from bug_report_votes
               where report_id::text = p_report_id and device_id = p_device_id) then
        delete from bug_report_votes
         where report_id::text = p_report_id and device_id = p_device_id;
    else
        insert into bug_report_votes (report_id, device_id)
        select b.id, p_device_id from bug_reports b where b.id::text = p_report_id;
    end if;

    select count(*) into v_count from bug_report_votes where report_id::text = p_report_id;
    update bug_reports set votes = v_count where id::text = p_report_id;
    return v_count;
end $$;

-- Welche Fehlermeldungen hat dieses Geraet unterstuetzt?
create or replace function public.gv_my_bug_votes(p_device_id text)
returns setof text
language sql security definer set search_path = public stable
as $$
    select report_id::text from bug_report_votes where device_id = p_device_id;
$$;

grant execute on function public.gv_toggle_bug_vote(text, text) to anon, authenticated;
grant execute on function public.gv_my_bug_votes(text)          to anon, authenticated;


-- =============================================================
-- 2) COMMUNITY (app_posts / app_post_replies / app_post_votes)
-- =============================================================

-- Gefaehrliche Regeln entfernen: jeder durfte Likes einfuegen UND loeschen
drop policy if exists "votes_anon_insert" on public.app_post_votes;
drop policy if exists "votes_anon_delete" on public.app_post_votes;
drop policy if exists "votes_public_read" on public.app_post_votes;
drop policy if exists "votes_admin_all"   on public.app_post_votes;
create policy "votes_admin_all" on public.app_post_votes for all to authenticated
    using (true) with check (true);
revoke select on public.app_post_votes from anon;

-- Geraete-Kennungen verbergen
select pg_temp.hide_columns('app_posts',        array['device_id']);
select pg_temp.hide_columns('app_post_replies', array['device_id']);

-- Like an-/abschalten (sicher, nur fuer freigegebene Beitraege)
drop function if exists public.gv_toggle_vote(uuid, text);
create or replace function public.gv_toggle_vote(p_post_id uuid, p_device_id text)
returns integer
language plpgsql security definer set search_path = public
as $$
declare v_count integer;
begin
    if coalesce(trim(p_device_id), '') = '' then
        raise exception 'device_required';
    end if;
    if not exists (select 1 from app_posts where id = p_post_id and status = 'published') then
        raise exception 'post_not_available';
    end if;
    if exists (select 1 from blocked_devices where device_id = p_device_id) then
        raise exception 'device_blocked';
    end if;

    if exists (select 1 from app_post_votes where post_id = p_post_id and device_id = p_device_id) then
        delete from app_post_votes where post_id = p_post_id and device_id = p_device_id;
    else
        insert into app_post_votes (post_id, device_id) values (p_post_id, p_device_id)
        on conflict do nothing;
    end if;

    select count(*) into v_count from app_post_votes where post_id = p_post_id;
    update app_posts set votes = v_count where id = p_post_id;
    return v_count;
end $$;

-- Welche Beitraege hat dieses Geraet geliked?
create or replace function public.gv_my_post_votes(p_device_id text)
returns setof uuid
language sql security definer set search_path = public stable
as $$
    select post_id from app_post_votes where device_id = p_device_id;
$$;

grant execute on function public.gv_toggle_vote(uuid, text) to anon, authenticated;
grant execute on function public.gv_my_post_votes(text)     to anon, authenticated;


-- =============================================================
-- 3) APP-BEWERTUNG automatisch berechnen
-- Statt "+1" vom Browser: immer frisch aus den freigegebenen
-- Bewertungen gerechnet. Kann nicht doppelt zaehlen.
-- =============================================================
create or replace function public.gv_recalc_app_rating()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare v_app uuid;
begin
    v_app := coalesce(new.app_id, old.app_id);
    update apps a set
        rating_sum   = coalesce((select sum(p.rating) from app_posts p
                                  where p.app_id = v_app and p.status = 'published'
                                    and p.type = 'review' and p.rating is not null), 0),
        rating_count = coalesce((select count(*) from app_posts p
                                  where p.app_id = v_app and p.status = 'published'
                                    and p.type = 'review' and p.rating is not null), 0)
    where a.id = v_app;
    return null;
end $$;

drop trigger if exists trg_gv_recalc_app_rating on public.app_posts;
create trigger trg_gv_recalc_app_rating
    after insert or update of status, rating, type or delete on public.app_posts
    for each row execute function public.gv_recalc_app_rating();

-- Einmal fuer alle Apps neu berechnen
update public.apps a set
    rating_sum   = coalesce((select sum(p.rating) from public.app_posts p
                              where p.app_id = a.id and p.status = 'published'
                                and p.type = 'review' and p.rating is not null), 0),
    rating_count = coalesce((select count(*) from public.app_posts p
                              where p.app_id = a.id and p.status = 'published'
                                and p.type = 'review' and p.rating is not null), 0);

-- Like-Zaehler einmal mit der Wirklichkeit abgleichen
update public.app_posts p
   set votes = (select count(*) from public.app_post_votes v where v.post_id = p.id);


-- =============================================================
-- 4) Kontrolle
-- =============================================================
-- Erwartet: KEINE Zeile (Besucher duerfen diese Spalten nicht lesen)
select table_name, column_name
from information_schema.column_privileges
where grantee = 'anon' and privilege_type = 'SELECT'
  and table_schema = 'public'
  and (
        (table_name = 'bug_reports'      and column_name in ('contact_info', 'reporter_device_id'))
     or (table_name = 'app_posts'        and column_name = 'device_id')
     or (table_name = 'app_post_replies' and column_name = 'device_id')
  );
