-- Reviewed public knowledge only. Never persist citizen narratives, identities,
-- complaint drafts, generated letters, or conversation history here.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists vector with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create schema if not exists knowledge;
create schema if not exists api;

revoke all on schema public from anon, authenticated;
revoke all on all tables in schema public from anon, authenticated;
revoke all on schema knowledge from public, anon, authenticated;
revoke all on schema api from public, anon, authenticated;

create table knowledge.sources (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null,
  publisher text not null,
  source_url text not null unique check (source_url ~ '^https://'),
  issued_at date,
  effective_from date,
  effective_to date,
  last_verified_at timestamptz not null,
  checksum_sha256 text check (checksum_sha256 is null or checksum_sha256 ~ '^[0-9a-f]{64}$'),
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  reviewer_role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_from is null or effective_to >= effective_from)
);

create table knowledge.documents (
  id uuid primary key default extensions.gen_random_uuid(),
  source_id uuid not null references knowledge.sources(id) on delete restrict,
  title text not null,
  document_type text not null,
  jurisdiction text not null default 'TH',
  effective_from date,
  effective_to date,
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_from is null or effective_to >= effective_from)
);

create table knowledge.document_sections (
  id bigint generated always as identity primary key,
  document_id uuid not null references knowledge.documents(id) on delete cascade,
  section_ref text,
  content text not null check (char_length(content) between 1 and 20000),
  fts tsvector generated always as (to_tsvector('simple', coalesce(content, ''))) stored,
  embedding extensions.vector(1536),
  embedding_model text,
  created_at timestamptz not null default now()
);

create index document_sections_fts_idx on knowledge.document_sections using gin (fts);
create index document_sections_trgm_idx on knowledge.document_sections using gin (content extensions.gin_trgm_ops);
create index document_sections_embedding_idx on knowledge.document_sections
  using hnsw (embedding extensions.vector_cosine_ops) where embedding is not null;

create table knowledge.rights (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_th text not null,
  plain_summary_th text not null,
  caution_th text,
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  effective_from date,
  effective_to date,
  last_verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_from is null or effective_to >= effective_from)
);

create table knowledge.right_sources (
  right_id uuid not null references knowledge.rights(id) on delete cascade,
  source_id uuid not null references knowledge.sources(id) on delete restrict,
  citation_label text,
  primary key (right_id, source_id)
);

create table knowledge.complaint_types (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_th text not null,
  description_th text not null,
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  last_verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table knowledge.agencies (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_th text not null,
  summary_th text not null,
  can_do_th text not null,
  cannot_do_th text not null,
  scope_nationwide boolean not null default true,
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  effective_from date,
  effective_to date,
  last_verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_from is null or effective_to >= effective_from)
);

create table knowledge.agency_channels (
  id uuid primary key default extensions.gen_random_uuid(),
  agency_id uuid not null references knowledge.agencies(id) on delete cascade,
  channel_type text not null check (channel_type in ('website', 'phone', 'email', 'postal', 'in_person')),
  label_th text not null,
  value text not null,
  source_id uuid not null references knowledge.sources(id) on delete restrict,
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  effective_from date,
  effective_to date,
  last_verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_from is null or effective_to >= effective_from)
);

create table knowledge.agency_complaint_types (
  agency_id uuid not null references knowledge.agencies(id) on delete cascade,
  complaint_type_id uuid not null references knowledge.complaint_types(id) on delete cascade,
  primary key (agency_id, complaint_type_id)
);

create table knowledge.routing_rules (
  id uuid primary key default extensions.gen_random_uuid(),
  rule_code text not null unique,
  complaint_type_id uuid not null references knowledge.complaint_types(id) on delete restrict,
  agency_id uuid not null references knowledge.agencies(id) on delete restrict,
  conditions jsonb not null default '{}'::jsonb check (jsonb_typeof(conditions) = 'object'),
  priority smallint not null default 100 check (priority between 1 and 1000),
  reason_plain_th text not null,
  can_do_th text not null,
  cannot_do_th text not null,
  source_id uuid not null references knowledge.sources(id) on delete restrict,
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  effective_from date,
  effective_to date,
  last_verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_from is null or effective_to >= effective_from)
);

create index routing_rules_complaint_type_priority_idx on knowledge.routing_rules (complaint_type_id, priority);
create index routing_rules_conditions_idx on knowledge.routing_rules using gin (conditions);

create table knowledge.risk_rules (
  id uuid primary key default extensions.gen_random_uuid(),
  rule_code text not null unique,
  complaint_type_id uuid references knowledge.complaint_types(id) on delete restrict,
  risk_category text not null check (risk_category in ('safety', 'privacy', 'retaliation', 'allegation', 'time', 'evidence')),
  conditions jsonb not null default '{}'::jsonb check (jsonb_typeof(conditions) = 'object'),
  severity text not null check (severity in ('low', 'caution', 'seek_help_first')),
  explanation_th text not null,
  mitigation_th text not null,
  source_id uuid references knowledge.sources(id) on delete restrict,
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  effective_from date,
  effective_to date,
  last_verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_from is null or effective_to >= effective_from)
);

