import mongoose, { Schema, Document } from "mongoose";

export interface IAggregatedStats extends Document {
  lastUpdated: Date;
  totalResponses: number;
  averageScore: number;
  medianScore: number;
  scoreDistribution: {
    range: string; // e.g., "0-10", "11-20", etc.
    count: number;
  }[];
  questionStats: {
    questionId: number;
    yesPercentage: number;
    totalResponses: number;
  }[];
}

const ScoreDistributionSchema = new Schema(
  {
    range: { type: String, required: true },
    count: { type: Number, required: true },
  },
  { _id: false }
);

const QuestionStatsSchema = new Schema(
  {
    questionId: { type: Number, required: true },
    yesPercentage: { type: Number, required: true },
    totalResponses: { type: Number, required: true },
  },
  { _id: false }
);

const AggregatedStatsSchema: Schema = new Schema({
  lastUpdated: { type: Date, default: Date.now },
  totalResponses: { type: Number, required: true, default: 0 },
  averageScore: { type: Number, required: true, default: 0 },
  medianScore: { type: Number, required: true, default: 0 },
  scoreDistribution: {
    type: [ScoreDistributionSchema],
    required: true,
    default: [],
  },
  questionStats: { type: [QuestionStatsSchema], required: true, default: [] },
});

// Only create the model if it doesn't already exist
// This is needed for Next.js hot reloading in development
export default mongoose.models.AggregatedStats ||
  mongoose.model<IAggregatedStats>("AggregatedStats", AggregatedStatsSchema);
