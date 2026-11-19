create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text not null,
  claim_token_hash text,
  reference text not null unique,
  details jsonb not null default '{}'::jsonb,
  cv_path text,
  status text not null default 'draft'
    check (status in ('draft', 'awaiting_payment', 'awaiting_email_verification', 'submitted', 'under_review', 'shortlisted', 'accepted', 'waitlisted', 'rejected')),
  created_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  paystack_reference text not null unique,
  amount_minor integer not null check (amount_minor > 0),
  currency text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  channel text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

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

create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists applications_status_idx on public.applications(status);
create unique index if not exists applications_email_uidx on public.applications(email);

alter table public.applications enable row level security;
alter table public.payments enable row level security;

create policy "Applicants can read their own application"
  on public.applications for select to authenticated
  using (auth.uid() = user_id);

create policy "Applicants can create their own application"
  on public.applications for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Applicants can update their own unpaid application"
  on public.applications for update to authenticated
  using (auth.uid() = user_id and status in ('draft', 'awaiting_payment'))
  with check (auth.uid() = user_id and status in ('draft', 'awaiting_payment'));

create policy "Applicants can read their own payments"
  on public.payments for select to authenticated
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('application-documents', 'application-documents', false, 5242880, array['application/pdf'])
on conflict (id) do update
set public = false, file_size_limit = 5242880, allowed_mime_types = array['application/pdf'];
