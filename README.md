# CRM2 Skillz & Drillz

Responsive marketing site, first-session booking flow, member scheduling portal, deposit reminders, and Venmo merch checkout for CRM2 GROUND UP LLC.

## Run locally

```bash
npm install
npm run dev
```

The local development server runs in demo mode without environment variables. Production builds disable bookings until the backend is connected; they never claim to send emails in demo mode. Use `demo@crm2.com` and `trainhard` on the member login screen.

## Connect the free backend

1. Create a Supabase project on the free plan.
2. Run `supabase/schema.sql` in its SQL editor.
3. Copy `.env.example` to `.env` and add the project URL and anonymous key.
4. For an existing project, apply `supabase/migrations/202610070001_booking_email_notifications.sql` before deploying the updated functions. New projects get the column from `schema.sql`.
5. Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` as Supabase Edge Function secrets. Use a Resend-verified sending domain, for example `CRM2 Skillz & Drillz <bookings@crm2skillzdrillz.com>` after verifying that domain. The Gmail address is the owner recipient and customer reply-to, not an authenticated domain sender.
6. Deploy `create-booking` and `member-booking`, including their shared module in `supabase/functions/_shared`. Both paths send separate customer and owner emails. The owner recipient is `crm2skillzanddrillz@gmail.com`.
7. In GitHub repository settings, set Actions variable `VITE_SUPABASE_URL` (or a secret with the same name) and Actions secret `VITE_SUPABASE_ANON_KEY` to the project's browser-safe URL/key. Never use the service-role key or Resend key for a `VITE_` variable. Run the Pages deployment again; these settings are compiled into the frontend.
8. Create existing-customer accounts through Supabase Authentication, then add matching rows to `profiles`.
9. Add or close dates in the `training_slots` table. The public booking page and member portal read from that table automatically.

Booking request emails include the database session date in Little Rock/Central time, parent/guardian, age/grade, athlete count, and booking reference. The owner email also includes phone, email, and notes. Request emails explicitly say the deposit is pending. Missing email configuration prevents new reservations. Provider failures after saving return separate recipient statuses and remain visible in `bookings.email_notifications` and Edge Function logs. An `accepted` status means Resend accepted the message; verify `delivered` in Resend and receipt in the inbox before declaring delivery working. Resend idempotency keys prevent repeated sends with the same booking/recipient within the provider's idempotency window.

After configuration, submit an identified test request using an owner-controlled customer email and an actual staff-approved test slot. Check the saved booking, both email statuses, both Resend events, and both inboxes. Do not pay the test deposit. Do not resubmit a saved booking just because an email failed.

The Venmo buttons open Courtney Marshall's Venmo profile with the amount and order or booking note pre-filled. Venmo profile links do not return payment status, so staff should mark deposits received in the `bookings` table after verifying payment.

## Production build

```bash
npm run build
```

## Publish with GitHub Pages

This project includes a GitHub Actions workflow that builds and publishes the site from `main`.

Use `digitalcr8tive/digitalcr8tive.github.io` for the cleanest public URL, or any other repository name for a project Pages URL. The Vite base path is detected automatically in GitHub Actions, and `404.html` is generated so direct links like `/about`, `/training`, and `/signup` continue to work on GitHub Pages.

## Verify booking email logic locally

```bash
node scripts/test-booking-emails.mjs
npm run build:pages
```

The email tests mock the database and provider and send no real emails. Production delivery still requires the live setup and inbox checks above.
