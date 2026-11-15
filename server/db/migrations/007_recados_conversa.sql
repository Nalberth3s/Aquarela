-- Recados viram conversa: a família vê quando a professora leu e pode trocar respostas.
alter table teacher_messages
  add column read_at timestamptz,
  add column read_by_name text;

create table message_replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references teacher_messages(id) on delete cascade,
  author_id uuid references users(id) on delete set null,
  author_name text not null,
  from_family boolean not null,
  body text not null,
  -- Lida pelo outro lado (equipe lê as da família; família lê as da equipe).
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index message_replies_message_idx on message_replies (message_id, created_at);
