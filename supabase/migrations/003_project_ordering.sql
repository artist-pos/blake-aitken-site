-- Drag-to-reorder support for the landing page index.

-- Every project sat at sort_order 0, so the landing grid's order was whatever
-- Postgres happened to return. Seed a total order — grouped by discipline, then
-- oldest-first inside each — so reordering has something stable to rewrite.
with ordered as (
  select id,
         row_number() over (
           order by case category
                      when 'art'          then 0
                      when 'architecture' then 1
                      when 'concept'      then 2
                      when 'venture'      then 3
                      when 'university'   then 4
                      else 5
                    end,
                    created_at,
                    id
         ) as rn
  from public.projects
)
update public.projects p
   set sort_order = ordered.rn
  from ordered
 where p.id = ordered.id
   and p.sort_order is distinct from ordered.rn;

-- Rewrites the whole ordering in one statement. Callers pass the complete list
-- of project ids in their new order; position in the array becomes sort_order.
-- SECURITY INVOKER on purpose: the admin RLS policy on projects is what gates
-- this, so a non-admin caller silently updates nothing.
create or replace function public.reorder_projects(ids uuid[])
returns void
language sql
security invoker
set search_path = public, pg_temp
as $$
  update public.projects p
     set sort_order = o.ord
    from unnest(ids) with ordinality as o(id, ord)
   where p.id = o.id
     and p.sort_order is distinct from o.ord;
$$;

revoke execute on function public.reorder_projects(uuid[]) from public;
revoke execute on function public.reorder_projects(uuid[]) from anon;
grant  execute on function public.reorder_projects(uuid[]) to authenticated;
