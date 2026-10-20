-- Restringe denúncias duplicadas: uma pessoa só pode denunciar o mesmo anúncio uma única vez (Issue #112)
alter table public.v2_reports
  add constraint v2_reports_reporter_listing_key unique (reporter_id, listing_id);
