-- Names the module threads assumed while the core was still being written.
-- Thin aliases over the real objects, so modules can be dropped in unchanged.
-- New code should use the real names (memberships, is_member, member_role).

-- workspace_members is a read-only view of memberships that still obeys RLS.
create or replace view workspace_members with (security_invoker = true) as
  select workspace_id, user_id, role::text as role, permissions, created_at from memberships;

create or replace function is_workspace_member(ws uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_member(ws);
$$;

create or replace function workspace_role(ws uuid) returns text
language sql stable security definer set search_path = public as $$
  select member_role(ws)::text;
$$;