create table knowledge.evidence_requirements (
  id uuid primary key default extensions.gen_random_uuid(),
  complaint_type_id uuid not null references knowledge.complaint_types(id) on delete cascade,
  label_th text not null,
  guidance_th text not null,
  required_level text not null check (required_level in ('helpful', 'recommended', 'required_if_available')),
  display_order smallint not null default 100,
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  last_verified_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table knowledge.document_templates (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_th text not null,
  complaint_type_id uuid references knowledge.complaint_types(id) on delete restrict,
  agency_id uuid references knowledge.agencies(id) on delete restrict,
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table knowledge.template_versions (
  id uuid primary key default extensions.gen_random_uuid(),
  template_id uuid not null references knowledge.document_templates(id) on delete cascade,
  version integer not null check (version > 0),
  body_markdown text not null,
  variables jsonb not null default '[]'::jsonb check (jsonb_typeof(variables) = 'array'),
  review_status text not null default 'draft'
    check (review_status in ('draft', 'reviewed', 'published', 'retired')),
  source_id uuid references knowledge.sources(id) on delete restrict,
  last_verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (template_id, version)
);

create table knowledge.review_events (
  id bigint generated always as identity primary key,
  entity_type text not null,
  entity_id uuid not null,
  action text not null check (action in ('submitted', 'approved', 'rejected', 'published', 'retired')),
  reviewer_role text not null,
  note text,
  created_at timestamptz not null default now()
);

create table knowledge.ingestion_jobs (
  id uuid primary key default extensions.gen_random_uuid(),
  source_id uuid references knowledge.sources(id) on delete restrict,
  status text not null check (status in ('queued', 'running', 'succeeded', 'failed')),
  item_count integer not null default 0 check (item_count >= 0),
  error_code text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

alter table knowledge.sources enable row level security;
alter table knowledge.documents enable row level security;
alter table knowledge.document_sections enable row level security;
alter table knowledge.rights enable row level security;
alter table knowledge.right_sources enable row level security;
alter table knowledge.complaint_types enable row level security;
alter table knowledge.agencies enable row level security;
alter table knowledge.agency_channels enable row level security;
alter table knowledge.agency_complaint_types enable row level security;
alter table knowledge.routing_rules enable row level security;
alter table knowledge.risk_rules enable row level security;
alter table knowledge.evidence_requirements enable row level security;
alter table knowledge.document_templates enable row level security;
alter table knowledge.template_versions enable row level security;
alter table knowledge.review_events enable row level security;
alter table knowledge.ingestion_jobs enable row level security;

create policy sources_published_read on knowledge.sources for select to anon using (
  review_status = 'published'
  and (effective_from is null or effective_from <= current_date)
  and (effective_to is null or effective_to >= current_date)
);
create policy documents_published_read on knowledge.documents for select to anon using (
  review_status = 'published'
  and (effective_from is null or effective_from <= current_date)
  and (effective_to is null or effective_to >= current_date)
  and exists (select 1 from knowledge.sources s where s.id = source_id and s.review_status = 'published')
);
create policy document_sections_published_read on knowledge.document_sections for select to anon using (
  exists (select 1 from knowledge.documents d where d.id = document_id and d.review_status = 'published')
);
create policy rights_published_read on knowledge.rights for select to anon using (
  review_status = 'published'
  and (effective_from is null or effective_from <= current_date)
  and (effective_to is null or effective_to >= current_date)
);
create policy right_sources_published_read on knowledge.right_sources for select to anon using (
  exists (select 1 from knowledge.rights r where r.id = right_id and r.review_status = 'published')
  and exists (select 1 from knowledge.sources s where s.id = source_id and s.review_status = 'published')
);
create policy complaint_types_published_read on knowledge.complaint_types for select to anon using (review_status = 'published');
create policy agencies_published_read on knowledge.agencies for select to anon using (
  review_status = 'published'
  and (effective_from is null or effective_from <= current_date)
  and (effective_to is null or effective_to >= current_date)
);
create policy agency_channels_published_read on knowledge.agency_channels for select to anon using (
  review_status = 'published'
  and (effective_from is null or effective_from <= current_date)
  and (effective_to is null or effective_to >= current_date)
  and exists (select 1 from knowledge.agencies a where a.id = agency_id and a.review_status = 'published')
);
create policy agency_complaint_types_published_read on knowledge.agency_complaint_types for select to anon using (
  exists (select 1 from knowledge.agencies a where a.id = agency_id and a.review_status = 'published')
  and exists (select 1 from knowledge.complaint_types c where c.id = complaint_type_id and c.review_status = 'published')
);
create policy routing_rules_published_read on knowledge.routing_rules for select to anon using (
  review_status = 'published'
  and (effective_from is null or effective_from <= current_date)
  and (effective_to is null or effective_to >= current_date)
);
create policy risk_rules_published_read on knowledge.risk_rules for select to anon using (
  review_status = 'published'
  and (effective_from is null or effective_from <= current_date)
  and (effective_to is null or effective_to >= current_date)
);
create policy evidence_requirements_published_read on knowledge.evidence_requirements for select to anon using (review_status = 'published');
create policy document_templates_published_read on knowledge.document_templates for select to anon using (review_status = 'published');
create policy template_versions_published_read on knowledge.template_versions for select to anon using (
  review_status = 'published'
  and exists (select 1 from knowledge.document_templates t where t.id = template_id and t.review_status = 'published')
);

grant usage on schema knowledge, api to anon;
grant select on knowledge.sources, knowledge.documents, knowledge.document_sections,
  knowledge.rights, knowledge.right_sources, knowledge.complaint_types,
  knowledge.agencies, knowledge.agency_channels, knowledge.agency_complaint_types,
  knowledge.routing_rules, knowledge.risk_rules, knowledge.evidence_requirements,
  knowledge.document_templates, knowledge.template_versions to anon;

create view api.published_agencies with (security_invoker = true) as
select a.id, a.slug, a.name_th, a.summary_th, a.can_do_th, a.cannot_do_th,
  a.scope_nationwide,
  coalesce((select array_agg(c.slug order by c.slug)
    from knowledge.agency_complaint_types act
    join knowledge.complaint_types c on c.id = act.complaint_type_id
    where act.agency_id = a.id), array[]::text[]) as complaint_type_slugs,
  coalesce((select jsonb_agg(jsonb_build_object(
      'type', ch.channel_type,
      'label_th', ch.label_th,
      'value', ch.value,
      'last_verified_at', ch.last_verified_at
    ) order by ch.channel_type, ch.label_th)
    from knowledge.agency_channels ch where ch.agency_id = a.id), '[]'::jsonb) as channels,
  a.last_verified_at
from knowledge.agencies a;

create view api.published_rights with (security_invoker = true) as
select r.id, r.slug, r.name_th, r.plain_summary_th, r.caution_th, r.last_verified_at,
  coalesce((select jsonb_agg(jsonb_build_object(
      'title', s.title,
      'publisher', s.publisher,
      'url', s.source_url,
      'citation_label', rs.citation_label,
      'last_verified_at', s.last_verified_at
    ) order by s.title)
    from knowledge.right_sources rs
    join knowledge.sources s on s.id = rs.source_id
    where rs.right_id = r.id), '[]'::jsonb) as sources
from knowledge.rights r;

create view api.published_routing_rules with (security_invoker = true) as
select rr.id, rr.rule_code, ct.slug as complaint_type_slug, a.slug as agency_slug,
  rr.conditions, rr.priority, rr.reason_plain_th, rr.can_do_th, rr.cannot_do_th,
  s.source_url, rr.last_verified_at
from knowledge.routing_rules rr
join knowledge.complaint_types ct on ct.id = rr.complaint_type_id
join knowledge.agencies a on a.id = rr.agency_id
join knowledge.sources s on s.id = rr.source_id;

create view api.published_risk_rules with (security_invoker = true) as
select rr.id, rr.rule_code, ct.slug as complaint_type_slug, rr.risk_category,
  rr.conditions, rr.severity, rr.explanation_th, rr.mitigation_th, rr.last_verified_at
from knowledge.risk_rules rr
left join knowledge.complaint_types ct on ct.id = rr.complaint_type_id;

create function api.search_knowledge(
  query_text text,
  query_embedding extensions.vector(1536) default null,
  match_count integer default 8
)
returns table (
  section_id bigint,
  document_title text,
  section_ref text,
  excerpt text,
  source_title text,
  publisher text,
  source_url text,
  last_verified_at timestamptz,
  score real
)
language sql stable security invoker set search_path = '' as $$
  select ds.id, d.title, ds.section_ref,
    left(regexp_replace(ds.content, '\s+', ' ', 'g'), 1200),
    s.title, s.publisher, s.source_url, s.last_verified_at,
    (greatest(
      ts_rank_cd(ds.fts, websearch_to_tsquery('simple', query_text)),
      extensions.similarity(ds.content, query_text)
    ) * 0.45 + case
      when query_embedding is null or ds.embedding is null then 0
      else (1 / (1 + (ds.embedding operator(extensions.<=>) query_embedding))) * 0.55
    end)::real as score
  from knowledge.document_sections ds
  join knowledge.documents d on d.id = ds.document_id
  join knowledge.sources s on s.id = d.source_id
  where char_length(btrim(query_text)) between 2 and 300
  order by score desc, ds.id
  limit least(greatest(match_count, 1), 20);
$$;

grant select on api.published_agencies, api.published_rights,
  api.published_routing_rules, api.published_risk_rules to anon;
grant execute on function api.search_knowledge(text, extensions.vector, integer) to anon;

revoke all on all tables in schema knowledge from authenticated;
revoke all on all tables in schema api from authenticated;
revoke all on all functions in schema api from authenticated;
alter default privileges for role postgres in schema knowledge revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema api revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema api revoke execute on functions from public, anon, authenticated;

comment on schema knowledge is 'Reviewed public legal knowledge only; never citizen-submitted content.';
comment on schema api is 'Explicit read-only Data API surface for published knowledge.';
comment on table knowledge.review_events is 'Editorial audit trail; contains staff roles, never citizen data.';
