import { NextResponse } from "next/server";
import connectToDatabase from "../../lib/mongodb";
import Feedback from "../../models/Feedback";
import { Types } from "mongoose";

// Generate a human-readable summary of feedback sender
const generateFeedbackSummary = (data: any): string => {
  const { email, feedback, score, demographics } = data;

  // Check if any demographic data was provided
  const hasDemographics =
    demographics &&
    Object.values(demographics).some(
      (field) =>
        field && field !== "not_provided" && field !== "prefer_not_to_say"
    );

  if (!hasDemographics) {
    return `User with score ${score} submitted feedback${
      email ? " (with email)" : ""
    }: "${feedback.substring(0, 50)}${feedback.length > 50 ? "..." : ""}"`;
  }

  // Build a description with available information
  const demo = demographics;
  const details = [];

  // Add relationship status if available
  if (demo.relationship && demo.relationship !== "not_provided") {
    if (demo.relationship === "relationship") details.push("in a relationship");
    else if (demo.relationship === "single") details.push("single");
    else if (demo.relationship === "complicated")
      details.push("it's complicated");
    else if (demo.relationship === "talking") details.push("in talking stage");
    else if (demo.relationship === "situationship")
      details.push("in a situationship");
    else if (demo.relationship !== "prefer_not_to_say")
      details.push(demo.relationship);
  }

  // Add race if available
  if (
    demo.race &&
    demo.race !== "not_provided" &&
    demo.race !== "prefer_not_to_say"
  ) {
    if (demo.race === "asian") details.push("Asian");
    else if (demo.race === "black") details.push("Black");
    else if (demo.race === "hispanic") details.push("Hispanic");
    else if (demo.race === "native") details.push("Native American");
    else if (demo.race === "pacific") details.push("Pacific Islander");
    else if (demo.race === "white") details.push("White");
    else if (demo.race === "multiracial") details.push("Multiracial");
    else details.push(demo.race);
  }

  // Add gender if available
  if (demo.gender && demo.gender !== "not_provided") {
    if (demo.gender === "male") details.push("male");
    else if (demo.gender === "female") details.push("female");
    else if (demo.gender === "non-binary") details.push("non-binary");
    else details.push(demo.gender);
  }

  // Add school if available
  if (demo.school && demo.school !== "not_provided") {
    const schoolMap: { [key: string]: string } = {
      cas: "CAS",
      tandon: "Tandon",
      stern: "Stern",
      gallatin: "Gallatin",
      courant: "Courant",
      tisch: "Tisch",
      steinhardt: "Steinhardt",
      sps: "SPS",
      silver: "Silver",
      law: "Law",
      wagner: "Wagner",
    };

    const schoolName = schoolMap[demo.school] || demo.school;
    details.push(`${schoolName} student`);
  }

  // Add year if available
  if (demo.year && demo.year !== "not_provided") {
    details.push(demo.year);
  }

  // Add living situation if available
  if (demo.living && demo.living !== "not_provided") {
    if (demo.living === "dorm") details.push("living in dorms");
    else if (demo.living === "offcampus") details.push("living off-campus");
    else if (demo.living === "commuter") details.push("commuter");
    else if (demo.living === "family") details.push("living with family");
    else details.push(`living: ${demo.living}`);
  }

  return `A ${details.join(", ")} with score ${score} submitted feedback${
    email ? " (with email)" : ""
  }: "${feedback.substring(0, 50)}${feedback.length > 50 ? "..." : ""}"`;
};

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

      // Log feedback information in a human-readable format
      console.log(
        "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      );
      console.log(`💬 NEW FEEDBACK ${new Date().toLocaleTimeString()}`);
      console.log(
        generateFeedbackSummary({ email, feedback, score, demographics })
      );
      console.log(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
      );

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
