-- ============================================================
-- Aquarela do Saber — esquema inicial
-- ============================================================
create extension if not exists pgcrypto;

-- ---------- Acesso ----------
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'teacher', 'guardian')),
  active boolean not null default true,
  must_change_password boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Escola (conteúdo do site) ----------
create table school_settings (
  id smallint primary key default 1 check (id = 1),
  info jsonb not null,
  updated_at timestamptz not null default now()
);

-- Blocos de conteúdo institucional editáveis (segmentos, atividades, FAQ, galeria...)
create table site_content (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  bio text,
  photo_url text,
  tone text not null default 'aqua',
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Turmas e alunos ----------
create table classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  segment_id text not null check (segment_id in ('bercario', 'maternal', 'jardim')),
  segment_name text not null,
  shift text not null check (shift in ('manha', 'tarde', 'integral')),
  room text not null default '',
  capacity int not null default 15 check (capacity > 0),
  tone text not null default 'aqua',
  teacher_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  birth_date date not null,
  class_id uuid references classes(id) on delete set null,
  shift text not null check (shift in ('manha', 'tarde', 'integral')),
  status text not null default 'ativo' check (status in ('ativo', 'em_adaptacao', 'inativo')),
  enrolled_at date not null default current_date,
  photo_url text,
  allergies text[] not null default '{}',
  dietary_restrictions text[] not null default '{}',
  health_notes text,
  authorized_pickup text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index students_class_idx on students (class_id);

create table guardians (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  name text not null,
  relationship text not null,
  phone text not null,
  email text,
  user_id uuid references users(id) on delete set null,
  sort_order int not null default 0
);
create index guardians_student_idx on guardians (student_id);
create index guardians_user_idx on guardians (user_id);

-- ---------- Diário de Bordo e chamada ----------
create table daily_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  date date not null,
  author_id uuid references users(id) on delete set null,
  author_name text not null,
  status text not null check (status in ('rascunho', 'enviado')),
  participation text,
  interaction text,
  meals text,
  rest text,
  rest_minutes int,
  day_note text not null default '',
  internal_note text,
  activity jsonb,
  mood jsonb,
  photos jsonb not null default '[]',
  read_by_guardian boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (student_id, date)
);

create table roll_calls (
  date date not null,
  student_id uuid not null references students(id) on delete cascade,
  present boolean not null,
  recorded_by uuid references users(id) on delete set null,
  primary key (date, student_id)
);

-- ---------- Acompanhamento pedagógico ----------
create table development_reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  period text not null,
  author_name text not null,
  status text not null check (status in ('rascunho', 'publicado')),
  summary text not null default '',
  assessments jsonb not null default '[]',
  highlights text[] not null default '{}',
  next_steps text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table observations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  date date not null default current_date,
  author_name text not null,
  kind text not null check (kind in ('conquista', 'rotina', 'atencao')),
  field text,
  text text not null
);

create table milestones (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  month text not null,
  status text not null check (status in ('concluido', 'em_andamento')),
  title text not null,
  description text not null,
  sort_order int not null default 0
);

-- ---------- Comunicação ----------
create table notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  date date not null default current_date,
  author_name text not null,
  category text not null check (category in ('aviso', 'evento', 'cardapio', 'pedagogico')),
  class_id uuid references classes(id) on delete cascade,
  pinned boolean not null default false,
  rsvp jsonb,
  attachment_name text,
  created_at timestamptz not null default now()
);

create table notice_rsvps (
  notice_id uuid not null references notices(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  primary key (notice_id, user_id)
);

create table teacher_messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  from_user_id uuid references users(id) on delete set null,
  subject text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Calendário público ----------
create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  date date not null,
  end_date date,
  time text,
  location text,
  summary text not null,
  description text not null default '',
  what_to_bring text[] not null default '{}',
  audience text,
  image_url text,
  featured boolean not null default false,
  published boolean not null default true,
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= date)
);
create index calendar_events_date_idx on calendar_events (date);

-- ---------- Site: contatos e pré-matrículas ----------
create table enrollment_requests (
  id uuid primary key default gen_random_uuid(),
  guardian_name text not null,
  email text not null,
  phone text not null,
  child_name text not null,
  child_birth_date date not null,
  preferred_shift text not null,
  how_did_you_hear text,
  message text,
  wants_visit boolean not null default false,
  suggested_segment text not null,
  status text not null default 'novo'
    check (status in ('novo', 'em_contato', 'visita_agendada', 'matriculado', 'arquivado')),
  created_at timestamptz not null default now()
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  protocol text not null,
  created_at timestamptz not null default now()
);
