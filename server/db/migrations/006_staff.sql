-- Ficha das funcionárias (professoras e coordenação): contato, documentos e acompanhamento.
alter table users
  add column phone text,
  add column cpf text,
  add column birth_date date,
  add column job_title text,
  add column hire_date date,
  add column address text,
  add column emergency_contact text,
  add column staff_notes text not null default '',
  add column last_login_at timestamptz;

-- CPF guardado só com dígitos; também serve de login alternativo ao e-mail.
create unique index users_cpf_idx on users (cpf) where cpf is not null;
