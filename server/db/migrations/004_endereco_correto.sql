-- Endereço conforme o Google Maps (confirmado pela escola em 26/09/2026).
update school_settings
   set info = info || jsonb_build_object(
     'address', 'Rua Carlos Gomes, Qd. 13, Lt. 17, Casa 2',
     'neighborhood', 'Residencial Jardim Canedo I',
     'zipCode', '75250-220'
   ),
   updated_at = now()
 where id = 1;
