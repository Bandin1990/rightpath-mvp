-- Editorial emergency guidance. This schema stores reviewed public knowledge and
-- staff authentication metadata only. It never stores citizen narratives, audio,
-- generated letters, contact details, or complaint answers.

create table knowledge.emergency_contacts (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  name_th text not null check (char_length(name_th) between 2 and 160),
  helps_with_th text not null check (char_length(helps_with_th) between 10 and 1000),
  source_label_th text not null,
  source_url text not null check (source_url ~ '^https://'),
  sort_order smallint not null default 100 check (sort_order between 1 and 1000),
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  last_verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table knowledge.emergency_contact_channels (
  id uuid primary key default extensions.gen_random_uuid(),
  contact_id text not null references knowledge.emergency_contacts(id) on delete cascade,
  label_th text not null check (char_length(label_th) between 2 and 120),
  detail_th text,
  href text check (href is null or href ~ '^(https://|tel:|mailto:)'),
  urgent boolean not null default false,
  sort_order smallint not null default 100 check (sort_order between 1 and 1000),
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  last_verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table knowledge.emergency_threat_groups (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  title_th text not null check (char_length(title_th) between 2 and 160),
  description_th text not null check (char_length(description_th) between 10 and 800),
  sort_order smallint not null default 100 check (sort_order between 1 and 1000),
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  last_verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table knowledge.emergency_threats (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  group_id text not null references knowledge.emergency_threat_groups(id) on delete restrict,
  label_th text not null check (char_length(label_th) between 5 and 500),
  detail_th text not null check (char_length(detail_th) between 5 and 1000),
  contact_ids text[] not null check (cardinality(contact_ids) between 1 and 10),
  sort_order smallint not null default 100 check (sort_order between 1 and 1000),
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  last_verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index emergency_threats_group_order_idx
  on knowledge.emergency_threats (group_id, sort_order);
create index emergency_threats_contact_ids_idx
  on knowledge.emergency_threats using gin (contact_ids);

create table knowledge.emergency_threat_keywords (
  id bigint generated always as identity primary key,
  threat_id text not null references knowledge.emergency_threats(id) on delete cascade,
  keyword_th text not null check (char_length(keyword_th) between 2 and 120),
  weight smallint not null default 5 check (weight between 1 and 10),
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (threat_id, keyword_th)
);

alter table knowledge.emergency_contacts enable row level security;
alter table knowledge.emergency_contact_channels enable row level security;
alter table knowledge.emergency_threat_groups enable row level security;
alter table knowledge.emergency_threats enable row level security;
alter table knowledge.emergency_threat_keywords enable row level security;

create policy emergency_contacts_published_read on knowledge.emergency_contacts
  for select to anon using (review_status = 'published');
create policy emergency_contact_channels_published_read on knowledge.emergency_contact_channels
  for select to anon using (
    review_status = 'published'
    and exists (
      select 1 from knowledge.emergency_contacts c
      where c.id = contact_id and c.review_status = 'published'
    )
  );
create policy emergency_threat_groups_published_read on knowledge.emergency_threat_groups
  for select to anon using (review_status = 'published');
create policy emergency_threats_published_read on knowledge.emergency_threats
  for select to anon using (
    review_status = 'published'
    and exists (
      select 1 from knowledge.emergency_threat_groups g
      where g.id = group_id and g.review_status = 'published'
    )
  );
create policy emergency_threat_keywords_published_read on knowledge.emergency_threat_keywords
  for select to anon using (
    review_status = 'published'
    and exists (
      select 1 from knowledge.emergency_threats t
      where t.id = threat_id and t.review_status = 'published'
    )
  );

-- Authorization comes only from immutable app_metadata set by a project owner.
-- Never use user_metadata for staff roles because users can edit it themselves.
create policy emergency_contacts_staff_all on knowledge.emergency_contacts
  for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('editor', 'reviewer', 'publisher', 'admin'))
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('editor', 'reviewer', 'publisher', 'admin'));
create policy emergency_contact_channels_staff_all on knowledge.emergency_contact_channels
  for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('editor', 'reviewer', 'publisher', 'admin'))
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('editor', 'reviewer', 'publisher', 'admin'));
create policy emergency_threat_groups_staff_all on knowledge.emergency_threat_groups
  for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('editor', 'reviewer', 'publisher', 'admin'))
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('editor', 'reviewer', 'publisher', 'admin'));
create policy emergency_threats_staff_all on knowledge.emergency_threats
  for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('editor', 'reviewer', 'publisher', 'admin'))
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('editor', 'reviewer', 'publisher', 'admin'));
create policy emergency_threat_keywords_staff_all on knowledge.emergency_threat_keywords
  for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('editor', 'reviewer', 'publisher', 'admin'))
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('editor', 'reviewer', 'publisher', 'admin'));

grant usage on schema knowledge, api to anon, authenticated;
grant select on knowledge.emergency_contacts, knowledge.emergency_contact_channels,
  knowledge.emergency_threat_groups, knowledge.emergency_threats,
  knowledge.emergency_threat_keywords to anon;
grant select, insert, update, delete on knowledge.emergency_contacts,
  knowledge.emergency_contact_channels, knowledge.emergency_threat_groups,
  knowledge.emergency_threats, knowledge.emergency_threat_keywords to authenticated;
grant usage, select on sequence knowledge.emergency_threat_keywords_id_seq to authenticated;

create view api.published_emergency_contacts with (security_invoker = true) as
select c.id, c.name_th, c.helps_with_th, c.source_label_th, c.source_url,
  c.sort_order, c.last_verified_at,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'label', ch.label_th,
      'detail', ch.detail_th,
      'href', ch.href,
      'urgent', ch.urgent
    ) order by ch.sort_order, ch.label_th)
    from knowledge.emergency_contact_channels ch
    where ch.contact_id = c.id
  ), '[]'::jsonb) as channels
from knowledge.emergency_contacts c;

create view api.published_emergency_threat_groups with (security_invoker = true) as
select id, title_th, description_th, sort_order, last_verified_at
from knowledge.emergency_threat_groups;

create view api.published_emergency_threats with (security_invoker = true) as
select id, group_id, label_th, detail_th, contact_ids, sort_order, last_verified_at
from knowledge.emergency_threats;

create view api.published_emergency_threat_keywords with (security_invoker = true) as
select threat_id, keyword_th, weight
from knowledge.emergency_threat_keywords;

grant select on api.published_emergency_contacts,
  api.published_emergency_threat_groups,
  api.published_emergency_threats,
  api.published_emergency_threat_keywords to anon, authenticated;

comment on table knowledge.emergency_threat_keywords is
  'Reviewed deterministic matching vocabulary; never contains citizen-submitted text.';
