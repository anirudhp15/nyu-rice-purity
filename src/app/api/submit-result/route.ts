import { NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/mongodb";
import Result from "@/app/models/Result";
import AggregatedStats from "@/app/models/AggregatedStats";

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

export async function POST(request: Request) {
  try {
    console.log("API: Received form submission");
    const body = await request.json();
    const { answers } = body;

    // Validate input
    if (!answers || !Array.isArray(answers) || answers.length !== 100) {
      console.error("API: Invalid answers format", { answers });
      return NextResponse.json(
        { error: "Invalid answers format" },
        { status: 400 }
      );
    }

    // Calculate score
    const score = calculateScore(answers);
    console.log(`API: Calculated score: ${score}`);

    // Get device and referrer info
    const userAgent = request.headers.get("user-agent") || "";
    const referrer = request.headers.get("referer") || "direct";
    const deviceType = getDeviceType(userAgent);
    const shareSource = body.shareSource || null;

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

      // Return the score without trying to get aggregated stats
      // This simplifies the process to focus on saving the individual result
      return NextResponse.json({
        score,
        success: true,
        message: "Result saved successfully",
      });
    } catch (dbError: any) {
      console.error("API: MongoDB error:", dbError.message);
      // Return success even if DB fails - this ensures user experience isn't affected
      // while you debug the MongoDB issue
      return NextResponse.json({
        score,
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
