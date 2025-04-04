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

// Generate a human-readable summary of user demographics
const generateUserSummary = (data: any): string => {
  // Check if any demographic data was provided
  const hasDemographics = [
    data.gender,
    data.school,
    data.year,
    data.living,
    data.race,
    data.relationship,
  ].some(
    (field) =>
      field && field !== "not_provided" && field !== "prefer_not_to_say"
  );

  if (!hasDemographics) {
    return `User submitted with score ${data.score} (no demographic info provided)`;
  }

  // Build a description with available information
  const demographics = [];

  // Add relationship status if available
  if (data.relationship && data.relationship !== "not_provided") {
    if (data.relationship === "relationship")
      demographics.push("in a relationship");
    else if (data.relationship !== "prefer_not_to_say")
      demographics.push(data.relationship);
  }

  // Add race if available
  if (
    data.race &&
    data.race !== "not_provided" &&
    data.race !== "prefer_not_to_say"
  ) {
    demographics.push(data.race);
  }

  // Add gender if available
  if (data.gender && data.gender !== "not_provided") {
    demographics.push(data.gender);
  }

  // Add school if available
  if (data.school && data.school !== "not_provided") {
    demographics.push(`${data.school} student`);
  }

  // Add year if available
  if (data.year && data.year !== "not_provided") {
    demographics.push(data.year);
  }

  // Add living situation if available
  if (data.living && data.living !== "not_provided") {
    if (data.living === "dorm") demographics.push("living in dorms");
    else if (data.living === "offcampus")
      demographics.push("living off-campus");
    else if (data.living === "commuter") demographics.push("commuter");
    else if (data.living === "family") demographics.push("living with family");
    else demographics.push(`living: ${data.living}`);
  }

  return `A ${demographics.join(", ")} submitted with score ${data.score}`;
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
    const { answers, gender, school, year, living, race, relationship } = body;

    // Log the optional fields for debugging
    console.log("API: Optional fields received:", {
      gender: gender || "not provided",
      school: school || "not provided",
      year: year || "not provided",
      living: living || "not provided",
      race: race || "not provided",
      relationship: relationship || "not provided",
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
        race: race === "" ? "not_provided" : race || null,
        relationship:
          relationship === "" ? "not_provided" : relationship || null,
      };

      // EXTRA VALIDATION: Ensure all fields exist by adding explicit null values if anything is undefined
      // This handles edge cases where fields might be missing somehow
      if (!resultData.hasOwnProperty("gender")) resultData.gender = null;
      if (!resultData.hasOwnProperty("school")) resultData.school = null;
      if (!resultData.hasOwnProperty("year")) resultData.year = null;
      if (!resultData.hasOwnProperty("living")) resultData.living = null;
      if (!resultData.hasOwnProperty("race")) resultData.race = null;
      if (!resultData.hasOwnProperty("relationship"))
        resultData.relationship = null;

      console.log("API: Data being saved:", {
        gender: resultData.gender,
        school: resultData.school,
        year: resultData.year,
        living: resultData.living,
        race: resultData.race,
        relationship: resultData.relationship,
      });

      // Add additional validation to log any irregularities
      const fieldsToCheck = [
        "gender",
        "school",
        "year",
        "living",
        "race",
        "relationship",
      ];
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

      // Generate and log a human-readable description of the submission
      const userSummary = generateUserSummary(resultData);
      console.log("🧑‍🎓 NEW SUBMISSION:", userSummary);

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
