import { NextResponse, type NextRequest } from "next/server";
import { rateLimiter } from "@/app/lib/rateLimiter";

export async function middleware(request: NextRequest) {
  // Clone the request headers to add security headers
  const response = NextResponse.next();

  // Apply common security headers
  const requestHeaders = new Headers(request.headers);
  const secureHeaders = {
    "X-XSS-Protection": "1; mode=block",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };

  // Copy headers to response
  Object.entries(secureHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Check if the request is for an API route that needs rate limiting
  const url = request.nextUrl.pathname;

  if (url.startsWith("/api/")) {
    // Apply rate limiting to all API routes
    const limiterResponse = await rateLimiter(request);
    if (limiterResponse) {
      return limiterResponse;
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
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
