import { NextRequest, NextResponse } from "next/server";
import {
  equalSecret,
  previewCookie,
  validPreviewSession,
} from "@/lib/preview-auth";

// A production preview fails closed until its owner supplies a password.
// This is a shared testing gate, not customer or cook authentication.
export function proxy(request: NextRequest) {
  const password = process.env.EAT_IN_PREVIEW_PASSWORD;
  if (!password && process.env.NODE_ENV !== "production")
    return NextResponse.next();
  const headers = {
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
  };
  if (!password || password.length < 16) {
    return new NextResponse(
      "Private preview is not configured. Set EAT_IN_PREVIEW_PASSWORD to at least 16 characters.",
      { status: 503, headers },
    );
  }
  // The login route is self-contained HTML; it does not expose application data
  // or require access to protected JS, CSS or image assets.
  if (request.nextUrl.pathname === "/preview-login") return NextResponse.next();
  if (
    validPreviewSession(request.cookies.get(previewCookie)?.value, password)
  ) {
    const response = NextResponse.next();
    Object.entries(headers).forEach(([key, value]) =>
      response.headers.set(key, value),
    );
    return response;
  }
  const authorization = request.headers.get("authorization") || "";
  let credentials = "";
  if (authorization.startsWith("Basic ")) {
    try {
      credentials = Buffer.from(authorization.slice(6), "base64").toString(
        "utf8",
      );
    } catch {
      /* reject malformed credentials */
    }
  }
  if (!equalSecret(credentials, `eatin:${password}`)) {
    // Keep explicit Basic-auth clients compatible, but use an ordinary form for
    // browser navigation instead of a popup unsupported by some embedded browsers.
    if (
      (request.headers.get("accept") || "").includes("text/html") &&
      request.method === "GET"
    ) {
      const response = NextResponse.redirect(new URL("/preview-login", request.url), 303);
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }
    return new NextResponse(
      "Eat In private preview. Sign in with the testing credentials supplied by the owner.",
      {
        status: 401,
        headers,
      },
    );
  }
  const response = NextResponse.next();
  Object.entries(headers).forEach(([key, value]) =>
    response.headers.set(key, value),
  );
  return response;
}

export const config = { matcher: "/:path*" };
