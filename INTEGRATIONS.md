# Supabase and Paystack setup

## Supabase

1. Create a Supabase project. For a new database, run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL editor. If you already ran the previous schema, run [`supabase/migrations/20261119_defer_email_verification.sql`](./supabase/migrations/20261119_defer_email_verification.sql) instead.
2. Set the Site URL in Authentication settings and add `{SITE_URL}/auth/callback` to the allowed redirect URLs. Also add your local development callback (for example, `http://localhost:3000/auth/callback`) while testing locally.
3. Enable Google under **Authentication → Providers**. Create a Google OAuth client and set its authorized redirect URI to `https://<project-ref>.supabase.co/auth/v1/callback`. Enter the Google client ID and secret in Supabase's Google provider settings. See the [Supabase Google sign-in guide](https://supabase.com/docs/guides/auth/social-login/auth-google).
4. Applicant sign-in and account creation use Google only. Google provides the applicant's name and verified email; the application form collects their phone number. Staff sign-in remains email/password, so keep the email provider enabled for staff accounts.
5. Custom SMTP is not required for Google sign-in. Configure it if you need Supabase Auth emails such as password recovery or legacy email-confirmation flows; Supabase's default mailer is testing-only and may restrict delivery to project team addresses. See the [Supabase SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp).
6. Copy `.env.example` to `.env.local` and set the project URL, anon key, and service-role key. Keep the service-role key server-only; never prefix it with `NEXT_PUBLIC_`.
7. The private `application-documents` storage bucket is created by the schema. CV uploads are handled server-side and are not publicly readable.

## Paystack

1. Set `PAYSTACK_SECRET_KEY` to the secret key for the intended Paystack environment. Use the test secret key until your checkout has been tested.
2. Set `PAYSTACK_AMOUNT_MINOR` to the fee in the smallest currency unit (`2000` means 20.00) and `PAYSTACK_CURRENCY` to a currency enabled for your Paystack account. The interface currently advertises USD $20; verify that your Paystack account supports USD before going live.
3. Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin of the deployed app.
4. Add `{SITE_URL}/api/payments/webhook` in Paystack dashboard webhook settings.

Checkout is hosted by Paystack; card data is never collected by this app. The return URL and signed webhook both verify the transaction with Paystack. A verified applicant completes and reviews their application from the dashboard, then proceeds to payment. The application is linked to the signed-in Supabase user and is submitted for review only after payment is confirmed. Do not treat a browser redirect alone as proof of payment.

## Staff access

Staff must sign in using a Supabase Auth account whose `app_metadata.role` is `admin`. Assign that claim from a trusted server/admin workflow in Supabase; it must not be set from user-editable metadata. The admin API returns real stored applications only to that role.
