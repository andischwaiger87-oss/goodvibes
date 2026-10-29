-- =============================================================
-- 013: Zielmarke für die Abstimmung
-- Ab dieser Stimmenzahl kommt eine Idee auf die Umsetzungsliste.
-- Startwert 100 – im Admin-Bereich jederzeit änderbar.
-- =============================================================
insert into public.app_settings (key, value)
select 'vote_goal', '100'
where not exists (select 1 from public.app_settings where key = 'vote_goal');
