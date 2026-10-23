import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

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
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (!timingSafeEqual(digest(credentials), digest(`eatin:${password}`))) {
    return new NextResponse(
      "Eat In private preview. Sign in with the testing credentials supplied by the owner.",
      {
        status: 401,
        headers: {
          ...headers,
          "WWW-Authenticate":
            'Basic realm="Eat In private preview", charset="UTF-8"',
        },
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
