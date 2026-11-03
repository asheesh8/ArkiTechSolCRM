-- Local demo data. Never run against production.
--
-- Accounts (password for all: "portal-demo")
--   ashish@arkitech-sol.com   staff owner
--   terri@arkitech-sol.com    staff member
--   maya@harbordental.com     owner of "Harbor Dental"
--   sam@harbordental.com      member of "Harbor Dental" (read-only on finance)
--   lee@greenlinelandscape.com owner of "Greenline Landscaping" (not onboarded yet)

create or replace function seed_user(uid uuid, email text, name text) returns void
language plpgsql as $$
begin
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change)
  values (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', email,
    crypt('portal-demo', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', name), now(), now(), '', '', '', '')
  on conflict (id) do nothing;
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', email), 'email', now(), now(), now())
  on conflict do nothing;
end $$;

select seed_user('11111111-1111-1111-1111-111111111111', 'ashish@arkitech-sol.com', 'Ashish Subedi');
select seed_user('11111111-1111-1111-1111-111111111112', 'terri@arkitech-sol.com', 'Terri Jambo');
select seed_user('22222222-2222-2222-2222-222222222221', 'maya@harbordental.com', 'Maya Chen');
select seed_user('22222222-2222-2222-2222-222222222222', 'sam@harbordental.com', 'Sam Ortiz');
select seed_user('33333333-3333-3333-3333-333333333331', 'lee@greenlinelandscape.com', 'Lee Baker');

insert into staff (user_id, role) values
  ('11111111-1111-1111-1111-111111111111', 'owner'),
  ('11111111-1111-1111-1111-111111111112', 'member')
on conflict do nothing;

-- Harbor Dental: a fully onboarded client on the Growth plan with two add-ons.
insert into workspaces (id, slug, name, legal_name, website, phone, email, industry, address, gbp_url, plan_key,
  theme, onboarding_completed_at, created_by)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'harbor', 'Harbor Dental', 'Harbor Dental Group LLC',
  'https://harbordental.com', '+18025550142', 'hello@harbordental.com', 'Dental',
  '{"line1":"214 Lake St","city":"Burlington","state":"VT","zip":"05401"}',
  'https://maps.google.com/?cid=1', 'growth',
  '{"accent":"#1f6f8b","poweredBy":true,"radius":"soft"}', now() - interval '40 days', '22222222-2222-2222-2222-222222222221');

insert into memberships (workspace_id, user_id, role, permissions) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222221', 'owner', '{}'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'member', '{"crm":"write","requests":"write","finance":"none"}');

insert into workspace_modules (workspace_id, module_key, status) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'calendar', 'active'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'assistant', 'active'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'analytics', 'trial')
on conflict (workspace_id, module_key) do update set status = excluded.status;
update workspace_modules set trial_ends_at = now() + interval '9 days' where workspace_id = 'aaaaaaaa-0000-0000-0000-000000000001' and module_key = 'analytics';

insert into workspace_automations (workspace_id, automation_key, status) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'review_retainer', 'active')
on conflict do nothing;

-- Greenline: signed up yesterday, has not finished onboarding.
insert into workspaces (id, slug, name, website, plan_key, theme, created_by, onboarding)
values ('aaaaaaaa-0000-0000-0000-000000000002', 'greenline', 'Greenline Landscaping', 'https://greenlinelandscape.com',
  'growth', '{"accent":"#3d6b4f"}', '33333333-3333-3333-3333-333333333331', '{"step":"business"}');
insert into memberships (workspace_id, user_id, role) values
  ('aaaaaaaa-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333331', 'owner');

