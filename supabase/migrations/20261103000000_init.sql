-- ArkiTech Portal: initial schema.
--
-- One database, many tenants. Every tenant-owned row carries a workspace_id
-- and is guarded by row-level security, so a client can only ever read or
-- write rows of workspaces they belong to, and ArkiTech staff can see all of
-- them. Nothing in the application layer is trusted to filter by tenant; the
-- database does it.
--
-- Conventions
--   * ids are uuids, money is integer cents, time is timestamptz.
--   * helper functions are SECURITY DEFINER with a fixed search_path so RLS
--     policies can call them without recursing into themselves.
--   * tenant tables get their policies from apply_tenant_policies(), one line
--     each, so a new table cannot be forgotten.

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------------------------------------------------------------- enums ---
create type member_role as enum ('owner', 'admin', 'member');
create type staff_role as enum ('owner', 'member', 'dev');
create type module_status as enum ('included', 'active', 'trial', 'paused', 'cancelled');
create type automation_status as enum ('included', 'active', 'paused', 'available');
create type lead_stage as enum ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost');
create type invoice_status as enum ('draft', 'open', 'paid', 'overdue', 'void');
create type sms_registration_status as enum ('draft', 'submitted', 'brand_approved', 'campaign_approved', 'live', 'rejected');

-- ----------------------------------------------------------- utilities ---
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ------------------------------------------------------------- profiles ---
-- One row per auth user, created by trigger so the app can always join it.
create table profiles (
  id         uuid primary key references auth.users on delete cascade,
  is_staff   boolean not null default false,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on profiles for each row execute function set_updated_at();

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------- staff ---
-- The ArkiTech team. Staff see every workspace from the admin app.
create table staff (
  user_id    uuid primary key references auth.users on delete cascade,
  role       staff_role not null default 'member',
  created_at timestamptz not null default now()
);

create or replace function sync_profile_staff() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    update profiles set is_staff = false where id = old.user_id;
    return old;
  end if;
  update profiles set is_staff = true where id = new.user_id;
  return new;
end $$;
create trigger staff_sync_profile after insert or delete on staff for each row execute function sync_profile_staff();

create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where user_id = auth.uid());
$$;

