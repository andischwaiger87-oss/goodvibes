-- =============================================================
--  GoodVibes – OPTIONALE Startdaten für den App-Store
--  Migration 003 (optional)
-- =============================================================
--  Fuellt den frisch angelegten App-Katalog mit einer ersten App,
--  damit die Seite /apps nicht leer startet. Alternativ kannst du
--  Apps einfach im Admin-Dashboard unter "Apps -> Neue App" anlegen.
--
--  Gefahrlos mehrfach ausfuehrbar (on conflict do nothing ueber slug).
-- =============================================================

insert into public.apps
    (slug, name, tagline, description, category, icon_emoji, accent, version, is_beta, status, live_url, scope, features, whats_new, sort_order)
values
    (
        'meinplan',
        'MeinPlan',
        'Dein Tag – klar und einfach strukturiert.',
        'MeinPlan hilft dir, deinen Tagesablauf uebersichtlich zu planen. Mit grossen, klaren Symbolen und einfacher Sprache behaeltst du den Ueberblick – ganz ohne kompliziertes Menue. Besonders gedacht fuer Menschen, die eine klare Struktur im Alltag schaetzen.',
        'community',
        '🗓️',
        'blue',
        '0.9.0',
        true,
        'live',
        'https://goodvibes-akz.pages.dev/',
        'Kostenlos • Ohne Anmeldung • Ohne Werbung • Funktioniert am Handy und am Computer',
        E'Tagesplan mit grossen, klaren Symbolen\nErinnerungen fuer wichtige Aufgaben\nEinfache Sprache, auch fuer Einsteiger\nBarrierefrei bedienbar (grosse Schrift, gute Kontraste)\nFunktioniert auch offline',
        'Erste oeffentliche BETA: Wir testen jetzt gemeinsam mit euch im echten Alltag und verbessern die App anhand eures Feedbacks.',
        1
    )
on conflict (slug) do nothing;
