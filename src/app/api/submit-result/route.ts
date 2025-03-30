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
    const body = await request.json();
    const { answers } = body;

    // Validate input
    if (!answers || !Array.isArray(answers) || answers.length !== 100) {
      return NextResponse.json(
        { error: "Invalid answers format" },
        { status: 400 }
      );
    }

    // Calculate score
    const score = calculateScore(answers);

    // Get device and referrer info
    const userAgent = request.headers.get("user-agent") || "";
    const referrer = request.headers.get("referer") || "direct";
    const deviceType = getDeviceType(userAgent);
    const shareSource = body.shareSource || null;

    // Connect to the database
    await connectToDatabase();

    // Save the result
    await Result.create({
      score,
      answers,
      deviceType,
      referrer,
      shareSource,
    });

    // Get stats for response
    const aggregatedStats = (await AggregatedStats.findOne({})) || {
      totalResponses: 0,
      averageScore: 0,
    };

    // Return the score and some basic stats
    return NextResponse.json({
      score,
      totalParticipants: aggregatedStats.totalResponses + 1, // Include the current submission
      averageScore: aggregatedStats.averageScore,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error submitting result:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
