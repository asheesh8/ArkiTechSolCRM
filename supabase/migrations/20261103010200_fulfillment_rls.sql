-- Fulfillment module: row level security.
-- Rule of thumb: a client sees rows in their own workspace, the Arkitech team
-- sees everything, nobody writes a row whose workspace they do not belong to.
-- Internal comments and the outbox are team-only.

alter table public.request_types        enable row level security;
alter table public.requests             enable row level security;
alter table public.request_counters     enable row level security;
alter table public.request_comments     enable row level security;
alter table public.request_attachments  enable row level security;
alter table public.request_deliverables enable row level security;
alter table public.request_events       enable row level security;
alter table public.notification_outbox  enable row level security;

-- request_types: global rows readable by every signed-in user; workspace
-- overrides readable by members. Only staff manage the catalog.
drop policy if exists request_types_select on public.request_types;
create policy request_types_select on public.request_types
  for select to authenticated
  using (
    is_active and (workspace_id is null or public.is_workspace_member(workspace_id))
    or public.is_staff()
  );
drop policy if exists request_types_staff_write on public.request_types;
create policy request_types_staff_write on public.request_types
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- requests
drop policy if exists requests_select on public.requests;
create policy requests_select on public.requests
  for select to authenticated
  using (public.is_staff() or public.is_workspace_member(workspace_id));

drop policy if exists requests_client_insert on public.requests;
create policy requests_client_insert on public.requests
  for insert to authenticated
  with check (
    public.is_workspace_member(workspace_id)
    and requested_by = auth.uid()
    and status in ('draft', 'submitted')
    and assigned_to is null
  );

-- Clients may edit their own drafts, submit them, cancel, and answer
-- "awaiting_client" (handled through comments/attachments, not this row).
drop policy if exists requests_client_update on public.requests;
create policy requests_client_update on public.requests
  for update to authenticated
  using (public.is_workspace_member(workspace_id) and not public.is_staff())
  with check (
    public.is_workspace_member(workspace_id)
    and status in ('draft', 'submitted', 'cancelled')
    and assigned_to is null
  );

drop policy if exists requests_staff_write on public.requests;
create policy requests_staff_write on public.requests
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- counters: touched only through next_request_number() (security definer)
drop policy if exists request_counters_staff on public.request_counters;
create policy request_counters_staff on public.request_counters
  for select to authenticated using (public.is_staff());

-- comments
drop policy if exists request_comments_select on public.request_comments;
create policy request_comments_select on public.request_comments
  for select to authenticated
  using (
    public.is_staff()
    or (public.is_workspace_member(workspace_id) and not internal)
  );
drop policy if exists request_comments_insert on public.request_comments;
create policy request_comments_insert on public.request_comments
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and (
      (public.is_staff() and author_kind = 'team')
      or (public.is_workspace_member(workspace_id) and author_kind = 'client' and not internal)
    )
  );
drop policy if exists request_comments_delete_own on public.request_comments;
create policy request_comments_delete_own on public.request_comments
  for delete to authenticated
  using (author_id = auth.uid() and created_at > now() - interval '15 minutes');

-- attachments
drop policy if exists request_attachments_select on public.request_attachments;
create policy request_attachments_select on public.request_attachments
  for select to authenticated
  using (public.is_staff() or public.is_workspace_member(workspace_id));
drop policy if exists request_attachments_insert on public.request_attachments;
create policy request_attachments_insert on public.request_attachments
  for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and (public.is_staff() or public.is_workspace_member(workspace_id))
    -- storage path must start with this workspace and request
    and storage_path like workspace_id::text || '/' || request_id::text || '/%'
  );
drop policy if exists request_attachments_delete on public.request_attachments;
create policy request_attachments_delete on public.request_attachments
  for delete to authenticated
  using (public.is_staff() or uploaded_by = auth.uid());

-- deliverables: team posts, client decides
drop policy if exists request_deliverables_select on public.request_deliverables;
create policy request_deliverables_select on public.request_deliverables
  for select to authenticated
  using (public.is_staff() or public.is_workspace_member(workspace_id));
drop policy if exists request_deliverables_staff_write on public.request_deliverables;
create policy request_deliverables_staff_write on public.request_deliverables
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists request_deliverables_client_decide on public.request_deliverables;
create policy request_deliverables_client_decide on public.request_deliverables
  for update to authenticated
  using (public.is_workspace_member(workspace_id) and public.workspace_role(workspace_id) in ('owner', 'admin'))
  with check (
    public.is_workspace_member(workspace_id)
    and status in ('approved', 'changes_requested')
    and decided_by = auth.uid()
  );

-- events: readable by members, written only by triggers (security definer)
drop policy if exists request_events_select on public.request_events;
create policy request_events_select on public.request_events
  for select to authenticated
  using (public.is_staff() or public.is_workspace_member(workspace_id));

-- outbox: service role and staff only; the worker uses the service key
drop policy if exists notification_outbox_staff on public.notification_outbox;
create policy notification_outbox_staff on public.notification_outbox
  for select to authenticated using (public.is_staff());

-- Column-level hardening: clients cannot change columns the team owns.
revoke update on public.requests from authenticated;
grant update (title, description, fields, status, priority, idempotency_key, updated_at)
  on public.requests to authenticated;
-- Staff go through the service role or an RPC for assignment/due dates:
grant update (assigned_to, due_at) on public.requests to authenticated;

revoke update on public.request_deliverables from authenticated;
grant update (status, decided_by, decision_note, title, summary, url, updated_at)
  on public.request_deliverables to authenticated;
