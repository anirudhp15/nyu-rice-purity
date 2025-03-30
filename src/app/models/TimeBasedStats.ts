import mongoose, { Schema, Document } from "mongoose";

export interface ITimeBasedStats extends Document {
  period: string; // "daily" | "weekly" | "monthly"
  date: Date;
  averageScore: number;
  totalResponses: number;
  newResponses: number;
}

const TimeBasedStatsSchema: Schema = new Schema({
  period: {
    type: String,
    required: true,
    enum: ["daily", "weekly", "monthly"],
  },
  date: { type: Date, required: true },
  averageScore: { type: Number, required: true, default: 0 },
  totalResponses: { type: Number, required: true, default: 0 },
  newResponses: { type: Number, required: true, default: 0 },
});

// Compound index to ensure uniqueness of period and date combination
TimeBasedStatsSchema.index({ period: 1, date: 1 }, { unique: true });

// Only create the model if it doesn't already exist
// This is needed for Next.js hot reloading in development
export default mongoose.models.TimeBasedStats ||
  mongoose.model<ITimeBasedStats>("TimeBasedStats", TimeBasedStatsSchema);
