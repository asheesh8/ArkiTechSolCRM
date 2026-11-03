-- Fulfillment module: global request type catalog.
-- Field definitions are rendered by src/modules/fulfillment/ui/request-form.tsx.
-- field: { key, label, type: text|textarea|url|select|date|files|toggle, required?, options?, help? }

insert into public.request_types (key, name, description, icon, sla_hours, requires_approval, sort_order, fields) values
('website_change', 'Website change', 'Edit copy, swap an image, fix a link, adjust a section.', 'pencil', 48, true, 10, '[
  {"key":"page_url","label":"Which page?","type":"url","required":true,"help":"Paste the link to the page."},
  {"key":"change","label":"What should change?","type":"textarea","required":true},
  {"key":"files","label":"New images or copy","type":"files"}
]'),
('new_page', 'New page or landing page', 'A new page on your site, for a service, offer, or campaign.', 'layout', 120, true, 20, '[
  {"key":"purpose","label":"What is this page for?","type":"textarea","required":true},
  {"key":"audience","label":"Who is it for?","type":"text"},
  {"key":"cta","label":"What should a visitor do?","type":"text","help":"Call, book, fill a form, buy."},
  {"key":"reference","label":"Any page you like the look of?","type":"url"},
  {"key":"files","label":"Copy, photos, logos","type":"files"}
]'),
('gbp_update', 'Google Business Profile update', 'Hours, photos, services, posts, or a profile fix.', 'map-pin', 24, false, 30, '[
  {"key":"what","label":"What needs updating?","type":"select","required":true,"options":["Hours","Photos","Services or menu","A post or offer","Address or phone","Something else"]},
  {"key":"details","label":"Details","type":"textarea","required":true},
  {"key":"files","label":"Photos","type":"files"}
]'),
('review_response', 'Respond to a review', 'Want us to reply to a review a certain way, or flag one?', 'message-circle', 24, true, 40, '[
  {"key":"review_url","label":"Link to the review","type":"url"},
  {"key":"tone","label":"How should we respond?","type":"select","options":["Thank them warmly","Apologise and offer to fix it","Report it as fake","Let us decide"],"required":true},
  {"key":"notes","label":"Anything we should know?","type":"textarea"}
]'),
('design_asset', 'Design asset', 'A social graphic, flyer, business card, or ad creative.', 'image', 72, true, 50, '[
  {"key":"asset","label":"What do you need?","type":"text","required":true},
  {"key":"size","label":"Where will it go?","type":"select","options":["Instagram post","Instagram story","Facebook","Print","Google ad","Other"]},
  {"key":"copy","label":"Text to include","type":"textarea"},
  {"key":"files","label":"Photos or references","type":"files"}
]'),
('bug_report', 'Something is broken', 'A form, link, or page is not working.', 'alert-triangle', 24, false, 60, '[
  {"key":"page_url","label":"Where did it happen?","type":"url","required":true},
  {"key":"what","label":"What happened?","type":"textarea","required":true},
  {"key":"device","label":"Phone or computer?","type":"select","options":["Phone","Computer","Both"]},
  {"key":"files","label":"Screenshot","type":"files"}
]'),
('seo_content', 'Blog post or SEO content', 'A new article, FAQ, or service page copy written for search.', 'search', 120, true, 70, '[
  {"key":"topic","label":"Topic or keyword","type":"text","required":true},
  {"key":"angle","label":"Anything you want it to say?","type":"textarea"},
  {"key":"files","label":"Notes or source material","type":"files"}
]'),
('other', 'Something else', 'Not sure where it fits? Tell us and we will route it.', 'sparkles', 72, true, 90, '[
  {"key":"details","label":"Tell us what you need","type":"textarea","required":true},
  {"key":"files","label":"Files","type":"files"}
]')
on conflict (key) where workspace_id is null do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  sla_hours = excluded.sla_hours,
  requires_approval = excluded.requires_approval,
  sort_order = excluded.sort_order,
  fields = excluded.fields;
