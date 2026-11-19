alter table public.applications alter column user_id drop not null;
alter table public.applications add column if not exists email text;
alter table public.applications add column if not exists claim_token_hash text;

update public.applications
set email = lower(details->>'email')
where email is null and details->>'email' is not null;

alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check
  check (status in ('draft', 'awaiting_payment', 'awaiting_email_verification', 'submitted', 'under_review', 'shortlisted', 'accepted', 'waitlisted', 'rejected'));

alter table public.payments alter column user_id drop not null;

create unique index if not exists applications_email_uidx on public.applications(email);
