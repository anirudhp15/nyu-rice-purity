import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../lib/mongodb";
import Result from "../../models/Result";
import AggregatedStats from "../../models/AggregatedStats";
import { rateLimiter } from "../../lib/rateLimiter";

// Helper function to get device type
const getDeviceType = (userAgent: string): "mobile" | "tablet" | "desktop" => {
  const ua = userAgent.toLowerCase();
  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    return "mobile";
  }
  if (ua.includes("ipad") || ua.includes("tablet")) {
    return "tablet";
  }
  return "desktop";
};

// Helper function to calculate score
const calculateScore = (answers: boolean[]): number => {
  const trueCount = answers.filter((answer) => answer).length;
  // Rice Purity Test score is 100 - percentage of "yes" answers
  return 100 - trueCount;
};

// Sanitize and validate referrer URL
const validateReferrer = (referrer: string): string => {
  try {
    // Try to parse the URL to see if it's valid
    new URL(referrer);
    // Strip any potential XSS or injection attempts
    return referrer.replace(/[<>]/g, "");
  } catch {
    // If it's not a valid URL, return 'direct'
    return "direct";
  }
};

// Simple encoding function - must match the one in the results page
function encodeScore(score: number): string {
  // Base64 encode and add some random-looking characters
  const encoded = Buffer.from(`s${score}`).toString("base64");
  // Replace characters that would make URLs problematic
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting - stricter limits for submission endpoint
    // Allow only 5 submissions per minute per IP
    const rateLimit = await rateLimiter(request, {
      max: 5,
      windowMs: 60 * 1000,
    });
    if (rateLimit) {
      return rateLimit;
    }

    console.log("API: Received form submission");
    const body = await request.json().catch(() => ({}));
    const { answers } = body;

    // Enhanced validation
    if (!answers || !Array.isArray(answers)) {
      console.error("API: Missing or invalid answers", { answers });
      return NextResponse.json(
        { error: "Missing or invalid answers" },
        { status: 400 }
      );
    }

    // Ensure answers are exactly 100 boolean values
    if (
      answers.length !== 100 ||
      !answers.every((a) => typeof a === "boolean")
    ) {
      console.error("API: Invalid answers format", { answers });
      return NextResponse.json(
        { error: "Answers must be exactly 100 boolean values" },
        { status: 400 }
      );
    }

    // Calculate score
    const score = calculateScore(answers);
    // Encode the score for the URL
    const encodedScore = encodeScore(score);
    console.log(`API: Calculated score: ${score}, encoded as: ${encodedScore}`);

    // Get device and referrer info with validation
    const userAgent = request.headers.get("user-agent") || "";
    const rawReferrer = request.headers.get("referer") || "direct";
    const referrer = validateReferrer(rawReferrer);
    const deviceType = getDeviceType(userAgent);
    const shareSource = body.shareSource
      ? String(body.shareSource).slice(0, 100)
      : null;

    try {
      // Connect to the database
      console.log("API: Connecting to MongoDB");
      await connectToDatabase();
      console.log("API: Connected to MongoDB successfully");

      // Save the result
      console.log("API: Saving result to MongoDB");
      const createdResult = await Result.create({
        score,
        answers,
        deviceType,
        referrer,
        shareSource,
      });
      console.log("API: Result saved successfully", { id: createdResult._id });

      // Return the encoded score without trying to get aggregated stats
      // This simplifies the process to focus on saving the individual result
      return NextResponse.json({
        score,
        encodedScore, // Include both for compatibility
        success: true,
        message: "Result saved successfully",
      });
    } catch (dbError: any) {
      console.error("API: MongoDB error:", dbError.message);
      // Return success even if DB fails - this ensures user experience isn't affected
      // while you debug the MongoDB issue
      return NextResponse.json({
        score,
        encodedScore, // Include both for compatibility
        success: false,
        dbError: dbError.message,
      });
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("API: Error processing submission:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
