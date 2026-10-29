-- =============================================================
--  GoodVibes – Admin-Rechte nur fuer freigegebene Konten
--  Migration 011
-- =============================================================
--  Bisher: Jedes eingeloggte Konto war automatisch Admin.
--  Neu:    Admin ist nur, wer in der Tabelle admin_users steht.
--
--  Das Skript traegt automatisch dein Konto ein – vorausgesetzt,
--  es gibt genau EIN Konto (das ist bei dir der Fall, wenn die
--  Registrierung aus war). Gefahrlos mehrfach ausfuehrbar.
-- =============================================================


-- ---------- 1) Admin-Liste ----------
create table if not exists public.admin_users (
    user_id    uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
-- Keine Regeln: von aussen weder lesbar noch aenderbar.


-- ---------- 2) Pruef-Funktion: Bin ich Admin? ----------
create or replace function public.is_admin()
returns boolean
language sql security definer set search_path = public stable
as $$
    select exists (select 1 from admin_users where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;


-- ---------- 3) Dein Konto eintragen ----------
-- Nur wenn es genau ein Konto gibt – sonst passiert nichts
-- (dann bitte mir die Kontrolle unten schicken).
insert into public.admin_users (user_id)
select id from auth.users
where (select count(*) from auth.users) = 1
on conflict do nothing;


-- ---------- 4) Alle Admin-Regeln umstellen ----------
-- Jede Regel, die bisher "eingeloggt = darf" bedeutete,
-- prueft jetzt "steht auf der Admin-Liste".
do $$
declare
    r record;
    v_sql text;
begin
    -- Sicherheitsnetz: nur umstellen, wenn ein Admin eingetragen ist.
    -- Sonst wuerdest du dich selbst aussperren.
    if not exists (select 1 from public.admin_users) then
        raise exception 'Kein Admin eingetragen – Umstellung abgebrochen. Bitte Kontrolle unten an Claude schicken.';
    end if;

    for r in
        select tablename, policyname, cmd
        from pg_policies
        where schemaname = 'public'
          and (
                'authenticated' = any(roles)
             or coalesce(qual, '')       like '%authenticated%'
             or coalesce(with_check, '') like '%authenticated%'
          )
    loop
        v_sql := format('alter policy %I on public.%I to authenticated', r.policyname, r.tablename);
        if r.cmd in ('SELECT', 'DELETE') then
            v_sql := v_sql || ' using (public.is_admin())';
        elsif r.cmd = 'INSERT' then
            v_sql := v_sql || ' with check (public.is_admin())';
        else -- UPDATE, ALL
            v_sql := v_sql || ' using (public.is_admin()) with check (public.is_admin())';
        end if;
        execute v_sql;
    end loop;
end $$;


-- ---------- 5) Kontrolle ----------
-- Erwartet: genau EINE Zeile mit deiner Login-E-Mail.
select u.email as admin_konto
from public.admin_users a
join auth.users u on u.id = a.user_id;
