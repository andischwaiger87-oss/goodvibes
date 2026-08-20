-- =============================================================
--  GoodVibes – Kaputte App-Kuerzel (Slugs) bereinigen
--  Migration 004
-- =============================================================
--  Hintergrund: Wurde versehentlich eine ganze Web-Adresse ins
--  Feld "Kuerzel (URL)" kopiert, entstand ein unbrauchbarer Slug
--  wie  https---tagesplaner-aut-pages-dev-
--  Das erzeugt eine tote Route /apps/<muell> und eine Doppelung.
--
--  Diese Migration ist gefahrlos mehrfach ausfuehrbar.
-- =============================================================

-- 1) Anschauen, was betroffen ist (nur Anzeige, aendert nichts):
--    Slugs, die wie eine Web-Adresse aussehen.
select id, name, slug, live_url
from public.apps
where slug ~* '^https?-|-pages-dev|--';

-- 2) Doppelte Eintraege entfernen: kaputte Zeile loeschen, WENN es
--    bereits eine saubere App mit gleichem Namen gibt.
delete from public.apps a
where a.slug ~* '^https?-|-pages-dev'
  and exists (
      select 1 from public.apps b
      where b.name = a.name
        and b.id <> a.id
        and b.slug !~* '^https?-|-pages-dev'
  );

-- 3) Uebrig gebliebene kaputte Slugs aus dem Namen neu bilden
--    (Umlaute ersetzen, Kleinbuchstaben, nur a-z 0-9 und Bindestrich).
update public.apps
set slug = trim(both '-' from
        regexp_replace(
            regexp_replace(
                lower(translate(name, 'äöüÄÖÜß', 'aouAOUs')),
                '[^a-z0-9]+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    )
where slug ~* '^https?-|-pages-dev';

-- 4) Kontrolle: sollte jetzt leer sein.
select id, name, slug from public.apps where slug ~* '^https?-|-pages-dev';
