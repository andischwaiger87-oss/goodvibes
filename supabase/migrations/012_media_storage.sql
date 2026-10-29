-- =============================================================
--  GoodVibes – Speicherort fuer Bilder (Supabase Storage)
--  Migration 012
-- =============================================================
--  Bilder (Screenshots, Mockups) liegen kuenftig als echte Dateien
--  im Speicher "app-media" statt als langer Text in der Datenbank.
--  Vorteile: Seiten laden schneller, Browser koennen Bilder cachen,
--  Bilder haben eine eigene Adresse.
--
--  Lesen: alle. Hochladen/Aendern/Loeschen: nur Admin.
--  Gefahrlos mehrfach ausfuehrbar.
-- =============================================================

-- ---------- 1) Speicher anlegen (oeffentlich lesbar, max. 5 MB, nur Bilder) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('app-media', 'app-media', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
    set public = true,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

-- ---------- 2) Zugriffsregeln ----------
drop policy if exists "app_media_public_read"  on storage.objects;
drop policy if exists "app_media_admin_insert" on storage.objects;
drop policy if exists "app_media_admin_update" on storage.objects;
drop policy if exists "app_media_admin_delete" on storage.objects;

create policy "app_media_public_read" on storage.objects
    for select using (bucket_id = 'app-media');

create policy "app_media_admin_insert" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'app-media' and public.is_admin());

create policy "app_media_admin_update" on storage.objects
    for update to authenticated
    using (bucket_id = 'app-media' and public.is_admin())
    with check (bucket_id = 'app-media' and public.is_admin());

create policy "app_media_admin_delete" on storage.objects
    for delete to authenticated
    using (bucket_id = 'app-media' and public.is_admin());

-- ---------- 3) Kontrolle ----------
-- Erwartet: eine Zeile app-media | true
select id, public from storage.buckets where id = 'app-media';
