-- =============================================================
-- 015: Bestehende Ideen bekommen Tier-Avatare
-- Jede Idee erhält ein anderes Tier (keine Doppelten bei bis zu 25 Ideen).
-- Projekte mit fertiger App (live_url) behalten ihr App-Bild.
-- =============================================================
with nummeriert as (
    select id, row_number() over (order by created_at) as rn
    from public.projects
    where live_url is null
      and (avatar_seed is null or avatar_seed not like 'tiere:%')
)
update public.projects p
set avatar_seed = 'tiere:#' || (
    -- schöne Reihenfolge: Fuchs, Koala, Eule, Hase, Tiger, Schaf, Reh, Katze, Frosch, Faultier, dann der Rest
    (array[0,18,39,15,27,60,51,3,45,69,6,9,12,21,24,30,33,36,42,48,54,57,63,66,72])[((n.rn - 1) % 25) + 1]
    + ((n.rn - 1) / 25)::int % 3
)
from nummeriert n
where p.id = n.id;

-- Kontrolle
select title, avatar_seed from public.projects order by created_at;
