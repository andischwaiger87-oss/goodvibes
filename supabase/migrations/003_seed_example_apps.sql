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
        'MeinPlan hilft dir, deinen Alltag klar zu strukturieren. Du legst fuer jeden Wochentag einen eigenen Ablauf an, siehst deinen Plan in Tages-, Wochen- und Monatsansicht und hakst erledigte Schritte einfach ab. Ein ruhiger Modus mit weniger Animationen und eine Einfuehrung zum Anhoeren machen die Bedienung angenehm – besonders fuer Menschen, die von klarer Struktur profitieren, etwa im Autismus-Spektrum.',
        'community',
        '🗓️',
        'blue',
        '0.6.0',
        true,
        'live',
        'https://tagesplaner-aut.pages.dev/',
        'Kostenlos • Laeuft im Browser (Handy & Computer) • BETA • Ohne Werbung',
        E'Eigener Ablauf fuer jeden Wochentag (Werktag & Wochenende getrennt)\nKalender in Tages-, Wochen- und Monatsansicht\nSchritte abhaken und Tagesfortschritt auf einen Blick\n"Jetzt"-Ansicht zeigt die aktuelle Aufgabe\nRuhiger Modus mit weniger Animationen (reizarm)\nKurze Einfuehrung zum Anhoeren\nFuer Vorlese-Programme (Screenreader) optimiert',
        'Neu: Tagesfortschritt zum Abhaken (x von y erledigt) mit automatischem Reset um Mitternacht – plus ein ruhiger Modus mit weniger Animationen fuer mehr Reizarmut.',
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
