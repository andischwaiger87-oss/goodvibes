-- =============================================================
-- 014: "Hinweis von Andi" – transparente Einordnung einer Idee
-- Optionaler Text, der auf der Karte und im Detail-Fenster
-- als Info-Box erscheint. Nur Admins dürfen ihn ändern
-- (bestehende Update-Policy auf projects gilt).
-- =============================================================
alter table public.projects add column if not exists admin_note text;

-- Hinweis für die Schlaganfall-Idee
update public.projects
set admin_note = 'Eine wichtige Idee, danke dafür! Ehrlicher Stand: Dialekte und die Sprache von Menschen nach einem Schlaganfall zuverlässig zu erkennen, schafft die Technik heute noch nicht seriös. Umsetzbar ist eine erste Version mit Schnellauswahl häufiger Sätze, großer Schrift und Vorlesen. Die Dialekt-Erkennung kommt dazu, sobald sie verlässlich funktioniert – KI entwickelt sich gerade sehr schnell. Alle Stimmen bleiben erhalten.'
where title ilike '%Schlaganfall%';

-- Kontrolle: sollte genau 1 Zeile zeigen
select id, title, left(admin_note, 40) as hinweis from public.projects where admin_note is not null;
