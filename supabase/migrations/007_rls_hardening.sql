-- =============================================================
--  GoodVibes – Sicherheitsluecke schliessen (Row Level Security)
--  Migration 007
-- =============================================================
--  Supabase-Warnung: "Table publicly accessible" (rls_disabled_in_public)
--  Betrifft: projects, app_settings, project_updates
--
--  Bisher konnte jeder mit dem oeffentlichen Schluessel diese Tabellen
--  lesen, AENDERN und LOESCHEN. Ab jetzt gilt:
--
--    Besucher (anonym)   lesen ✔   Idee einreichen ✔   abstimmen ✔
--                        aendern ✘ loeschen ✘
--    Admin (eingeloggt)  alles ✔
--
--  Einfach komplett markieren, im Supabase SQL-Editor einfuegen und
--  auf "Run" klicken. Gefahrlos mehrfach ausfuehrbar.
-- =============================================================


-- ---------- 1) RLS einschalten ----------
alter table public.projects        enable row level security;
alter table public.app_settings    enable row level security;
alter table public.project_updates enable row level security;


-- ---------- 2) projects ----------
-- Lesen: alles ausser noch ungepruefte Einreichungen ("pending").
drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read"
    on public.projects for select
    using (status <> 'pending');

-- Admin sieht auch die ungeprueften Einreichungen.
drop policy if exists "projects_admin_read" on public.projects;
create policy "projects_admin_read"
    on public.projects for select
    to authenticated
    using (true);

-- Einreichen: nur als "pending", ohne Stimmen, ohne App-Link.
-- So kann niemand sich selbst freischalten oder Stimmen faelschen.
drop policy if exists "projects_public_insert" on public.projects;
create policy "projects_public_insert"
    on public.projects for insert
    with check (
        status = 'pending'
        and coalesce(votes, 0) = 0
        and live_url is null
    );

-- Aendern & Loeschen: nur Admin.
drop policy if exists "projects_admin_update" on public.projects;
create policy "projects_admin_update"
    on public.projects for update
    to authenticated
    using (true) with check (true);

drop policy if exists "projects_admin_delete" on public.projects;
create policy "projects_admin_delete"
    on public.projects for delete
    to authenticated
    using (true);


-- ---------- 3) app_settings (Phase, aktives Projekt) ----------
drop policy if exists "settings_public_read" on public.app_settings;
create policy "settings_public_read"
    on public.app_settings for select
    using (true);

drop policy if exists "settings_admin_write" on public.app_settings;
create policy "settings_admin_write"
    on public.app_settings for all
    to authenticated
    using (true) with check (true);


-- ---------- 4) project_updates (Fortschritts-Timeline) ----------
drop policy if exists "updates_public_read" on public.project_updates;
create policy "updates_public_read"
    on public.project_updates for select
    using (true);

drop policy if exists "updates_admin_write" on public.project_updates;
create policy "updates_admin_write"
    on public.project_updates for all
    to authenticated
    using (true) with check (true);


-- ---------- 5) Abstimmen muss weiter funktionieren ----------
-- Besucher duerfen "projects" nicht mehr direkt aendern. Die Stimme
-- laeuft ueber die Funktion increment_vote. Damit sie trotz der neuen
-- Regeln zaehlen darf, laeuft sie mit den Rechten ihres Besitzers
-- (security definer) und festem Suchpfad (Schutz vor Manipulation).
-- Der Inhalt der Funktion (inkl. IP-Sperre) bleibt unveraendert.
do $$
declare f record;
begin
    for f in
        select p.oid::regprocedure as sig
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = 'increment_vote'
    loop
        execute format('alter function %s security definer', f.sig);
        execute format('alter function %s set search_path = public', f.sig);
        execute format('grant execute on function %s to anon, authenticated', f.sig);
    end loop;
end $$;


-- ---------- 6) Kontrolle ----------
-- Erwartet: rowsecurity = true bei allen drei Tabellen.
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('projects', 'app_settings', 'project_updates')
order by tablename;

-- Erwartet: increment_vote mit security_definer = true.
select p.proname as funktion, p.prosecdef as security_definer
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'increment_vote';
