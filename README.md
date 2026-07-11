# CRM2 Skillz & Drillz

Responsive marketing site, first-session booking flow, member scheduling portal, deposit reminders, and Venmo merch checkout for CRM2 GROUND UP LLC.

## Run locally

```bash
npm install
npm run dev
```

Without environment variables the site runs in demo mode. Use `demo@crm2.com` and `trainhard` on the member login screen.

## Connect the free backend

1. Create a Supabase project on the free plan.
2. Run `supabase/schema.sql` in its SQL editor.
3. Copy `.env.example` to `.env` and add the project URL and anonymous key.
4. Deploy the two functions in `supabase/functions`.
5. Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` as Supabase Edge Function secrets. Resend requires a verified sending domain for production email.
6. Create existing-customer accounts through Supabase Authentication, then add matching rows to `profiles`.
7. Add or close dates in the `training_slots` table. The public booking page and member portal read from that table automatically.

The Venmo buttons open Courtney Marshall's Venmo profile with the amount and order or booking note pre-filled. Venmo profile links do not return payment status, so staff should mark deposits received in the `bookings` table after verifying payment.

## Production build

```bash
npm run build
```

## Publish with GitHub Pages

This project includes a GitHub Actions workflow that builds and publishes the site from `main`.

Use `digitalcr8tive/digitalcr8tive.github.io` for the cleanest public URL, or any other repository name for a project Pages URL. The Vite base path is detected automatically in GitHub Actions, and `404.html` is generated so direct links like `/about`, `/training`, and `/signup` continue to work on GitHub Pages.
