import mongoose, { Schema, Document } from "mongoose";

// Define the interface for score distribution
interface ScoreDistribution {
  range: string;
  count: number;
}

// Define the interface for question stats
interface QuestionStat {
  questionId: number;
  yesPercentage: number;
  totalResponses: number;
}

// Define the interface for aggregated statistics
export interface IAggregatedStats extends Document {
  totalResponses: number;
  averageScore: number;
  medianScore: number;
  scoreDistribution: ScoreDistribution[];
  questionStats: QuestionStat[];
  lastUpdated: Date;
}

// Create the schema
const AggregatedStatsSchema: Schema = new Schema({
  totalResponses: { type: Number, required: true, default: 0 },
  averageScore: { type: Number, required: true, default: 0 },
  medianScore: { type: Number, required: true, default: 0 },
  scoreDistribution: [
    {
      range: { type: String, required: true },
      count: { type: Number, required: true, default: 0 },
    },
  ],
  questionStats: [
    {
      questionId: { type: Number, required: true },
      yesPercentage: { type: Number, required: true, default: 0 },
      totalResponses: { type: Number, required: true, default: 0 },
    },
  ],
  lastUpdated: { type: Date, default: Date.now },
});

// Only create the model if it doesn't already exist (for Next.js hot reloading)
export default mongoose.models.AggregatedStats ||
  mongoose.model<IAggregatedStats>("AggregatedStats", AggregatedStatsSchema);
