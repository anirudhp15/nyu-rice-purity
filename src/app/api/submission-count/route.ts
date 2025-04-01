import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../lib/mongodb";
import Result from "../../models/Result";
import { rateLimiter } from "../../lib/rateLimiter";

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting - allow more frequent checks for this lightweight endpoint
    const rateLimit = await rateLimiter(request, {
      max: 10, // 10 requests
      windowMs: 60 * 1000, // per minute
    });

    if (rateLimit) {
      return rateLimit;
    }

    // Connect to database
    await connectToDatabase();

    // Count total submissions
    const count = await Result.countDocuments({});

    // Return the count
    return NextResponse.json(
      {
        count,
        showStats:
          count >= 2025 || process.env.NEXT_PUBLIC_NODE_ENV === "development",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300", // Cache for 1 minute on browser, 5 minutes on CDN
        },
      }
    );
  } catch (error) {
    console.error("Error getting submission count:", error);
    return NextResponse.json(
      { error: "Failed to get submission count" },
      { status: 500 }
    );
  }
}
