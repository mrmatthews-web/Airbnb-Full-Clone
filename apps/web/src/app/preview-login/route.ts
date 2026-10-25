import { NextRequest, NextResponse } from "next/server";
import {
  createPreviewSession,
  equalSecret,
  previewCookie,
  previewSessionSeconds,
} from "@/lib/preview-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  // Preserve Origin on same-site form POSTs for the CSRF check below.
  "Referrer-Policy": "same-origin",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy":
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};

function loginPage(error = false) {
  return new NextResponse(
    `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Sign in — Eat In</title><style>
  *{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#f9f7f0;color:#293127;font:16px Arial,sans-serif;padding:24px}main{width:100%;max-width:430px;background:#fffdf7;border:1px solid #dedfd4;border-radius:12px;padding:36px}.brand{font-size:30px;font-weight:800;letter-spacing:-1px}.brand span{color:#b64b30}h1{font:36px Georgia,serif;letter-spacing:-1px;margin:27px 0 12px}p{font-size:14px;line-height:1.7;color:#68705e}label{display:block;font-size:13px;margin:23px 0 8px}input{width:100%;font:16px Arial,sans-serif;padding:14px;border:1px solid #bdc7b1;border-radius:5px;background:white;color:#293127}input:focus-visible,button:focus-visible{outline:3px solid #b64b30;outline-offset:3px}button{width:100%;padding:15px;border:0;border-radius:5px;background:#b64b30;color:white;font:15px Arial,sans-serif;margin-top:20px;cursor:pointer}.note{font-size:12px;margin-top:23px}.error{background:#f6e6df;color:#963d28;padding:12px;border-radius:5px;font-size:13px;line-height:1.6}
  </style></head><body><main><div class="brand">eat in<span>.</span></div><h1>A taste of what’s coming.</h1><p>Sign in to the private Eat In prototype. Use the preview password saved in Render.</p>${error ? '<p class="error" role="alert">That password wasn’t accepted. Try the exact preview password saved in Render. It is case-sensitive.</p>' : ""}<form method="post" action="/preview-login"><label for="password">Preview password</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="1024" autofocus><button type="submit">Enter Eat In</button></form><p class="note">No username needed. Sample cooks and simulated bookings only. Sign-in lasts up to 8 hours.</p></main></body></html>`,
    {
      status: error ? 401 : 200,
      headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

export function GET() {
  return loginPage();
}

export async function POST(request: NextRequest) {
  const password = process.env.EAT_IN_PREVIEW_PASSWORD;
  if (!password || password.length < 16)
    return new NextResponse("Private preview is not configured.", {
      status: 503,
      headers,
    });
  // Forms must originate from this host. Do not trust an arbitrary redirect URL
  // or forwarded hostname supplied by the client.
  let sameOrigin = false;
  try {
    sameOrigin =
      new URL(request.headers.get("origin") || "").host ===
      request.headers.get("host");
  } catch {
    /* reject missing/invalid origin */
  }
  if (!sameOrigin)
    return new NextResponse("Please sign in from the Eat In page.", {
      status: 403,
      headers,
    });
  if (
    !(request.headers.get("content-type") || "").startsWith(
      "application/x-www-form-urlencoded",
    )
  )
    return new NextResponse("Unsupported form.", { status: 415, headers });
  const reader = request.body?.getReader();
  let body = "";
  let length = 0;
  const decoder = new TextDecoder();
  if (reader) {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > 8192) {
        await reader.cancel();
        return new NextResponse("Form too large.", { status: 413, headers });
      }
      body += decoder.decode(chunk.value, { stream: true });
    }
    body += decoder.decode();
  }
  const supplied = new URLSearchParams(body).get("password") || "";
  if (supplied.length > 1024 || !equalSecret(supplied, password))
    return loginPage(true);
  const response = NextResponse.redirect(new URL("/", request.headers.get("origin")!), 303);
  Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
  response.cookies.set(previewCookie, createPreviewSession(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: previewSessionSeconds,
  });
  return response;
}
