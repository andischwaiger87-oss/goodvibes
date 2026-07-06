-- =============================================================
--  GoodVibes – Startdaten / Aktualisierung fuer den App-Store
--  Migration 003
-- =============================================================
--  Legt die App "MeinPlan" im Katalog an bzw. aktualisiert sie mit
--  den echten Infos aus dem MeinPlan-Projekt. Alternativ kannst du
--  alles im Admin-Dashboard unter "Apps -> Neue App" pflegen.
--
--  Gefahrlos mehrfach ausfuehrbar: bei vorhandenem slug werden die
--  Inhalte AKTUALISIERT (upsert).
-- =============================================================

insert into public.apps
    (slug, name, tagline, description, category, icon_emoji, accent, version, is_beta, status, live_url, scope, features, whats_new, sort_order)
values
    (
        'meinplan',
        'MeinPlan',
        'Dein Tag – klar strukturiert und zum Abhaken.',
        'MeinPlan hilft dir, deinen Alltag klar zu strukturieren. Du legst fuer jeden Wochentag einen eigenen Ablauf an, siehst deinen Plan in Tages-, Wochen- und Monatsansicht und hakst erledigte Schritte einfach ab. Erinnerungen melden sich zuverlaessig mit Bild, Text und Stimme. Ein ruhiger Modus mit weniger Animationen und eine einfache Einrichtung beim ersten Start machen die Bedienung angenehm – besonders fuer Menschen, die von klarer Struktur profitieren, etwa im Autismus-Spektrum.',
        'community',
        '🗓️',
        'blue',
        '0.7.0',
        true,
        'live',
        'https://tagesplaner-aut.pages.dev/',
        'Kostenlos • Laeuft im Browser (Handy & Computer) • BETA • Ohne Werbung',
        E'Eigener Ablauf fuer jeden Wochentag (Werktag & Wochenende getrennt)\nErinnerungen melden sich mit Bild, Text und Stimme\nKalender in Tages-, Wochen- und Monatsansicht\nEintraege per Fingertipp verschieben – Uhrzeiten passen sich an\nSchritte abhaken und Tagesfortschritt auf einen Blick\n"Jetzt"-Ansicht zeigt die aktuelle Aufgabe\nRuhiger Modus mit weniger Animationen (reizarm)\nEinfache Einrichtung beim ersten Start\nFuer Vorlese-Programme (Screenreader) optimiert',
        'Jetzt bereit zum Testen! Neu: ueberarbeitete Erinnerungen (melden sich mit Bild, Text und Stimme), Eintraege per Fingertipp verschieben und eine einfache Einrichtung beim ersten Start.',
        1
    )
on conflict (slug) do update set
    name        = excluded.name,
    tagline     = excluded.tagline,
    description = excluded.description,
    category    = excluded.category,
    icon_emoji  = excluded.icon_emoji,
    accent      = excluded.accent,
    version     = excluded.version,
    is_beta     = excluded.is_beta,
    status      = excluded.status,
    live_url    = excluded.live_url,
    scope       = excluded.scope,
    features    = excluded.features,
    whats_new   = excluded.whats_new,
    sort_order  = excluded.sort_order;
