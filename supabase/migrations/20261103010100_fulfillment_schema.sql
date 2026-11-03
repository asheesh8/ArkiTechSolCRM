-- Fulfillment module: tables.
-- Every row carries workspace_id. Child rows denormalise workspace_id so RLS
-- never needs a join, and a trigger keeps it equal to the parent request.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.request_status as enum (
    'draft',            -- client is still filling it in (autosave)
    'submitted',        -- waiting for Arkitech to triage
    'in_review',        -- Arkitech is scoping / asking questions
    'in_progress',      -- Arkitech is doing the work
    'awaiting_client',  -- blocked on the client (question, asset, or approval)
    'delivered',        -- deliverable posted, waiting for client approval
    'completed',        -- client approved (or auto-approved)
    'on_hold',          -- paused by either side
    'cancelled'         -- withdrawn
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.request_priority as enum ('low', 'normal', 'high', 'urgent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.request_actor as enum ('client', 'team', 'system');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.deliverable_status as enum ('pending', 'approved', 'changes_requested');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Request types (catalog). Global rows have workspace_id null; a workspace
-- can add its own types or override a global one by key.
-- ---------------------------------------------------------------------------
create table if not exists public.request_types (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  key text not null,
  name text not null,
  description text not null default '',
  icon text not null default 'file-text',
  -- JSON schema-ish field list rendered by the intake form. Validated in TS.
  fields jsonb not null default '[]'::jsonb,
  sla_hours integer not null default 72 check (sla_hours > 0),
  requires_approval boolean not null default true,
  included_in_plan boolean not null default true,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists request_types_global_key
  on public.request_types (key) where workspace_id is null;
create unique index if not exists request_types_workspace_key
  on public.request_types (workspace_id, key) where workspace_id is not null;

-- ---------------------------------------------------------------------------
-- Requests
-- ---------------------------------------------------------------------------
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  -- Human reference shown in the UI, e.g. "REQ-42", unique per workspace.
  number integer not null,
  type_id uuid not null references public.request_types (id) on delete restrict,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '',
  -- Answers to the request type's custom fields, keyed by field key.
  fields jsonb not null default '{}'::jsonb,
  status public.request_status not null default 'submitted',
  priority public.request_priority not null default 'normal',
  requested_by uuid references public.profiles (id) on delete set null,
  assigned_to uuid references public.profiles (id) on delete set null,
  due_at timestamptz,
  submitted_at timestamptz,
  started_at timestamptz,
  delivered_at timestamptz,
  completed_at timestamptz,
  -- Client-supplied key so retried submissions never create duplicates.
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, number),
  unique (workspace_id, idempotency_key)
);
create index if not exists requests_workspace_status_idx
  on public.requests (workspace_id, status, updated_at desc);
create index if not exists requests_assigned_idx
  on public.requests (assigned_to) where status not in ('completed', 'cancelled');

-- Per-workspace sequence without a sequence object per tenant: a counter row.
create table if not exists public.request_counters (
  workspace_id uuid primary key references public.workspaces (id) on delete cascade,
  last_number integer not null default 0
);

create or replace function public.next_request_number(ws uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  insert into public.request_counters (workspace_id, last_number)
  values (ws, 1)
  on conflict (workspace_id)
  do update set last_number = public.request_counters.last_number + 1
  returning last_number into n;
  return n;
end $$;
revoke all on function public.next_request_number(uuid) from public;

create or replace function public.requests_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.number is null then
    new.number := public.next_request_number(new.workspace_id);
  end if;
  if new.status = 'submitted' and new.submitted_at is null then
    new.submitted_at := now();
  end if;
  if new.due_at is null then
    select now() + make_interval(hours => t.sla_hours) into new.due_at
    from public.request_types t where t.id = new.type_id;
  end if;
  return new;
end $$;

drop trigger if exists requests_before_insert on public.requests;
create trigger requests_before_insert
  before insert on public.requests
  for each row execute function public.requests_before_insert();

-- Status transitions allowed at the database level. The TS state machine in
-- domain/status.ts mirrors this table exactly and is the source of truth for
-- *who* may make the move; this trigger is the backstop for *what* moves exist.
create or replace function public.requests_before_update()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.workspace_id <> old.workspace_id then
    raise exception 'requests.workspace_id is immutable';
  end if;
  if new.number <> old.number then
    raise exception 'requests.number is immutable';
  end if;
  if new.status <> old.status then
    if not (
      (old.status = 'draft'           and new.status in ('submitted', 'cancelled')) or
      (old.status = 'submitted'       and new.status in ('in_review', 'in_progress', 'awaiting_client', 'on_hold', 'cancelled')) or
      (old.status = 'in_review'       and new.status in ('in_progress', 'awaiting_client', 'on_hold', 'cancelled')) or
      (old.status = 'in_progress'     and new.status in ('awaiting_client', 'delivered', 'on_hold', 'cancelled')) or
      (old.status = 'awaiting_client' and new.status in ('in_review', 'in_progress', 'on_hold', 'cancelled')) or
      (old.status = 'delivered'       and new.status in ('in_progress', 'completed', 'cancelled')) or
      (old.status = 'on_hold'         and new.status in ('in_review', 'in_progress', 'cancelled')) or
      (old.status = 'completed'       and new.status in ('in_progress'))
    ) then
      raise exception 'invalid request status transition % -> %', old.status, new.status
        using errcode = 'check_violation';
    end if;
    if new.status = 'submitted'   then new.submitted_at := coalesce(new.submitted_at, now()); end if;
    if new.status = 'in_progress' then new.started_at   := coalesce(new.started_at, now()); end if;
    if new.status = 'delivered'   then new.delivered_at := now(); end if;
    if new.status = 'completed'   then new.completed_at := now(); end if;
  end if;
  return new;
end $$;

drop trigger if exists requests_before_update on public.requests;
create trigger requests_before_update
  before update on public.requests
  for each row execute function public.requests_before_update();

-- ---------------------------------------------------------------------------
-- Comments (client <-> team thread on a request). internal = team-only note.
-- ---------------------------------------------------------------------------
create table if not exists public.request_comments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  request_id uuid not null references public.requests (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  author_kind public.request_actor not null default 'client',
  body text not null check (char_length(body) between 1 and 10000),
  internal boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists request_comments_request_idx
  on public.request_comments (request_id, created_at);

-- ---------------------------------------------------------------------------
-- Attachments. Files live in Storage bucket "request-files" at
--   {workspace_id}/{request_id}/{attachment_id}/{filename}
-- The row is written after the upload succeeds.
-- ---------------------------------------------------------------------------
create table if not exists public.request_attachments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  request_id uuid not null references public.requests (id) on delete cascade,
  deliverable_id uuid,
  uploaded_by uuid references public.profiles (id) on delete set null,
  uploaded_by_kind public.request_actor not null default 'client',
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  created_at timestamptz not null default now()
);
create index if not exists request_attachments_request_idx
  on public.request_attachments (request_id, created_at);

-- ---------------------------------------------------------------------------
-- Deliverables. The team posts one or more; the client approves or asks for
-- changes. Approving the last pending deliverable completes the request.
-- ---------------------------------------------------------------------------
create table if not exists public.request_deliverables (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  request_id uuid not null references public.requests (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  summary text not null default '',
  -- Optional live link (staging URL, published page, GBP post).
  url text,
  status public.deliverable_status not null default 'pending',
  version integer not null default 1,
  posted_by uuid references public.profiles (id) on delete set null,
  decided_by uuid references public.profiles (id) on delete set null,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists request_deliverables_request_idx
  on public.request_deliverables (request_id, created_at);

alter table public.request_attachments
  drop constraint if exists request_attachments_deliverable_fk;
alter table public.request_attachments
  add constraint request_attachments_deliverable_fk
  foreign key (deliverable_id) references public.request_deliverables (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Activity log. Append-only. Also the source for notifications.
-- ---------------------------------------------------------------------------
create table if not exists public.request_events (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  request_id uuid not null references public.requests (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  actor_kind public.request_actor not null default 'system',
  kind text not null,          -- e.g. 'status_changed', 'comment_added'
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists request_events_request_idx
  on public.request_events (request_id, id);

-- ---------------------------------------------------------------------------
-- Notification outbox. The core notifications worker drains this table.
-- Rows are idempotent on (dedupe_key).
-- ---------------------------------------------------------------------------
create table if not exists public.notification_outbox (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  recipient_id uuid references public.profiles (id) on delete cascade,
  -- 'client_admins' | 'client_all' | 'team' | 'user'
  audience text not null,
  channel_hint text not null default 'inapp',  -- inapp | email | sms | push
  template text not null,
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text not null unique,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index if not exists notification_outbox_unsent_idx
  on public.notification_outbox (created_at) where sent_at is null;

-- ---------------------------------------------------------------------------
-- Keep child workspace_id in sync with the parent request.
-- ---------------------------------------------------------------------------
create or replace function public.request_child_sync_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare ws uuid;
begin
  select workspace_id into ws from public.requests where id = new.request_id;
  if ws is null then
    raise exception 'request % not found', new.request_id;
  end if;
  if new.workspace_id is distinct from ws then
    raise exception 'workspace_id does not match parent request'
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['request_comments', 'request_attachments', 'request_deliverables', 'request_events'] loop
    execute format('drop trigger if exists %I_sync_workspace on public.%I', t, t);
    execute format(
      'create trigger %I_sync_workspace before insert or update on public.%I
       for each row execute function public.request_child_sync_workspace()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Activity + outbox fan-out on the hot paths, in the database, so every
-- client (web, API, future mobile) gets the same audit trail.
-- ---------------------------------------------------------------------------
create or replace function public.requests_after_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  kind text;
  actor public.request_actor;
begin
  actor := case when public.is_staff() then 'team' when auth.uid() is null then 'system' else 'client' end;

  if tg_op = 'INSERT' then
    if new.status = 'draft' then return new; end if;
    kind := 'submitted';
  elsif old.status = 'draft' and new.status = 'submitted' then
    kind := 'submitted';  -- a draft promoted by the client counts as a submission
  elsif new.status <> old.status then
    kind := 'status_changed';
  elsif new.assigned_to is distinct from old.assigned_to then
    kind := 'assigned';
  else
    return new;
  end if;

  insert into public.request_events (workspace_id, request_id, actor_id, actor_kind, kind, data)
  values (
    new.workspace_id, new.id, auth.uid(), actor, kind,
    jsonb_build_object(
      'from', case when tg_op = 'UPDATE' then old.status::text end,
      'to', new.status::text,
      'assigned_to', new.assigned_to
    )
  );

  -- Notifications. Who hears about what:
  --   submitted / client comment / approval -> team
  --   status changes, deliveries, team comments -> client
  if kind = 'submitted' then
    insert into public.notification_outbox (workspace_id, audience, template, payload, dedupe_key)
    values (new.workspace_id, 'team', 'request.submitted',
            jsonb_build_object('request_id', new.id, 'number', new.number, 'title', new.title),
            'request.submitted:' || new.id)
    on conflict (dedupe_key) do nothing;
  elsif kind = 'status_changed' and new.status in ('in_progress', 'awaiting_client', 'delivered', 'completed', 'on_hold', 'cancelled') then
    insert into public.notification_outbox (workspace_id, audience, channel_hint, template, payload, dedupe_key)
    values (new.workspace_id, 'client_all',
            case when new.status in ('awaiting_client', 'delivered') then 'email' else 'inapp' end,
            'request.status.' || new.status::text,
            jsonb_build_object('request_id', new.id, 'number', new.number, 'title', new.title, 'from', old.status::text),
            'request.status:' || new.id || ':' || new.status::text || ':' || extract(epoch from now())::bigint)
    on conflict (dedupe_key) do nothing;
  end if;
  return new;
end $$;

drop trigger if exists requests_after_change on public.requests;
create trigger requests_after_change
  after insert or update on public.requests
  for each row execute function public.requests_after_change();

create or replace function public.request_comments_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.request_events (workspace_id, request_id, actor_id, actor_kind, kind, data)
  values (new.workspace_id, new.request_id, new.author_id, new.author_kind, 'comment_added',
          jsonb_build_object('comment_id', new.id, 'internal', new.internal));
  if not new.internal then
    insert into public.notification_outbox (workspace_id, audience, template, payload, dedupe_key)
    values (new.workspace_id,
            case when new.author_kind = 'team' then 'client_all' else 'team' end,
            'request.comment',
            jsonb_build_object('request_id', new.request_id, 'comment_id', new.id),
            'request.comment:' || new.id)
    on conflict (dedupe_key) do nothing;
  end if;
  return new;
end $$;

drop trigger if exists request_comments_after_insert on public.request_comments;
create trigger request_comments_after_insert
  after insert on public.request_comments
  for each row execute function public.request_comments_after_insert();

create or replace function public.request_deliverables_after_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare pending_left integer;
begin
  if tg_op = 'INSERT' then
    insert into public.request_events (workspace_id, request_id, actor_id, actor_kind, kind, data)
    values (new.workspace_id, new.request_id, new.posted_by, 'team', 'deliverable_posted',
            jsonb_build_object('deliverable_id', new.id, 'title', new.title, 'version', new.version));
    -- Posting a deliverable moves the request to delivered.
    update public.requests set status = 'delivered'
    where id = new.request_id and status in ('in_progress', 'awaiting_client', 'in_review', 'submitted');
    return new;
  end if;

  if new.status <> old.status and new.status in ('approved', 'changes_requested') then
    insert into public.request_events (workspace_id, request_id, actor_id, actor_kind, kind, data)
    values (new.workspace_id, new.request_id, new.decided_by, 'client',
            case when new.status = 'approved' then 'deliverable_approved' else 'deliverable_changes_requested' end,
            jsonb_build_object('deliverable_id', new.id, 'note', new.decision_note));
    insert into public.notification_outbox (workspace_id, audience, template, payload, dedupe_key)
    values (new.workspace_id, 'team',
            case when new.status = 'approved' then 'deliverable.approved' else 'deliverable.changes_requested' end,
            jsonb_build_object('request_id', new.request_id, 'deliverable_id', new.id, 'note', new.decision_note),
            'deliverable.decision:' || new.id || ':' || new.status::text)
    on conflict (dedupe_key) do nothing;

    if new.status = 'approved' then
      select count(*) into pending_left from public.request_deliverables
      where request_id = new.request_id and status = 'pending' and id <> new.id;
      if pending_left = 0 then
        update public.requests set status = 'completed'
        where id = new.request_id and status = 'delivered';
      end if;
    else
      update public.requests set status = 'in_progress'
      where id = new.request_id and status = 'delivered';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists request_deliverables_after_change on public.request_deliverables;
create trigger request_deliverables_after_change
  after insert or update on public.request_deliverables
  for each row execute function public.request_deliverables_after_change();

-- updated_at maintenance for the small tables
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists request_types_touch on public.request_types;
create trigger request_types_touch before update on public.request_types
  for each row execute function public.touch_updated_at();
create or replace function public.request_deliverables_before_update()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status <> old.status then
    if old.status <> 'pending' then
      raise exception 'deliverable decision is final' using errcode = 'check_violation';
    end if;
    new.decided_at := now();
    new.decided_by := coalesce(new.decided_by, auth.uid());
  end if;
  return new;
end $$;
drop trigger if exists request_deliverables_touch on public.request_deliverables;
drop trigger if exists request_deliverables_before_update on public.request_deliverables;
create trigger request_deliverables_before_update before update on public.request_deliverables
  for each row execute function public.request_deliverables_before_update();
