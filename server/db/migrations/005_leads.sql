-- ============================================================
-- Interessados: mini perfil de cada pessoa que entrou em contato
-- pelo site (formulário de contato ou pré-matrícula).
-- ============================================================
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  -- Telefone só com dígitos (sem DDI 55), usado para reconhecer a mesma pessoa.
  phone_digits text not null default '',
  status text not null default 'novo'
    check (status in ('novo', 'em_contato', 'visita_agendada', 'matriculado', 'arquivado')),
  notes text not null default '',
  first_source text not null check (first_source in ('contato', 'pre_matricula')),
  created_at timestamptz not null default now(),
  last_contact_at timestamptz not null default now()
);
create index leads_email_idx on leads (lower(email));
create index leads_phone_idx on leads (phone_digits);

alter table contact_messages add column lead_id uuid references leads(id) on delete set null;
alter table enrollment_requests add column lead_id uuid references leads(id) on delete set null;

create or replace function phone_digits(text) returns text
  language sql immutable
  as $$ select regexp_replace(regexp_replace(coalesce($1, ''), '\D', '', 'g'), '^55(\d{10,11})$', '\1') $$;

-- Mensagens já recebidas viram interessados (uma pessoa por e-mail).
insert into leads (name, email, phone, phone_digits, first_source, created_at, last_contact_at)
select distinct on (lower(email)) name, email, phone, phone_digits(phone), 'contato',
       min(created_at) over (partition by lower(email)), max(created_at) over (partition by lower(email))
  from contact_messages
 order by lower(email), created_at desc;

update contact_messages m set lead_id = l.id from leads l where lower(l.email) = lower(m.email);

insert into leads (name, email, phone, phone_digits, first_source, created_at, last_contact_at)
select distinct on (lower(e.email)) e.guardian_name, e.email, e.phone, phone_digits(e.phone), 'pre_matricula', e.created_at, e.created_at
  from enrollment_requests e
 where not exists (select 1 from leads l where lower(l.email) = lower(e.email))
 order by lower(e.email), e.created_at desc;

update enrollment_requests r set lead_id = l.id from leads l where lower(l.email) = lower(r.email);
