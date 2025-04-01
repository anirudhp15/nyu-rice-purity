import { NextResponse } from "next/server";
import connectToDatabase from "../../lib/mongodb";
import Feedback from "../../models/Feedback";
import { Types } from "mongoose";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, feedback, score, resultId, demographics, deviceType } = body;

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback is required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    try {
      // Create a new feedback document
      const feedbackDoc = new Feedback({
        feedback,
        email: email || undefined,
        score,
        // Only include resultId if it's a valid ObjectId
        ...(resultId && Types.ObjectId.isValid(resultId)
          ? { resultId: new Types.ObjectId(resultId) }
          : {}),
        // Only include demographics if provided
        ...(demographics && Object.keys(demographics).length > 0
          ? { demographics }
          : {}),
        // Only include deviceType if provided
        ...(deviceType ? { deviceType } : {}),
      });

      // Save to the database
      await feedbackDoc.save();

      return NextResponse.json({
        success: true,
        message: "Feedback saved to database successfully",
        feedbackId: feedbackDoc._id.toString(),
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          error: "Failed to save feedback to database",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
