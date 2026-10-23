# Prototype validation

Validated on Windows with Node 24 and pnpm 8.15.0.

## Completed checks

- Five domain tests pass: AUD quotes, diner-scaled ingredients, weekly availability, cancellation reopening a date, duplicate/date/service/menu/input validation.
- Eight backend tests pass across two suites, including payment ownership and stored-intent/amount/currency/metadata checks.
- NestJS API compiles after generating Prisma Client from the checked-in SQLite schema.
- Next.js production build and TypeScript checks pass.
- Full web ESLint check has zero errors. Five warnings are inherited from the unused accommodation searchBar component (unused import and raw image elements).
- Production HTTP access checks pass: absent credentials and incorrect credentials return 401, valid credentials serve the app and local images, and missing production password returns 503.
- A frozen offline installation succeeds after regenerating the inconsistent upstream lockfile.
- Development homepage responds with HTTP 200 on localhost.

The first successful builds used the upstream Next.js 16.1.4 baseline. A registry audit then identified critical Next.js advisories, requiring an upgrade and final revalidation before hosted use. See the technical audit for final dependency results.

## Browser verification limitation

The connected in-app browser repeatedly failed to attach to both external pages and localhost, even after resetting its session. No working Chrome/Edge surface was available. Consequently, desktop/mobile screenshots, pointer/keyboard interactions, downloaded-list contents and the entire customer/cook UI journey have not been visually or interactively verified. The responsive styles and native dialog are implemented, and the domain/server tests pass, but a manual browser acceptance run is still required using the checklist in README.md.

## Hosting status

Replit configuration and private-preview instructions are included. No Replit session could be accessed through the browser tool, and no hosting deployment, subscription or charge was created. Import the development branch and use the private-access settings described in docs/REPLIT.md.

## Final revalidation

After upgrading to Next.js 16.4.1, the demo's domain tests and targeted lint checks pass again, and the frozen offline install remains reproducible. The active web dependency tree has zero production audit findings. The retained legacy API/workspace has 21 outstanding findings and is excluded from the prototype runtime/deployment.

The final Next.js 16.4.1 production build, TypeScript check and protected-image HTTP checks pass. Images are deliberately served directly from the local protected assets because the image optimiser does not forward Basic authentication headers. No anonymous or wrong-password access is allowed in production. The Replit plugin was subsequently connected successfully, and an app search returned no existing Eat In app.
