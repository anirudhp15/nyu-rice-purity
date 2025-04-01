import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../lib/mongodb";
import Result from "../../models/Result";
import AggregatedStats from "../../models/AggregatedStats";
import { rateLimiter } from "../../lib/rateLimiter";
import { cookies } from "next/headers";

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
    const { answers, gender, school, year, living } = body;

    // Log the optional fields for debugging
    console.log("API: Optional fields received:", {
      gender: gender || "not provided",
      school: school || "not provided",
      year: year || "not provided",
      living: living || "not provided",
    });

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

      // When a field is empty string, we'll store "not_provided" to distinguish from older null entries
      const resultData = {
        score,
        answers,
        deviceType,
        referrer,
        shareSource,
        // For new submissions, empty strings become "not_provided" (user chose not to answer)
        // This distinguishes them from old null entries (user didn't have the option)
        gender: gender === "" ? "not_provided" : gender || null,
        school: school === "" ? "not_provided" : school || null,
        year: year === "" ? "not_provided" : year || null,
        living: living === "" ? "not_provided" : living || null,
      };

      // EXTRA VALIDATION: Ensure all fields exist by adding explicit null values if anything is undefined
      // This handles edge cases where fields might be missing somehow
      if (!resultData.hasOwnProperty("gender")) resultData.gender = null;
      if (!resultData.hasOwnProperty("school")) resultData.school = null;
      if (!resultData.hasOwnProperty("year")) resultData.year = null;
      if (!resultData.hasOwnProperty("living")) resultData.living = null;

      console.log("API: Data being saved:", {
        gender: resultData.gender,
        school: resultData.school,
        year: resultData.year,
        living: resultData.living,
      });

      // Add additional validation to log any irregularities
      const fieldsToCheck = ["gender", "school", "year", "living"];
      const missingFields = fieldsToCheck.filter(
        (field) => !resultData.hasOwnProperty(field)
      );
      if (missingFields.length > 0) {
        console.error(
          `API WARNING: Some demographic fields are missing: ${missingFields.join(
            ", "
          )}`
        );
      }

      const createdResult = await Result.create(resultData);
      console.log("API: Result saved successfully", { id: createdResult._id });

      // Store the resultId in a cookie for 30 days
      const cookieStore = cookies();
      cookieStore.set({
        name: "resultId",
        value: createdResult._id.toString(),
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "strict",
      });

      // Create the response object
      const response = NextResponse.json({
        score,
        encodedScore, // Include both for compatibility
        resultId: createdResult._id.toString(),
        success: true,
        message: "Result saved successfully",
      });

      return response;
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
