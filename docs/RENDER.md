# Render free testing deployment

The root `render.yaml` defines one Free Node web service on branch `eat-in-development`. It builds and starts only the Eat In web application; the inherited API, databases and Stripe remain offline. Leave the root directory blank: the build needs the monorepo lockfile and workspace definition.

## Set up

1. In your Eat In Render workspace, select **New > Blueprint** and connect `mrmatthews-web/Airbnb-Full-Clone`.
2. Choose **eat-in-development** as the Blueprint branch and `render.yaml` as its path.
3. Review the resources: exactly one **Free** web service called `eat-in-testing`, with no databases, disks or paid resources.
4. When prompted, enter a randomly generated preview password of at least 16 characters for `EAT_IN_PREVIEW_PASSWORD`. Keep it in Render's environment settings and a password manager, not in chat or Git.
5. Apply the Blueprint and wait for the deployment logs. The app listens on Render's assigned port and all network interfaces.
6. Keep Render's default **TCP health check**. Do not use `/` as an HTTP health check: the preview gate correctly returns 401 to unsigned requests.
7. Open the URL Render supplies. The normal sign-in page asks only for your preview password, with no username or browser popup. A missing or short configured password produces 503; an incorrect form submission produces 401 and a clear error. Sessions expire after eight hours. For old cached browser credentials, open `/preview-login` directly.
8. Verify the page, photos, menu selection, demo booking, shopping list, cook workspace and two-way ratings on desktop and phone. Check in a private browser window that credentials are required.

If using **New > Web Service** instead, select the same repository and branch, Node runtime, Free instance, blank root directory, and copy the build/start commands and environment settings from `render.yaml`.

Workspace creation alone does not create or deploy a service, and does not connect this chat to your Render account. No deployment has been created merely by preparing these files.

## Trial limits

Render Free sleeps after 15 minutes idle and takes about a minute to wake. Free service hours, bandwidth and build minutes are limited. Leaving payment details off the account avoids automatic usage-overage billing; Render instead suspends services or further builds when allowances run out. No database is needed for the current browser-local demo. Bookings on different devices are separate.

References: https://render.com/docs/blueprint-spec · https://render.com/docs/deploy-nextjs-app · https://render.com/docs/health-checks · https://render.com/docs/free
