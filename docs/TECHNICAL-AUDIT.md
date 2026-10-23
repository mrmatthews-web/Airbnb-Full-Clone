# Eat In source audit — 23 October 2026

Scope: static inspection of the checked-out upstream code, dependency installation/build checks and the Eat In demonstration changes. This is not a penetration test or a production certification.

## What is actually present

- Frontend: Next.js **16.1.4** and React **19.2.3**, rather than the Next.js 15 described in the upstream README. The original homepage renders Spanish accommodation mock data. UI components, hooks and an API client exist, but a complete account/checkout flow is absent from the original homepage.
- Backend: one NestJS API application with feature modules. Docker lists PostgreSQL, Redis and RabbitMQ, but the checked-in Prisma schema uses **SQLite**. It is not necessary to run three infrastructure services for this prototype.
- Authentication hashes passwords with bcrypt and signs expiring JWTs. DTO validation and ownership checks exist in many services. It has no terms acceptance record, verified cook onboarding, dual-role account model, password recovery or rate-limit setup in the inspected bootstrap.
- Bookings calculate nightly property prices. Availability checks are read-then-create without transaction protection; simultaneous requests can both pass. Booking confirmation does not depend on settled payment. There is no service-completion action for the original review lifecycle.
- Reviews allow only a customer's property review, with one review per booking. Host deletion of customer reviews is allowed. This does not meet Eat In's two-way review and dispute-evidence requirements.
- Root MIT notice is preserved. The nested API package declares `UNLICENSED`, an inconsistent package metadata label. Bundled Airbnb fonts/videos have no separate provenance established by this audit. Eat In no longer references them; review/remove unused branded assets before distribution.
- The upstream pnpm 8 lockfile does not match its checked-in web package dependencies, so a frozen installation initially fails. The lockfile must be regenerated using the pinned package manager, then frozen installation validated.

## Payment findings and changes

**Critical:** `confirmPayment` previously accepted a supplied successful Stripe intent and updated the supplied booking without checking the caller's ownership, the stored intent, metadata, currency or amount. Added those checks and targeted regression tests.

**Webhook setup:** controller expected `req.rawBody`, but Nest bootstrap did not enable raw-body capture. Enabled `rawBody: true`.

**Prototype isolation:** the UI has no API calls and never invokes Stripe. Legacy payment routes are disabled by default. Explicitly exporting `EAT_IN_ENABLE_LEGACY_PAYMENTS=true` before starting the API enables them only for isolated tests, and StripeService rejects all keys except `sk_test_...`. There is no live-payment path intended for this branch.

**Still required before live payments:** atomic booking/payment state transitions, idempotent intent creation/refunds/webhooks, amount and currency checks on every webhook, replay/out-of-order event handling, cancelled-booking handling, and Stripe Connect cook onboarding/commissions/payouts. Existing API amounts use Float and USD. Eat In needs integer minor units, AUD, server-side quotes and immutable booking-price snapshots. The limited confirmation repair does not make the original payment integration production ready.

## Reuse decision

Reuse the Next.js app, TypeScript tooling and selected UI components. Keep the inherited API as reference while a dedicated Eat In domain is designed. The current demo is intentionally separate from lodging tables and the legacy payment flow.

The prototype domain (`apps/web/src/lib/eat-in.ts`) models cooks, menus, ingredient quantities, service options, AUD quotes, sample availability and validation. It is framework-independent so its rules can move behind a future API. Browser storage is explicitly a demo adapter; it does not represent secure shared backend persistence.

## Live pilot work remaining

1. Persist users with customer and approved-cook capabilities, versioned terms/consent, account recovery and abuse controls. Authenticate and authorise every account-specific operation on the server.
2. Add cook approval, service areas, portfolios and secure media uploads; separately scope private dispute evidence, retention and access rules.
3. Add menu recipes, allergen declarations, equipment, preparation times, ingredient rounding and cook-confirmed substitutions. Quantities in this demo are illustrative.
4. Store event times with Australia/Hobart timezone semantics, recurring availability and travel/setup buffers. Make reservation holds atomic, expire unpaid holds and define cancellation/completion transitions.
5. Finalise service scope, pricing, cancellation/refund rules, customer/cook contracts, insurance and food safety requirements with appropriate Australian advice.
6. Add real delivery of booking/shopping-list notifications, private messaging, two-sided verified reviews, moderation and dispute resolution.
7. Test server persistence, ownership isolation, concurrency, cancellations, notifications and payment-provider sandbox flows before taking real users or money.
8. Choose hosting and protected preview access, then implement production monitoring, backup/recovery and secrets management. A public GitHub fork does not make a deployed preview private automatically.
9. Validate the responsive web booking flow with Tasmania testers before choosing native mobile packaging and meeting App Store/Google Play requirements.

## Asset sources

Downloaded illustrative Unsplash images used by the demo:
- `photo-1414235077428-338989a2e8c0` — table/dining inspiration.
- `photo-1551183053-bf91a1d81141` — pasta illustration.
- `photo-1555939594-58d7cb561ad1` — barbecue illustration.
- `photo-1563245372-f21724e3856d` — Asian meal illustration.

These are sample imagery, not evidence of a cook's actual work. Replace with approved original cook photos for a live pilot.

## Final dependency result

The fork baseline audit reported 114 production dependency findings (5 critical). The Eat In web app was upgraded to Next.js **16.4.1**, matching `eslint-config-next`, and Axios **^1.20.0**; its dependency tree was re-resolved and the lockfile regenerated. A repeat `pnpm audit --prod --json` reports **zero findings on paths through `apps/web`**.

The retained legacy API/workspace tree still reports **21 findings: 1 critical, 8 high, 9 moderate and 3 low**. This API is not used by the prototype and must remain offline. Do not deploy it for a live pilot until its dependencies and the architectural issues above are remediated and retested. The web-only Replit commands intentionally do not start it.

Primary security references checked during the upgrade:
- https://github.com/advisories/GHSA-2464-fhr4-w9xw (Next.js patched in 16.4.1)
- https://github.com/advisories/GHSA-673q-mjm6-r5xr (Next.js patched in 16.4.1)

Remote image sources were removed from the active Next.js configuration; the demo uses local illustrative JPEGs and its own SVG app icon. Frozen offline installation succeeds with the final lockfile. The unused shared ESLint package has an inherited TypeScript peer-version warning; the web app's own TypeScript build and lint checks are the relevant prototype checks.
