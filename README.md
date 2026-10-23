# Eat In prototype

Eat In is a marketplace for booking a cook to prepare food in the customer's home. This branch is a usability prototype adapted from GhersonSA/Airbnb-Full-Clone. The original MIT licence remains in LICENSE.

## Run the prototype

Use Node 20.9+ (Node 24 for the dependency-free demo tests) and the repository's pinned pnpm:

```powershell
npx --yes pnpm@8.15.0 install --frozen-lockfile
npx --yes pnpm@8.15.0 --filter web dev --hostname 127.0.0.1
```

Open http://localhost:3000. The Nest API, database, Docker services, Stripe and API environment variables are not needed for this demo.

## Try the complete journey

1. Filter the three fictional cooks by Hobart/Launceston, cuisine or service. Save a cook using the heart.
2. Open Anna's menu, choose either menu, service, a listed date, arrival time and 2-10 diners.
3. Review the AUD quote, additional grocery requirement, kitchen equipment and prototype terms. Type a fictional name and accept the terms.
4. Confirm the simulated booking. View or download the diner-scaled shopping list from My bookings.
5. Open Cook workspace, select Anna and inspect the matching cook confirmation. Simulate service completion.
6. Rate the customer as the cook. Return to My bookings and rate the cook as the customer.
7. Refresh to confirm local persistence. Make another booking and cancel it; that cook's date becomes available again.
8. Try Liam (full dining only) and Mei (meal preparation only), and check the page on a narrow screen.

The prototype limits each cook to one event a day within the next 35 days. It excludes today and follows sample weekly schedules. A full dining service adds AUD 80 per event, and a provisional 10% platform fee applies to the service subtotal. These are test prices, not approved business pricing. Groceries are additional.

## Scope and limits

All sample profiles are fictional and the photos are illustrative. Bookings, saved cooks, signatures and ratings are stored in this browser's local storage only. Clearing site storage resets them. Devices do not share data. Local storage is neither secure account storage nor a concurrency-safe reservation system. Do not enter real personal data.

Confirmations are shown in the customer and cook views only. No email, SMS, external notifications, real payment, enforceable contract, background check or real booking occurs. The signature/terms acceptance is an interaction prototype, not a legally approved contract. Rating requires simulated completion; both sides can rate once in the demo. Photo upload and private evidence handling are future work. No AI API is connected.

## Private phone testing

On the same trusted Wi-Fi, run the dev server with `--hostname 0.0.0.0` instead of `127.0.0.1`, and open `http://<computer-Wi-Fi-IP>:3000` on your phone while the computer stays on. Windows firewall may require the owner to allow the port for private networks. Do not enable public-network access or router forwarding. Demo data stays separate on each phone/browser.

To protect LAN or production access, set a randomly generated `EAT_IN_PREVIEW_PASSWORD` of at least 16 characters in your local environment before starting. The preview uses HTTP Basic authentication with username `eatin`. Local development without that variable runs without a gate and should bind to localhost. Production fails closed without the variable. Use HTTPS for hosted testing; a shared preview password is not a substitute for application accounts.

For a Vercel deployment: import this fork, choose branch `eat-in-development`, set root directory `apps/web`, framework Next.js, install command `cd ../.. && npx --yes pnpm@8.15.0 install --frozen-lockfile`, and build command `npx --yes pnpm@8.15.0 build`. Set `EAT_IN_PREVIEW_PASSWORD` in the hosting environment, also enable provider deployment protection, and keep the legacy API undeployed. No hosting deployment has been assumed or created by these instructions.

## Checks

```powershell
npx --yes pnpm@8.15.0 --filter web test:demo
npx --yes pnpm@8.15.0 --filter web exec tsc --noEmit
npx --yes pnpm@8.15.0 --filter web build
npx --yes pnpm@8.15.0 --filter api-gateway exec jest --runInBand
node apps/web/tests/private-preview.mjs
```

See docs/TECHNICAL-AUDIT.md for the source audit and live-pilot requirements. The original upstream README is retained as README.upstream.md for reference.

## Replit

For the requested Replit trial, use [docs/REPLIT.md](docs/REPLIT.md). Import the development branch and configure the private preview password before sharing. The included configuration runs the web prototype only.
