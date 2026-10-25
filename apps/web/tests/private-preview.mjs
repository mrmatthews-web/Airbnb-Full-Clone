import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const cwd = fileURLToPath(new URL("..", import.meta.url));
async function checkServer(port, password, check) {
  const environment = {
    ...process.env,
    NODE_ENV: "production",
    NEXT_TELEMETRY_DISABLED: "1",
  };
  delete environment.EAT_IN_PREVIEW_PASSWORD;
  if (password) environment.EAT_IN_PREVIEW_PASSWORD = password;
  const server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      cwd,
      env: environment,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  server.stdout.on("data", (b) => {
    output += b;
  });
  server.stderr.on("data", (b) => {
    output += b;
  });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 90; attempt++) {
      if (server.exitCode !== null)
        throw new Error(`Preview server exited: ${output}`);
      try {
        await fetch(`http://127.0.0.1:${port}`);
        ready = true;
        break;
      } catch {
        await delay(1000);
      }
    }
    assert.ok(ready, `Preview server not ready: ${output}`);
    await check(`http://127.0.0.1:${port}`);
  } catch (error) {
    console.error(output);
    throw error;
  } finally {
    server.kill();
  }
}

await checkServer(3100, "fixture-only-preview-password", async (base) => {
  assert.equal((await fetch(base)).status, 401);
  const navigation = await fetch(base, {
    headers: { Accept: "text/html" },
    redirect: "manual",
  });
  assert.equal(navigation.status, 303);
  assert.equal(new URL(navigation.headers.get("location"), base).pathname, "/preview-login");
  const loginPage = await fetch(`${base}/preview-login`);
  assert.equal(loginPage.status, 200);
  assert.match(await loginPage.text(), /name="password"/);
  const post = (password, origin = base) =>
    fetch(`${base}/preview-login`, {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ password }),
      redirect: "manual",
    });
  const rejected = await post("incorrect-fixture");
  assert.equal(rejected.status, 401);
  assert.equal(rejected.headers.get("set-cookie"), null);
  assert.equal(
    (await post("fixture-only-preview-password", "https://unrelated.example"))
      .status,
    403,
  );
  const signedIn = await post("fixture-only-preview-password");
  assert.equal(signedIn.status, 303);
  const setCookie = signedIn.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
  assert.match(setCookie, /SameSite=lax/i);
  const cookie = setCookie.split(";")[0];
  assert.equal(
    (await fetch(base, { headers: { Cookie: cookie } })).status,
    200,
  );
  assert.equal(
    (await fetch(`${base}/images/italian.jpg`, { headers: { Cookie: cookie } }))
      .status,
    200,
  );
  assert.equal(
    (await fetch(base, { headers: { Cookie: cookie + "corrupt" } })).status,
    401,
  );
  const wrong = {
    Authorization: `Basic ${Buffer.from("eatin:wrong").toString("base64")}`,
  };
  assert.equal((await fetch(base, { headers: wrong })).status, 401);
  const headers = {
    Authorization: `Basic ${Buffer.from("eatin:fixture-only-preview-password").toString("base64")}`,
  };
  const page = await fetch(base, { headers });
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /The best table/);
  assert.doesNotMatch(html, /\/_next\/image\?url=/);
  assert.equal((await fetch(`${base}/images/italian.jpg`)).status, 401);
  assert.equal(
    (await fetch(`${base}/images/italian.jpg`, { headers })).status,
    200,
  );
  console.log(
    "PASS: form login, cookie protection, CSRF rejection and legacy Basic access all work",
  );
});
await checkServer(3101, undefined, async (base) => {
  assert.equal((await fetch(base)).status, 503);
  console.log("PASS: production preview fails closed without a password");
});
