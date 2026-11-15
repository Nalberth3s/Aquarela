-- Mensagens do formulário "Fale conosco": controle de leitura pela coordenação.
alter table contact_messages add column read boolean not null default false;

-- Dados de contato/mapa usados pelo site (instalações já existentes).
update school_settings
   set info = info || jsonb_build_object(
     'contactFormWhatsapp', '5562995358008',
     'latitude', -16.6926009,
     'longitude', -49.113358,
     'mapsUrl', 'https://www.google.com/maps/search/?api=1&query=-16.6926009%2C-49.113358'
   ),
   updated_at = now()
 where id = 1;
