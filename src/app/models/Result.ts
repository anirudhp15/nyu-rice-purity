import mongoose, { Schema, Document } from "mongoose";

export interface ITestResult extends Document {
  score: number;
  answers: boolean[]; // Array of 100 boolean values
  timestamp: Date;
  deviceType: string; // "mobile" | "tablet" | "desktop"
  referrer: string; // Where the user came from
  shareSource?: string; // If they came from a share
  gender?: string; // Optional gender
  school?: string; // Optional school
  year?: string; // Optional year/class
  living?: string; // Optional living situation
  race?: string; // Optional race/ethnicity
  relationship?: string; // Optional relationship status
}

const ResultSchema: Schema = new Schema({
  score: { type: Number, required: true },
  answers: {
    type: [Boolean],
    required: true,
    validate: [
      (val: boolean[]) => val.length === 100,
      "Must have exactly 100 answers",
    ],
  },
  timestamp: { type: Date, default: Date.now },
  deviceType: {
    type: String,
    required: true,
    enum: ["mobile", "tablet", "desktop"],
  },
  referrer: { type: String, required: true },
  shareSource: { type: String },
  gender: { type: String },
  school: { type: String },
  year: { type: String },
  living: { type: String },
  race: { type: String },
  relationship: { type: String },
});

// Only create the model if it doesn't already exist
// This is needed for Next.js hot reloading in development
export default mongoose.models.Result ||
  mongoose.model<ITestResult>("Result", ResultSchema);