-- Contacts around Burlington
insert into contacts (workspace_id, first_name, last_name, company, email, phone, source, stage, value_cents, lat, lng, address, created_at, last_activity_at, sms_opt_in) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Jordan', 'Lee', null, 'jordan.lee@example.com', '+18025550101', 'Google', 'new', 45000, 44.4759, -73.2121, '{"city":"Burlington","state":"VT"}', now() - interval '1 day', now() - interval '1 day', false),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Priya', 'Natarajan', null, 'priya.n@example.com', '+18025550102', 'Website', 'contacted', 120000, 44.4906, -73.1865, '{"city":"Winooski","state":"VT"}', now() - interval '3 days', now() - interval '2 days', true),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Marcus', 'Hill', null, 'marcus.hill@example.com', '+18025550103', 'Referral', 'qualified', 380000, 44.4577, -73.1795, '{"city":"South Burlington","state":"VT"}', now() - interval '8 days', now() - interval '1 day', true),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Elena', 'Rossi', null, 'elena.rossi@example.com', '+18025550104', 'Google', 'proposal', 520000, 44.5088, -73.1657, '{"city":"Colchester","state":"VT"}', now() - interval '14 days', now() - interval '3 days', true),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Tom', 'Nguyen', null, 'tom.nguyen@example.com', '+18025550105', 'Facebook', 'won', 240000, 44.4259, -73.2097, '{"city":"Shelburne","state":"VT"}', now() - interval '30 days', now() - interval '6 days', true),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Grace', 'Okafor', null, 'grace.o@example.com', '+18025550106', 'Website', 'new', 60000, 44.4650, -73.1950, '{"city":"Burlington","state":"VT"}', now() - interval '6 hours', now() - interval '6 hours', false),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Daniel', 'Brooks', null, 'dbrooks@example.com', '+18025550107', 'Google', 'lost', 90000, 44.4380, -73.1700, '{"city":"South Burlington","state":"VT"}', now() - interval '22 days', now() - interval '10 days', false),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Hannah', 'Kim', null, 'hannah.kim@example.com', '+18025550108', 'Referral', 'won', 310000, 44.4860, -73.2240, '{"city":"Burlington","state":"VT"}', now() - interval '45 days', now() - interval '12 days', true),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Omar', 'Haddad', null, 'omar.h@example.com', '+18025550109', 'Google', 'contacted', 150000, 44.4700, -73.2000, '{"city":"Burlington","state":"VT"}', now() - interval '2 days', now() - interval '1 day', false),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Sofia', 'Martinez', null, 'sofia.m@example.com', '+18025550110', 'Website', 'qualified', 200000, 44.5200, -73.1500, '{"city":"Colchester","state":"VT"}', now() - interval '9 days', now() - interval '4 days', true);

insert into activities (workspace_id, contact_id, kind, body, at, created_by)
select workspace_id, id, 'call', 'Talked about an implant consult; sending the price sheet.', now() - interval '1 day', '22222222-2222-2222-2222-222222222222' from contacts where email = 'marcus.hill@example.com';
insert into activities (workspace_id, contact_id, kind, body, at, created_by)
select workspace_id, id, 'stage', 'Proposal sent for full smile makeover.', now() - interval '3 days', '22222222-2222-2222-2222-222222222221' from contacts where email = 'elena.rossi@example.com';

-- Google Business Profile: 30 days of snapshots and some reviews
insert into gbp_snapshots (workspace_id, day, rating, review_count, views, searches, calls, direction_requests, website_clicks, photo_count, post_count)
select 'aaaaaaaa-0000-0000-0000-000000000001', d::date,
  4.6 + (extract(day from d)::int % 3) * 0.1, 118 + (30 - i), 90 + (i * 7) % 60, 40 + (i * 5) % 30, 3 + i % 4, 5 + i % 6, 8 + i % 9, 42, 6
from generate_series(0, 29) as i, lateral (select now() - (i || ' days')::interval as d);

insert into reviews (workspace_id, external_id, author, rating, body, posted_at, reply, replied_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'r1', 'Alicia M.', 5, 'Dr. Chen and the team were gentle and explained everything. Best cleaning I have had.', now() - interval '2 days', 'Thank you, Alicia! See you in six months.', now() - interval '1 day'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'r2', 'Ben T.', 4, 'Great care, parking is tight.', now() - interval '5 days', null, null),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'r3', 'Carla D.', 5, 'They got me in the same day for a chipped tooth.', now() - interval '9 days', 'So glad we could help, Carla.', now() - interval '8 days'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'r4', 'Devin P.', 2, 'Waited 40 minutes past my appointment time.', now() - interval '13 days', null, null),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'r5', 'Erin W.', 5, 'The new office is beautiful and the staff remembered my kids'' names.', now() - interval '20 days', 'That means a lot, Erin. Thank you.', now() - interval '19 days');

insert into review_requests (workspace_id, contact_id, to_name, to_phone, status, sent_at, clicked_at, reviewed_at)
select workspace_id, id, first_name, phone, 'reviewed', now() - interval '3 days', now() - interval '3 days', now() - interval '2 days' from contacts where email = 'tom.nguyen@example.com';
insert into review_requests (workspace_id, contact_id, to_name, to_phone, status, sent_at)
select workspace_id, id, first_name, phone, 'sent', now() - interval '1 day' from contacts where email = 'hannah.kim@example.com';

-- Analytics metrics for 30 days
insert into metrics_daily (workspace_id, day, source, metric, value)
select 'aaaaaaaa-0000-0000-0000-000000000001', (now() - (i || ' days')::interval)::date, 'ga4', 'sessions', 60 + (i * 13) % 45 from generate_series(0, 29) i;
insert into metrics_daily (workspace_id, day, source, metric, value)
select 'aaaaaaaa-0000-0000-0000-000000000001', (now() - (i || ' days')::interval)::date, 'ga4', 'leads', (i * 7) % 4 from generate_series(0, 29) i;
insert into metrics_daily (workspace_id, day, source, metric, value)
select 'aaaaaaaa-0000-0000-0000-000000000001', (now() - (i || ' days')::interval)::date, 'meta', 'reach', 300 + (i * 37) % 200 from generate_series(0, 29) i;
insert into metrics_daily (workspace_id, day, source, metric, value)
select 'aaaaaaaa-0000-0000-0000-000000000001', (now() - (i || ' days')::interval)::date, 'instagram', 'followers', 1240 + (29 - i) * 2 from generate_series(0, 29) i;

