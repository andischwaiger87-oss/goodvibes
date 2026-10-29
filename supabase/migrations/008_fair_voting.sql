-- =============================================================
--  GoodVibes – Faire Abstimmung (Schutz vor Mehrfach-Stimmen)
--  Migration 008
-- =============================================================
--  Problem bisher: increment_vote zaehlte einfach +1 – ohne jede
--  Pruefung. Ein Inkognito-Tab oder ein Skript reichte fuer
--  beliebig viele Stimmen.
--
--  Neu:
--   • Jede Stimme wird mit einem ANONYMEN Fingerabdruck gespeichert
--     (IP-Adresse + Geraet, gehasht mit geheimem Schluessel).
--     Aus dem Hash laesst sich keine IP zurueckrechnen.
--   • Pro Geraet: 1 Stimme pro Idee.
--   • Pro Internet-Anschluss (IP): hoechstens 3 Stimmen pro Idee.
--     So koennen Familien/WGs mitstimmen, aber Inkognito-Tabs
--     bringen nach der 3. Stimme nichts mehr.
--   • Abstimmen nur bei Ideen, die gerade zur Wahl stehen (active).
--   • Die Funktion meldet zurueck, ob die Stimme gezaehlt wurde.
--
--  Bisherige Stimmen bleiben unveraendert.
--  Komplett markieren, im SQL-Editor einfuegen, "Run".
--  Gefahrlos mehrfach ausfuehrbar.
-- =============================================================


-- ---------- 1) Geheimer Schluessel fuer die Hashes ----------
-- Wird einmalig zufaellig erzeugt. Niemand ausser der Datenbank kennt ihn.
create table if not exists public.vote_secret (
    id     int primary key default 1 check (id = 1),
    secret text not null
);
insert into public.vote_secret (id, secret)
values (1, encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (id) do nothing;

alter table public.vote_secret enable row level security;
-- Bewusst KEINE Policy: von aussen weder lesbar noch aenderbar.


-- ---------- 2) Stimmen-Protokoll (anonym) ----------
create table if not exists public.vote_records (
    id          bigint generated always as identity primary key,
    project_id  uuid not null references public.projects(id) on delete cascade,
    ip_hash     text not null,
    device_hash text not null,
    created_at  timestamptz not null default now(),
    unique (project_id, device_hash)
);
create index if not exists vote_records_ip_idx on public.vote_records (project_id, ip_hash);

alter table public.vote_records enable row level security;
-- Bewusst KEINE Policy: nur die Funktion unten darf hineinschreiben.


-- ---------- 3) Alte, ungeschuetzte Funktion entfernen ----------
drop function if exists public.increment_vote(uuid);


-- ---------- 4) Neue, faire Abstimm-Funktion ----------
create or replace function public.increment_vote(project_id uuid, device_id text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_headers  json;
    v_ip       text;
    v_secret   text;
    v_ip_hash  text;
    v_dev_hash text;
    v_status   text;
    v_ip_count int;
begin
    -- Nur Ideen, die gerade zur Abstimmung stehen
    select p.status into v_status from projects p where p.id = increment_vote.project_id;
    if v_status is distinct from 'active' then
        return false;
    end if;

    -- Echte Besucher-IP aus den Anfrage-Headern (erster Eintrag)
    v_headers := nullif(current_setting('request.headers', true), '')::json;
    v_ip := trim(split_part(coalesce(
                v_headers ->> 'cf-connecting-ip',
                v_headers ->> 'x-real-ip',
                v_headers ->> 'x-forwarded-for',
                'unbekannt'), ',', 1));

    select secret into v_secret from vote_secret where id = 1;

    v_ip_hash  := encode(extensions.digest(v_secret || '|ip|'  || v_ip, 'sha256'), 'hex');
    v_dev_hash := encode(extensions.digest(
                     v_secret || '|dev|' || coalesce(nullif(trim(device_id), ''), 'ip:' || v_ip),
                     'sha256'), 'hex');

    -- Hoechstens 3 Stimmen pro Anschluss und Idee
    select count(*) into v_ip_count
    from vote_records r
    where r.project_id = increment_vote.project_id
      and r.ip_hash = v_ip_hash;
    if v_ip_count >= 3 then
        return false;
    end if;

    -- 1 Stimme pro Geraet und Idee (unique-Index verhindert Doppelte)
    begin
        insert into vote_records (project_id, ip_hash, device_hash)
        values (increment_vote.project_id, v_ip_hash, v_dev_hash);
    exception when unique_violation then
        return false;
    end;

    update projects set votes = coalesce(votes, 0) + 1
    where id = increment_vote.project_id;

    return true;
end;
$$;

grant execute on function public.increment_vote(uuid, text) to anon, authenticated;


-- ---------- 5) Kontrolle ----------
-- Erwartet: genau EINE Zeile mit (project_id uuid, device_id text)
select p.oid::regprocedure as funktion, p.prosecdef as security_definer
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'increment_vote';
