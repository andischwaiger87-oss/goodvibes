-- =============================================================
--  GoodVibes – Einsatzbeispiele (Mockups) fuer Apps
--  Migration 010
-- =============================================================
--  Neue Spalte fuer anschauliche Beispiele: Bild + Titel + Text.
--  Pflege im Admin unter "Apps -> Bearbeiten -> Einsatzbeispiele".
--  Gefahrlos mehrfach ausfuehrbar.
-- =============================================================

alter table public.apps
    add column if not exists use_cases jsonb not null default '[]'::jsonb;

-- Kontrolle: Spalte vorhanden?
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'apps' and column_name = 'use_cases';