insert into integrations (workspace_id, provider, status, connected_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'gbp', 'connected', now() - interval '38 days'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'ga4', 'connected', now() - interval '30 days'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'meta', 'connected', now() - interval '30 days'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'google_calendar', 'disconnected', null);

-- Invoices
insert into invoices (workspace_id, amount_cents, status, description, line_items, due_date, paid_at, created_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 40000, 'paid', 'October: Growth Partnership + Scheduling + AI Assistant', '[{"name":"Growth Partnership","cents":30000},{"name":"Scheduling","cents":5000},{"name":"AI Assistant","cents":5000}]', '2026-10-01', '2026-10-01', '2026-09-28'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 40000, 'open', 'November: Growth Partnership + Scheduling + AI Assistant', '[{"name":"Growth Partnership","cents":30000},{"name":"Scheduling","cents":5000},{"name":"AI Assistant","cents":5000}]', '2026-11-05', null, '2026-10-29');

insert into transactions (workspace_id, at, amount_cents, category, memo, source, external_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', current_date - 1, 48000, 'Services', 'Crown, patient #1042', 'manual', 't1'),
  ('aaaaaaaa-0000-0000-0000-000000000001', current_date - 2, 19000, 'Services', 'Cleaning x2', 'manual', 't2'),
  ('aaaaaaaa-0000-0000-0000-000000000001', current_date - 3, -40000, 'Marketing', 'ArkiTech November', 'manual', 't3'),
  ('aaaaaaaa-0000-0000-0000-000000000001', current_date - 5, -125000, 'Supplies', 'Henry Schein order', 'manual', 't4'),
  ('aaaaaaaa-0000-0000-0000-000000000001', current_date - 7, 310000, 'Services', 'Implant, patient #1038', 'manual', 't5');

-- SMS registration in progress
insert into sms_registrations (workspace_id, status, business, contact, campaign, consent, submitted_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'brand_approved',
   '{"legalName":"Harbor Dental Group LLC","ein":"81-1234567","entityType":"LLC","industry":"Healthcare","website":"https://harbordental.com","hasEin":true,"address":{"line1":"214 Lake St","city":"Burlington","state":"VT","zip":"05401"}}',
   '{"name":"Maya Chen","title":"Owner","email":"maya@harbordental.com","phone":"+18025550142"}',
   '{"useCase":"CUSTOMER_CARE","description":"Review requests to patients after their visit, with opt-out.","optInFlow":"Patients opt in at the front desk on the intake form.","sampleMessages":["Hi {first}, thanks for visiting Harbor Dental today! Would you leave us a quick review? {link} Reply STOP to opt out."],"privacyUrl":"https://harbordental.com/privacy","termsUrl":"https://harbordental.com/sms-terms"}',
   '{"authorized":true,"name":"Maya Chen","title":"Owner","at":"2026-10-02T15:04:00Z","ip":"203.0.113.9","text":"I authorize ArkiTech Solutions to register Harbor Dental Group LLC for business text messaging with carriers through Twilio and to send review requests on our behalf."}',
   '2026-10-02T15:04:00Z');

-- Requests (fulfillment)
insert into requests (workspace_id, type_id, title, description, status, requested_by, created_at, updated_at)
select 'aaaaaaaa-0000-0000-0000-000000000001', (select id from request_types order by sort_order limit 1), t.title, t.descr, t.st::request_status, '22222222-2222-2222-2222-222222222221', now() - t.age, now() - t.age
from (values
  ('Invisalign landing page', 'New page for the Invisalign campaign.', 'delivered', interval '1 day'),
  ('Update holiday hours', 'Closed Nov 27-28, short day Nov 26.', 'in_progress', interval '2 days'),
  ('Need your new team photos', 'We need the new hygienist photos to finish the About page.', 'awaiting_client', interval '3 days'),
  ('Fix broken booking button', 'Button on mobile goes nowhere.', 'completed', interval '9 days')
) as t(title, descr, st, age);

-- Notifications
insert into notifications (workspace_id, user_id, kind, title, body, href, created_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001', null, 'request', 'Invisalign page is ready for review', 'Terri posted a preview link.', '/w/harbor/requests', now() - interval '1 day'),
  ('aaaaaaaa-0000-0000-0000-000000000001', null, 'review', 'New 5-star review from Alicia M.', 'Replied by ArkiTech.', '/w/harbor/google', now() - interval '2 days'),
  ('aaaaaaaa-0000-0000-0000-000000000001', null, 'billing', 'November invoice is due Nov 5', '$400.00', '/w/harbor/billing', now() - interval '3 days');

drop function seed_user(uuid, text, text);
