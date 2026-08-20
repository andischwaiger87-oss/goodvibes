-- =============================================================
--  GoodVibes – Sprechende Adressen fuer Projekte
--  Migration 006
-- =============================================================
--  Bisher sah eine Projekt-Adresse so aus:
--    /projects/11111111-1111-1111-1111-111111111111
--  Kuenftig so:
--    /projects/meinplan
--
--  Alte Adressen funktionieren weiterhin (die Seite erkennt beides).
--
--  Einfach komplett markieren, in den Supabase SQL-Editor einfuegen
--  und auf "Run" klicken. Gefahrlos mehrfach ausfuehrbar.
-- =============================================================


-- ---------- 1) Spalte anlegen ----------
alter table public.projects add column if not exists slug text;


-- ---------- 2) Slug aus dem Titel bilden ----------
-- Umlaute ersetzen, Kleinbuchstaben, nur a-z 0-9 und Bindestrich,
-- auf 60 Zeichen kuerzen. Nur fuer Zeilen ohne Slug.
update public.projects
set slug = left(
        trim(both '-' from
            regexp_replace(
                regexp_replace(
                    lower(translate(title, 'äöüÄÖÜß', 'aouAOUs')),
                    '[^a-z0-9]+', '-', 'g'
                ),
                '-+', '-', 'g'
            )
        ), 60)
where slug is null or slug = '';


-- ---------- 3) Doppelte Slugs eindeutig machen ----------
-- Falls zwei Projekte gleich heissen, bekommt das zweite eine -2 usw.
with nummeriert as (
    select
        id,
        slug,
        row_number() over (partition by slug order by created_at, id) as rn
    from public.projects
)
update public.projects p
set slug = n.slug || '-' || n.rn
from nummeriert n
where p.id = n.id
  and n.rn > 1;


-- ---------- 4) Eindeutigkeit absichern ----------
create unique index if not exists projects_slug_unique on public.projects (slug);


-- ---------- 5) Kontrolle ----------
select title, slug, status from public.projects order by created_at;
