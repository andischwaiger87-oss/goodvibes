-- =============================================================
--  GoodVibes – MeinPlan: Testphase abgeschlossen
--  Migration 005
-- =============================================================
--  Die BETA-Testphase ist beendet. MeinPlan bleibt dauerhaft und
--  kostenlos nutzbar, Feedback ist weiterhin willkommen.
--
--  Einfach komplett markieren, in den Supabase SQL-Editor einfuegen
--  und auf "Run" klicken. Gefahrlos mehrfach ausfuehrbar.
--  Die gespeicherten Stimmen (votes) werden NICHT veraendert.
-- =============================================================


-- ---------- 1) Fehlende Spalten anlegen ----------
-- Die Showcase-Seite zeigt zu einem fertigen Projekt einen
-- "App oeffnen"-Button und eine Funktionsliste. Dafuer braucht die
-- Tabelle "projects" zwei Spalten, die es bisher nicht gab.
alter table public.projects add column if not exists live_url text;
alter table public.projects add column if not exists features  text;


-- ---------- 2) App-Eintrag aktualisieren (BETA beenden) ----------
update public.apps
set
    is_beta   = false,
    version   = '1.0.0',
    scope     = 'Kostenlos • Laeuft im Browser (Handy & Computer) • Ohne Anmeldung • Ohne Werbung',
    whats_new = 'Die Testphase ist abgeschlossen. MeinPlan ist ab sofort frei nutzbar – dauerhaft kostenlos, ohne Anmeldung und ohne Werbung. Dein Feedback ist weiterhin willkommen und fliesst in kuenftige Verbesserungen ein.'
where slug = 'meinplan';


-- ---------- 3) Projekt fuer den Showcase vorbereiten ----------
-- Stimmen und Status bleiben unberuehrt.
update public.projects
set
    live_url = 'https://tagesplaner-aut.pages.dev/',
    features = E'Eigener Ablauf fuer jeden Wochentag\nErinnerungen mit Bild, Text und Stimme\nSchritte abhaken und Tagesfortschritt sehen\nRuhiger Modus mit weniger Animationen\nFuer Vorlese-Programme (Screenreader) optimiert'
where title = 'MeinPlan';


-- ---------- 4) Timeline-Eintrag zum Abschluss ----------
-- Wird nur angelegt, wenn er noch nicht existiert.
insert into public.project_updates (project_id, progress_percent, update_title, update_text, created_at)
select
    p.id,
    100,
    'Testphase abgeschlossen – MeinPlan bleibt frei nutzbar',
    'Die Test-Phase ist vorbei. MeinPlan laeuft, ist dauerhaft kostenlos erreichbar und kann von allen frei genutzt werden. Die Entwicklung ist vorerst abgeschlossen. Feedback bleibt jederzeit willkommen – wenn genug zusammenkommt, planen wir Verbesserungen und eine Version fuer den Play Store ein. Danke an alle, die mitgetestet und mitgedacht haben!',
    now()
from public.projects p
where p.title = 'MeinPlan'
  and not exists (
      select 1 from public.project_updates u
      where u.project_id = p.id
        and u.update_title = 'Testphase abgeschlossen – MeinPlan bleibt frei nutzbar'
  );


-- ---------- 5) Kontrolle ----------
-- Erwartet: is_beta = false, version = 1.0.0
select slug, name, version, is_beta from public.apps where slug = 'meinplan';

-- Erwartet: votes unveraendert (139), live_url gesetzt
select title, status, votes, live_url from public.projects where title = 'MeinPlan';
