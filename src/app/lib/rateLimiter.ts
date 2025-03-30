import { RateLimiter } from "limiter";
import { NextRequest, NextResponse } from "next/server";

// Store limiters by IP
const limiters = new Map<string, RateLimiter>();

// Rate limit defaults: 20 requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_COUNT = 20; // Number of allowed requests per window

export async function rateLimiter(
  req: NextRequest,
  options: {
    windowMs?: number;
    max?: number;
  } = {}
) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // Use provided options or defaults
  const windowMs = options.windowMs || RATE_LIMIT_WINDOW;
  const max = options.max || RATE_LIMIT_COUNT;

  // Create a new rate limiter for this IP if one doesn't exist
  if (!limiters.has(ip)) {
    // tokensPerInterval is the same as max, interval is the window in ms
    const newLimiter = new RateLimiter({
      tokensPerInterval: max,
      interval: windowMs,
    });
    limiters.set(ip, newLimiter);
  }

  const limiter = limiters.get(ip)!;

  // Check if we can get a token
  const remainingRequests = await limiter.removeTokens(1);

  // If remainingRequests is < 0, we're over the limit
  if (remainingRequests < 0) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Please try again later",
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(windowMs / 1000).toString(),
          "X-RateLimit-Limit": max.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": (Date.now() + windowMs).toString(),
        },
      }
    );
  }

  // Request can proceed
  return null;
}