-- ----------------------------------------------------------- workspaces ---
-- A workspace is one client company: its own brand, members, modules and data.
create table workspaces (
  id                      uuid primary key default gen_random_uuid(),
  slug                    citext not null unique
                            check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$'),
  name                    text not null,
  legal_name              text,
  website                 text,
  phone                   text,
  email                   text,
  industry                text,
  address                 jsonb not null default '{}',
  gbp_url                 text,
  plan_key                text not null default 'growth',
  plan_status             text not null default 'active',
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  -- Brand tokens: {"accent":"#eaa14d","logoUrl":..., "wordmark":..., "poweredBy":true, "artwork":"harbor"}
  theme                   jsonb not null default '{}',
  -- Onboarding progress: {"step":"business","answers":{...}}
  onboarding              jsonb not null default '{}',
  onboarding_completed_at timestamptz,
  created_by              uuid references auth.users on delete set null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create trigger workspaces_updated before update on workspaces for each row execute function set_updated_at();

create table memberships (
  workspace_id uuid not null references workspaces on delete cascade,
  user_id      uuid not null references auth.users on delete cascade,
  role         member_role not null default 'member',
  -- Per-module access for members: {"crm":"write","finance":"none"}; absent = read.
  permissions  jsonb not null default '{}',
  invited_by   uuid references auth.users on delete set null,
  created_at   timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index memberships_user on memberships (user_id);

create table invites (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  email        citext not null,
  role         member_role not null default 'member',
  permissions  jsonb not null default '{}',
  token        text not null unique default encode(gen_random_bytes(24), 'hex'),
  expires_at   timestamptz not null default now() + interval '7 days',
  accepted_at  timestamptz,
  created_by   uuid references auth.users on delete set null,
  created_at   timestamptz not null default now(),
  unique (workspace_id, email)
);

-- ------------------------------------------------ membership predicates ---
create or replace function is_member(ws uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships where workspace_id = ws and user_id = auth.uid());
$$;

create or replace function member_role(ws uuid) returns member_role
language sql stable security definer set search_path = public as $$
  select role from memberships where workspace_id = ws and user_id = auth.uid();
$$;

create or replace function is_workspace_admin(ws uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role in ('owner', 'admin') from memberships where workspace_id = ws and user_id = auth.uid()),
    false);
$$;

-- Can the current user write to this module of this workspace?
create or replace function can_write(ws uuid, module text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((
    select case
      when role in ('owner', 'admin') then true
      else coalesce(permissions ->> module, 'read') = 'write'
    end
    from memberships where workspace_id = ws and user_id = auth.uid()
  ), false);
$$;

create or replace function my_workspace_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select workspace_id from memberships where user_id = auth.uid();
$$;

-- Policy factory. Every tenant table gets the same four policies, bound to
-- the module whose permission governs writes.
create or replace function apply_tenant_policies(tbl regclass, module text) returns void
language plpgsql as $$
declare
  t text := tbl::text;
begin
  execute format('alter table %s enable row level security', t);
  execute format('drop policy if exists tenant_select on %s', t);
  execute format('drop policy if exists tenant_insert on %s', t);
  execute format('drop policy if exists tenant_update on %s', t);
  execute format('drop policy if exists tenant_delete on %s', t);
  execute format(
    'create policy tenant_select on %s for select using (is_staff() or is_member(workspace_id))', t);
  execute format(
    'create policy tenant_insert on %s for insert with check (is_staff() or can_write(workspace_id, %L))', t, module);
  execute format(
    'create policy tenant_update on %s for update using (is_staff() or can_write(workspace_id, %L)) with check (is_staff() or can_write(workspace_id, %L))', t, module, module);
  execute format(
    'create policy tenant_delete on %s for delete using (is_staff() or can_write(workspace_id, %L))', t, module);
end $$;

-- ------------------------------------------------- policies: core tables ---
alter table profiles enable row level security;
create policy profiles_self_select on profiles for select
  using (id = auth.uid() or is_staff()
         or exists (select 1 from memberships m join memberships me on me.workspace_id = m.workspace_id
                    where m.user_id = profiles.id and me.user_id = auth.uid()));
create policy profiles_self_update on profiles for update using (id = auth.uid()) with check (id = auth.uid() and is_staff = (select is_staff from profiles p where p.id = auth.uid()));

alter table staff enable row level security;
create policy staff_select on staff for select using (is_staff());
create policy staff_manage on staff for all
  using (exists (select 1 from staff s where s.user_id = auth.uid() and s.role = 'owner'));

alter table workspaces enable row level security;
create policy workspaces_select on workspaces for select using (is_staff() or is_member(id));
create policy workspaces_insert on workspaces for insert with check (is_staff() or created_by = auth.uid());
create policy workspaces_update on workspaces for update
  using (is_staff() or is_workspace_admin(id)) with check (is_staff() or is_workspace_admin(id));
create policy workspaces_delete on workspaces for delete using (is_staff());

alter table memberships enable row level security;
create policy memberships_select on memberships for select using (is_staff() or is_member(workspace_id));
create policy memberships_insert on memberships for insert
  with check (is_staff() or is_workspace_admin(workspace_id)
              -- the creator of a new workspace becomes its owner
              or (user_id = auth.uid() and role = 'owner'
                  and exists (select 1 from workspaces w where w.id = workspace_id and w.created_by = auth.uid())
                  and not exists (select 1 from memberships m where m.workspace_id = memberships.workspace_id)));
create policy memberships_update on memberships for update
  using (is_staff() or is_workspace_admin(workspace_id));
create policy memberships_delete on memberships for delete
  using (is_staff() or is_workspace_admin(workspace_id) or user_id = auth.uid());

alter table invites enable row level security;
create policy invites_select on invites for select using (is_staff() or is_workspace_admin(workspace_id));
create policy invites_write on invites for all
  using (is_staff() or is_workspace_admin(workspace_id))
  with check (is_staff() or is_workspace_admin(workspace_id));

-- ------------------------------------------------------- module catalog ---
-- What ArkiTech sells. Prices live here so the pricing page, onboarding and
-- billing all agree. kind=core modules come with a plan; add-ons are extra.
create table modules (
  key           text primary key,
  name          text not null,
  blurb         text not null,
  kind          text not null check (kind in ('core', 'addon')),
  monthly_cents integer not null default 0,
  included_in   text[] not null default '{growth}',
  -- For metered add-ons: {"unit":"message","included":2000,"step":1000,"step_cents":2500}
  metered       jsonb,
  sort          integer not null default 100,
  active        boolean not null default true
);
alter table modules enable row level security;
create policy modules_read on modules for select using (true);
create policy modules_manage on modules for all using (is_staff()) with check (is_staff());

create table workspace_modules (
  workspace_id        uuid not null references workspaces on delete cascade,
  module_key          text not null references modules on delete cascade,
  status              module_status not null default 'active',
  stripe_item_id      text,
  activated_at        timestamptz not null default now(),
  cancel_at           timestamptz,
  trial_ends_at       timestamptz,
  usage_period_start  date not null default date_trunc('month', now())::date,
  usage_count         integer not null default 0,
  primary key (workspace_id, module_key)
);
select apply_tenant_policies('workspace_modules', 'billing');

create table automations (
  key           text primary key,
  name          text not null,
  blurb         text not null,
  monthly_cents integer not null default 0,
  included      boolean not null default false,
  requires      text,            -- module key this automation needs, if any
  sort          integer not null default 100,
  active        boolean not null default true
);
alter table automations enable row level security;
create policy automations_read on automations for select using (true);
create policy automations_manage on automations for all using (is_staff()) with check (is_staff());

create table workspace_automations (
  workspace_id    uuid not null references workspaces on delete cascade,
  automation_key  text not null references automations on delete cascade,
  status          automation_status not null default 'active',
  config          jsonb not null default '{}',
  stripe_item_id  text,
  activated_at    timestamptz not null default now(),
  primary key (workspace_id, automation_key)
);
select apply_tenant_policies('workspace_automations', 'automations');

-- ------------------------------------------------------- per-ws counters ---
-- Human-friendly numbers (request #12, invoice #3) that restart per workspace.
create table workspace_counters (
  workspace_id uuid not null references workspaces on delete cascade,
  name         text not null,
  value        integer not null default 0,
  primary key (workspace_id, name)
);
alter table workspace_counters enable row level security;
create policy counters_select on workspace_counters for select using (is_staff() or is_member(workspace_id));

create or replace function next_counter(ws uuid, counter text) returns integer
language plpgsql security definer set search_path = public as $$
declare v integer;
begin
  insert into workspace_counters (workspace_id, name, value) values (ws, counter, 1)
  on conflict (workspace_id, name) do update set value = workspace_counters.value + 1
  returning value into v;
  return v;
end $$;

-- ------------------------------------------------------------------ CRM ---
-- The client's own customers and leads. Never ArkiTech's.
create table contacts (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references workspaces on delete cascade,
  first_name       text,
  last_name        text,
  company          text,
  email            citext,
  phone            text,
  source           text,
  stage            lead_stage not null default 'new',
  value_cents      integer,
  tags             text[] not null default '{}',
  notes            text,
  address          jsonb not null default '{}',
  lat              double precision,
  lng              double precision,
  owner_id         uuid references auth.users on delete set null,
  sms_opt_in       boolean not null default false,
  sms_opt_in_at    timestamptz,
  last_activity_at timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index contacts_ws_stage on contacts (workspace_id, stage);
create index contacts_ws_email on contacts (workspace_id, email);
create trigger contacts_updated before update on contacts for each row execute function set_updated_at();
select apply_tenant_policies('contacts', 'crm');

create table activities (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  contact_id   uuid not null references contacts on delete cascade,
  kind         text not null check (kind in ('note', 'call', 'email', 'sms', 'meeting', 'stage', 'task')),
  body         text,
  at           timestamptz not null default now(),
  created_by   uuid references auth.users on delete set null
);
create index activities_contact on activities (contact_id, at desc);
select apply_tenant_policies('activities', 'crm');

-- ------------------------------------------- Google Business Profile ---
create table gbp_snapshots (
  workspace_id       uuid not null references workspaces on delete cascade,
  day                date not null,
  rating             numeric(3,2),
  review_count       integer,
  views              integer,
  searches           integer,
  calls              integer,
  direction_requests integer,
  website_clicks     integer,
  photo_count        integer,
  post_count         integer,
  primary key (workspace_id, day)
);
select apply_tenant_policies('gbp_snapshots', 'gbp');

create table reviews (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  source       text not null default 'google',
  external_id  text,
  author       text,
  rating       integer check (rating between 1 and 5),
  body         text,
  posted_at    timestamptz not null default now(),
  reply        text,
  replied_at   timestamptz,
  unique (workspace_id, source, external_id)
);
create index reviews_ws on reviews (workspace_id, posted_at desc);
select apply_tenant_policies('reviews', 'gbp');

create table review_requests (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  contact_id   uuid references contacts on delete set null,
  to_name      text,
  to_phone     text not null,
  status       text not null default 'queued' check (status in ('queued', 'sent', 'delivered', 'clicked', 'reviewed', 'failed', 'opted_out')),
  sent_at      timestamptz,
  clicked_at   timestamptz,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index review_requests_ws on review_requests (workspace_id, created_at desc);
select apply_tenant_policies('review_requests', 'gbp');

-- ------------------------------------------------------------ analytics ---
create table integrations (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  provider     text not null,     -- ga4 | meta | instagram | gbp | google_calendar | stripe
  status       text not null default 'disconnected',
  config       jsonb not null default '{}',
  connected_at timestamptz,
  unique (workspace_id, provider)
);
select apply_tenant_policies('integrations', 'settings');

create table metrics_daily (
  workspace_id uuid not null references workspaces on delete cascade,
  day          date not null,
  source       text not null,     -- ga4 | meta | instagram | gbp | site
  metric       text not null,     -- sessions | users | leads | reach | followers | ...
  value        numeric not null default 0,
  primary key (workspace_id, day, source, metric)
);
select apply_tenant_policies('metrics_daily', 'analytics');

-- -------------------------------------------------------------- finance ---
create table invoices (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references workspaces on delete cascade,
  number            integer not null,
  stripe_invoice_id text unique,
  amount_cents      integer not null,
  status            invoice_status not null default 'open',
  description       text,
  line_items        jsonb not null default '[]',
  due_date          date,
  paid_at           timestamptz,
  hosted_url        text,
  pdf_url           text,
  created_at        timestamptz not null default now(),
  unique (workspace_id, number)
);
create or replace function invoices_number() returns trigger
language plpgsql as $$
begin
  if new.number is null then new.number := next_counter(new.workspace_id, 'invoice'); end if;
  return new;
end $$;
create trigger invoices_number before insert on invoices for each row execute function invoices_number();
alter table invoices alter column number set default null;
create index invoices_ws on invoices (workspace_id, created_at desc);
select apply_tenant_policies('invoices', 'billing');

create table transactions (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  at           date not null default current_date,
  amount_cents integer not null,            -- positive in, negative out
  category     text,
  memo         text,
  source       text not null default 'manual',
  external_id  text,
  created_at   timestamptz not null default now(),
  unique (workspace_id, source, external_id)
);
create index transactions_ws_at on transactions (workspace_id, at desc);
select apply_tenant_policies('transactions', 'finance');

create table quotes (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  contact_id   uuid references contacts on delete set null,
  title        text not null,
  line_items   jsonb not null default '[]',
  total_cents  integer not null default 0,
  status       text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined')),
  sent_at      timestamptz,
  created_by   uuid references auth.users on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger quotes_updated before update on quotes for each row execute function set_updated_at();
select apply_tenant_policies('quotes', 'finance');

-- ---------------------------------------------------------- AI assistant ---
create table assistant_threads (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  user_id      uuid not null references auth.users on delete cascade,
  title        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger assistant_threads_updated before update on assistant_threads for each row execute function set_updated_at();
alter table assistant_threads enable row level security;
create policy threads_own on assistant_threads for all
  using (user_id = auth.uid() and is_member(workspace_id))
  with check (user_id = auth.uid() and is_member(workspace_id));

create table assistant_messages (
  id           uuid primary key default gen_random_uuid(),
  thread_id    uuid not null references assistant_threads on delete cascade,
  workspace_id uuid not null references workspaces on delete cascade,
  role         text not null check (role in ('user', 'assistant')),
  content      text not null default '',
  ui           text,                         -- OpenUI program rendered with the answer
  created_at   timestamptz not null default now()
);
create index assistant_messages_thread on assistant_messages (thread_id, created_at);
alter table assistant_messages enable row level security;
create policy messages_own on assistant_messages for all
  using (exists (select 1 from assistant_threads t where t.id = thread_id and t.user_id = auth.uid()))
  with check (exists (select 1 from assistant_threads t where t.id = thread_id and t.user_id = auth.uid()));

-- ------------------------------------------------------ website chatbot ---
create table chatbot_configs (
  workspace_id uuid primary key references workspaces on delete cascade,
  site_key     text not null unique default encode(gen_random_bytes(12), 'hex'),
  enabled      boolean not null default true,
  name         text not null default 'Assistant',
  greeting     text not null default 'Hi! How can we help today?',
  tone         text not null default 'friendly',
  knowledge    text,
  accent       text,
  updated_at   timestamptz not null default now()
);
create trigger chatbot_configs_updated before update on chatbot_configs for each row execute function set_updated_at();
select apply_tenant_policies('chatbot_configs', 'chatbot');

create table chatbot_conversations (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references workspaces on delete cascade,
  visitor_id     text,
  page_url       text,
  lead_contact   uuid references contacts on delete set null,
  message_count  integer not null default 0,
  started_at     timestamptz not null default now(),
  last_at        timestamptz not null default now()
);
create index chatbot_conversations_ws on chatbot_conversations (workspace_id, last_at desc);
select apply_tenant_policies('chatbot_conversations', 'chatbot');

create table chatbot_messages (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references workspaces on delete cascade,
  conversation_id uuid not null references chatbot_conversations on delete cascade,
  role            text not null check (role in ('visitor', 'bot')),
  content         text not null,
  created_at      timestamptz not null default now()
);
create index chatbot_messages_conv on chatbot_messages (conversation_id, created_at);
select apply_tenant_policies('chatbot_messages', 'chatbot');

-- ---------------------------------------- review retainer registration ---
-- Everything a carrier needs for A2P 10DLC, plus the client's authorization.
-- Which Twilio account registers it (ArkiTech's or the client's own) is an
-- open decision; `twilio` holds whatever that integration records.
create table sms_registrations (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null unique references workspaces on delete cascade,
  status        sms_registration_status not null default 'draft',
  -- {"legalName","ein","entityType","industry","website","address":{...},"hasEin":true}
  business      jsonb not null default '{}',
  -- {"name","title","email","phone"}
  contact       jsonb not null default '{}',
  -- {"useCase","description","optInFlow","sampleMessages":[...],"privacyUrl","termsUrl"}
  campaign      jsonb not null default '{}',
  -- {"authorized":true,"name","title","at","ip","userAgent","text"}; written once.
  consent       jsonb not null default '{}',
  twilio        jsonb not null default '{}',
  submitted_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger sms_registrations_updated before update on sms_registrations for each row execute function set_updated_at();
select apply_tenant_policies('sms_registrations', 'settings');

-- -------------------------------------------------- notifications, audit ---
create table notifications (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  user_id      uuid references auth.users on delete cascade,   -- null = everyone in the workspace
  kind         text not null,
  title        text not null,
  body         text,
  href         text,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index notifications_ws_user on notifications (workspace_id, user_id, created_at desc);
alter table notifications enable row level security;
create policy notifications_select on notifications for select
  using (is_staff() or (is_member(workspace_id) and (user_id is null or user_id = auth.uid())));
create policy notifications_update on notifications for update
  using (is_member(workspace_id) and (user_id is null or user_id = auth.uid()));
create policy notifications_insert on notifications for insert with check (is_staff() or is_member(workspace_id));

create table audit_log (
  id           bigint generated always as identity primary key,
  workspace_id uuid references workspaces on delete cascade,
  actor_id     uuid,
  action       text not null,
  entity       text,
  entity_id    text,
  meta         jsonb not null default '{}',
  at           timestamptz not null default now()
);
create index audit_ws on audit_log (workspace_id, at desc);
alter table audit_log enable row level security;
create policy audit_select on audit_log for select using (is_staff() or is_workspace_admin(workspace_id));
create policy audit_insert on audit_log for insert with check (is_staff() or is_member(workspace_id));

-- ---------------------------------------------------------- idempotency ---
-- Mutations that must not run twice (webhooks, add-on toggles, uploads)
-- record their key here first; a duplicate key is a no-op.
create table idempotency_keys (
  key          text primary key,
  workspace_id uuid references workspaces on delete cascade,
  response     jsonb,
  created_at   timestamptz not null default now()
);
alter table idempotency_keys enable row level security;   -- service role only

create table webhook_events (
  id          text primary key,          -- provider event id
  provider    text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);
alter table webhook_events enable row level security;      -- service role only

-- -------------------------------------------------------------- storage ---
insert into storage.buckets (id, name, public, file_size_limit)
values ('workspace-files', 'workspace-files', false, 104857600)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit)
values ('brand', 'brand', true, 5242880)
on conflict (id) do nothing;

-- Objects are keyed <workspace_id>/<anything>; the first path segment decides access.
create policy "workspace files read" on storage.objects for select
  using (bucket_id in ('workspace-files', 'brand')
         and (is_staff() or is_member((storage.foldername(name))[1]::uuid)));
create policy "workspace files write" on storage.objects for insert
  with check (bucket_id in ('workspace-files', 'brand')
              and (is_staff() or is_member((storage.foldername(name))[1]::uuid)));
create policy "workspace files delete" on storage.objects for delete
  using (bucket_id in ('workspace-files', 'brand')
         and (is_staff() or can_write((storage.foldername(name))[1]::uuid, 'requests')));

-- ------------------------------------------------------- catalog seed ---
insert into modules (key, name, blurb, kind, monthly_cents, included_in, metered, sort) values
  ('overview',    'Overview',        'What needs you, and how the business is doing.',                        'core',  0,    '{growth,website}', null, 10),
  ('requests',    'Requests',        'Send work and change requests, upload files, follow progress.',          'core',  0,    '{growth,website}', null, 20),
  ('crm',         'CRM & Lead Map',  'Your customers and leads on a board, a list and a map.',                 'core',  0,    '{growth,website}', null, 30),
  ('gbp',         'Google Profile',  'Reviews, visibility and review requests, managed by ArkiTech.',          'core',  0,    '{growth}',         null, 40),
  ('automations', 'Automations',     'Speed-to-lead, missed-call text-back, follow-ups and more.',             'core',  0,    '{growth,website}', null, 50),
  ('billing',     'Billing',         'Your plan, add-ons and invoices.',                                       'core',  0,    '{growth,website}', null, 60),
  ('calendar',    'Scheduling',      'Every calendar you use, synced into one.',                               'addon', 5000, '{}',               null, 70),
  ('analytics',   'Analytics',       'Google Analytics, Meta and your socials, connected in one view.',        'addon', 5000, '{}',               null, 80),
  ('finance',     'Finance',         'Quotes, and the money coming in and going out.',                         'addon', 5000, '{}',               null, 90),
  ('assistant',   'AI Assistant',    'Reads your centralized data and answers questions with live charts.',    'addon', 5000, '{}',               null, 100),
  ('chatbot',     'Website Chatbot', 'Answers visitors on your site, day and night, and captures leads.',      'addon', 5000, '{}',
     '{"unit":"message","included":2000,"step":1000,"step_cents":2500}', 110)
on conflict (key) do update set name = excluded.name, blurb = excluded.blurb, kind = excluded.kind,
  monthly_cents = excluded.monthly_cents, included_in = excluded.included_in, metered = excluded.metered, sort = excluded.sort;

insert into automations (key, name, blurb, monthly_cents, included, requires, sort) values
  ('speed_to_lead',    'Speed-to-lead',          'A new lead gets a text and an email within a minute, and you get a ping.',          0,    true,  null,  10),
  ('missed_call',      'Missed-call text-back',  'When you miss a call, the caller gets a text so the lead is not lost.',            0,    true,  null,  20),
  ('review_retainer',  'Review retainer',        'After a job, happy customers get a review request from your own number.',          5000, false, 'gbp', 30),
  ('follow_up',        'Follow-up sequences',    'Leads that go quiet get a short, polite sequence until they answer or opt out.',   5000, false, 'crm', 40),
  ('reactivation',     'Reactivation campaigns', 'Past customers hear from you at the right season with an offer.',                 5000, false, 'crm', 50),
  ('appointment_reminders', 'Appointment reminders', 'Reminders the day before and an hour before, with one-tap reschedule.',       5000, false, 'calendar', 60)
on conflict (key) do update set name = excluded.name, blurb = excluded.blurb, monthly_cents = excluded.monthly_cents,
  included = excluded.included, requires = excluded.requires, sort = excluded.sort;

-- -------------------------------------------------------- housekeeping ---
-- A new workspace gets its plan's core modules and the included automations.
create or replace function provision_workspace() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into workspace_modules (workspace_id, module_key, status)
  select new.id, key, 'included' from modules where new.plan_key = any (included_in) and active
  on conflict do nothing;
  insert into workspace_automations (workspace_id, automation_key, status)
  select new.id, key, 'included' from automations where included and active
  on conflict do nothing;
  return new;
end $$;
create trigger workspaces_provision after insert on workspaces for each row execute function provision_workspace();

-- Realtime for the things people wait on.
alter publication supabase_realtime add table notifications;
