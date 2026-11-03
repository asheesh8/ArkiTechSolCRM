-- Names the module threads assumed while the core was still being written.
-- Thin aliases over the real objects, so modules can be dropped in unchanged.
-- New code should use the real names (memberships, is_member, member_role).

-- workspace_members is a read-only view of memberships that still obeys RLS.
create or replace view workspace_members with (security_invoker = true) as
  select workspace_id, user_id, role, permissions, created_at from memberships;

create or replace function is_workspace_member(ws uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_member(ws);
$$;

create or replace function workspace_role(ws uuid) returns text
language sql stable security definer set search_path = public as $$
  select member_role(ws)::text;
$$;

-- profiles.is_staff, kept in step with the staff table.
alter table profiles add column if not exists is_staff boolean not null default false;
update profiles p set is_staff = exists (select 1 from staff s where s.user_id = p.user_id);

create or replace function sync_profile_staff() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    update profiles set is_staff = false where user_id = old.user_id;
    return old;
  end if;
  update profiles set is_staff = true where user_id = new.user_id;
  return new;
end $$;
drop trigger if exists staff_sync_profile on staff;
create trigger staff_sync_profile after insert or delete on staff for each row execute function sync_profile_staff();
