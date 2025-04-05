import mongoose, { Schema, Document } from "mongoose";

// Define the interface for time-based statistics
export interface ITimeBasedStats extends Document {
  period: string; // "hourly", "daily", "weekly", "monthly"
  date: Date;
  averageScore: number;
  medianScore: number;
  newResponses: number;
  totalResponses: number;
}

// Create the schema
const TimeBasedStatsSchema: Schema = new Schema({
  period: {
    type: String,
    required: true,
    enum: ["hourly", "daily", "weekly", "monthly"],
  },
  date: {
    type: Date,
    required: true,
  },
  averageScore: {
    type: Number,
    required: true,
    default: 0,
  },
  medianScore: {
    type: Number,
    required: true,
    default: 0,
  },
  newResponses: {
    type: Number,
    required: true,
    default: 0,
  },
  totalResponses: {
    type: Number,
    required: true,
    default: 0,
  },
});

// Create a compound index on period and date to ensure uniqueness and efficient queries
TimeBasedStatsSchema.index({ period: 1, date: 1 }, { unique: true });

// Only create the model if it doesn't already exist (for Next.js hot reloading)
export default mongoose.models.TimeBasedStats ||
  mongoose.model<ITimeBasedStats>("TimeBasedStats", TimeBasedStatsSchema);
