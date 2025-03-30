import { NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/mongodb";
import Result from "@/app/models/Result";

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();

    // Calculate total shares
    const totalShares = await Result.countDocuments({
      shareSource: { $exists: true, $ne: null },
    });

    // Get platform breakdown
    const shareAggregate = await Result.aggregate([
      { $match: { shareSource: { $exists: true, $ne: null } } },
      { $group: { _id: "$shareSource", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const platformBreakdown = shareAggregate.map(
      (item: { _id: string; count: number }) => ({
        platform: item._id,
        count: item.count,
        percentage: (item.count / totalShares) * 100,
      })
    );

    return NextResponse.json({
      totalShares,
      platformBreakdown,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching share statistics:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
