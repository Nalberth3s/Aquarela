-- Busca por nome ignorando acentos e maiúsculas ("Cecilia" encontra "Cecília").
create extension if not exists unaccent;

create or replace function unaccent_lower(text) returns text
  language sql immutable parallel safe
  as $$ select lower(public.unaccent('public.unaccent'::regdictionary, $1)) $$;

create index students_name_search_idx on students (unaccent_lower(name));
