import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "./app/lib/rateLimiter";

export function isLocalhost(req: NextRequest): boolean {
  const host = req.headers.get("host") || "";
  return host.includes("localhost") || host.includes("127.0.0.1");
}

export async function middleware(request: NextRequest) {
  // Clone the request headers to add security headers
  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Apply rate limiting if it's an API call
  const url = request.nextUrl.pathname;
  if (url.startsWith("/api")) {
    const limiterResponse = await rateLimiter(request);
    if (limiterResponse) {
      return limiterResponse;
    }
  }

  // If the request is for an admin route, check if it's from localhost
  if (url.startsWith("/admin")) {
    if (!isLocalhost(request)) {
      return NextResponse.redirect(new URL("/404", request.url));
    }
  }

  return response;
}

// Configure which routes the middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * Also match admin paths
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
    "/admin/:path*",
  ],
};
