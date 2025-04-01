import mongoose, { Schema } from "mongoose";

// Define the Feedback schema with all user information
const FeedbackSchema = new Schema(
  {
    // Link to original test result
    resultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Result",
      required: true,
    },
    // Feedback content
    feedback: {
      type: String,
      required: true,
    },
    // User contact info (optional)
    email: {
      type: String,
      required: false,
    },
    // Score from the test
    score: {
      type: Number,
      required: true,
    },
    // Demographic information (all optional)
    demographics: {
      gender: {
        type: String,
        required: false,
      },
      school: {
        type: String,
        required: false,
      },
      year: {
        type: String,
        required: false,
      },
      living: {
        type: String,
        required: false,
      },
    },
    // Device information
    deviceType: {
      type: String,
      required: false,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create and export the model, making sure to check if it's already been compiled
export default mongoose.models.Feedback ||
  mongoose.model("Feedback", FeedbackSchema);
