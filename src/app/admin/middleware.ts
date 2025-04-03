import { NextRequest, NextResponse } from "next/server";

export function isLocalhost(req: NextRequest): boolean {
  const host = req.headers.get("host") || "";
  return host.includes("localhost") || host.includes("127.0.0.1");
}

export function middleware(req: NextRequest) {
  // Only allow access from localhost
  if (!isLocalhost(req)) {
    return NextResponse.redirect(new URL("/404", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
