import { NextResponse } from "next/server";
import connectToDatabase from "../../lib/mongodb";
import Feedback from "../../models/Feedback";
import { Types } from "mongoose";

// EmailJS template params interface
interface EmailJSTemplateParams {
  user_email: string;
  user_feedback: string;
  user_score: number;
  user_id?: string;
  user_gender?: string;
  user_school?: string;
  user_year?: string;
  user_living?: string;
  date: string;
}

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

    // Store the feedback in MongoDB
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
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Continue even if DB save fails - we'll still try to send the email
    }

    // Prepare the template parameters for EmailJS
    const templateParams: EmailJSTemplateParams = {
      user_email: email || "Not provided",
      user_feedback: feedback,
      user_score: score,
      date: new Date().toLocaleString(),
    };

    // Add demographic information to email if available
    if (demographics) {
      if (demographics.gender) templateParams.user_gender = demographics.gender;
      if (demographics.school) templateParams.user_school = demographics.school;
      if (demographics.year) templateParams.user_year = demographics.year;
      if (demographics.living) templateParams.user_living = demographics.living;
    }

    // Add resultId if available
    if (resultId) templateParams.user_id = resultId;

    // EmailJS API URL
    const url = "https://api.emailjs.com/api/v1.0/email/send";

    // Prepare the payload for EmailJS
    const payload = {
      service_id: "service_j4zn5cc", // Replace with your EmailJS service ID
      template_id: "template_mfb4t9o", // Replace with your EmailJS template ID
      user_id: "_1DlpBDmqjdIFafVH", // Replace with your EmailJS public key
      template_params: templateParams,
    };

    // Send the request to EmailJS
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.text();
      console.error("EmailJS error:", errorData);
      return NextResponse.json(
        { error: "Failed to send feedback" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
