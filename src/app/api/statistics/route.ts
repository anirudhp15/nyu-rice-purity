import { NextResponse } from "next/server";
import connectToDatabase from "../../lib/mongodb";
import AggregatedStats from "../../models/AggregatedStats";
import TimeBasedStats, { ITimeBasedStats } from "../../models/TimeBasedStats";
import { purityQuestions } from "../../constants/questions";

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();

    // Get the aggregated stats
    const aggregatedStats = await AggregatedStats.findOne({});

    if (!aggregatedStats) {
      return NextResponse.json({
        overall: {
          totalParticipants: 0,
          averageScore: 0,
          medianScore: 0,
        },
        distribution: [],
        questionStats: [],
        timeBasedTrends: [],
      });
    }

    // Get the time-based stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timeBasedStats = await TimeBasedStats.find({
      period: "daily",
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: 1 });

    // Format response
    const response = {
      overall: {
        totalParticipants: aggregatedStats.totalResponses,
        averageScore: aggregatedStats.averageScore,
        medianScore: aggregatedStats.medianScore,
      },
      distribution: aggregatedStats.scoreDistribution.map(
        (item: { range: string; count: number }) => ({
          range: item.range,
          count: item.count,
          percentage: (item.count / aggregatedStats.totalResponses) * 100,
        })
      ),
      questionStats: aggregatedStats.questionStats.map(
        (item: {
          questionId: number;
          yesPercentage: number;
          totalResponses: number;
        }) => ({
          questionId: item.questionId,
          questionText:
            purityQuestions[item.questionId] ||
            `Question ${item.questionId + 1}`,
          yesPercentage: item.yesPercentage,
        })
      ),
      timeBasedTrends: timeBasedStats.map((item: ITimeBasedStats) => ({
        period: item.period,
        date: item.date.toISOString().split("T")[0],
        averageScore: item.averageScore,
        responses: item.newResponses,
      })),
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching statistics:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
