# Private Replit trial

The repository includes a `.replit` configuration for this Next.js web prototype. It serves one HTTP port (3000 internally), builds only `web`, and leaves the inherited API and payments offline.

1. Sign into your Replit account and import `https://github.com/mrmatthews-web/Airbnb-Full-Clone` from GitHub.
2. Select the `eat-in-development` branch in version control. The upstream `main` branch is the original lodging app. If import defaults to main, switch branches before installing/running.
3. In Replit's Shell run `npx --yes pnpm@8.15.0 install --frozen-lockfile`.
4. Add `EAT_IN_PREVIEW_PASSWORD` in Secrets using a randomly generated value of at least 16 characters. Keep the value out of Git and never prefix it with `NEXT_PUBLIC_`. Set the secret for the published deployment as well as the workspace.
5. Press Run. Enter your preview password on the Eat In sign-in page; no username is needed. Keep workspace preview access restricted too.
6. For a hosted trial, open Publishing, review the account's usage charges and choose **Private** access. Check the build/run commands from `.replit` and that the password secret exists in the deployment environment. Owner must approve any paid plan or deployment charges.
7. After publishing, verify that a signed-out private browser cannot access the app without the required access. Then run through the booking checklist in README.md on your phone.

The production app deliberately returns 503 if the password is missing/short and 401 if the preview credentials are absent or incorrect. This prevents an unconfigured deployment from exposing the prototype. Always use HTTPS when sharing the credentials. Replit's private access adds a separate host-level restriction.

Import and deployment still require access to the owner's Replit session. No Replit account, deployment or paid subscription is created merely by adding this configuration. The configuration is prepared from official documentation; it must be verified in the actual Replit environment.

This is a frontend prototype: bookings remain in each browser, so a phone and laptop will not share records. There are no real payments, external notifications, uploaded evidence or verified cook accounts.

References:
- https://docs.replit.com/references/project-setup/configuration
- https://docs.replit.com/references/project-setup/ports
- https://docs.replit.com/replit-workspace/workspace-features/version-control
- https://replit.com/blog/secure-more-apps
