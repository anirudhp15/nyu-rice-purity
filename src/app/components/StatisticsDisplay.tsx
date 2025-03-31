"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { trackEvents } from "../lib/analytics";

interface StatisticsData {
  overall: {
    totalParticipants: number;
    averageScore: number;
    medianScore: number;
  };
  distribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  questionStats: {
    questionId: number;
    questionText: string;
    yesPercentage: number;
  }[];
  timeBasedTrends: {
    period: string;
    date: string;
    averageScore: number;
    responses: number;
  }[];
}

export default function StatisticsDisplay() {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch("/api/statistics");

        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }

        const data = await response.json();
        setStatistics(data);

        // Track that user viewed statistics
        trackEvents.statisticsViewed();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load statistics";
        console.error("Error fetching statistics:", error);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading statistics...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!statistics) {
    return <div className="p-8 text-center">No statistics available</div>;
  }

  // Most common and least common experiences
  const sortedQuestionStats = [...statistics.questionStats].sort(
    (a, b) => b.yesPercentage - a.yesPercentage
  );
  const mostCommon = sortedQuestionStats.slice(0, 5);
  const leastCommon = sortedQuestionStats.slice(-5).reverse();

  return (
    <div className="p-4 mx-auto max-w-4xl bg-white md:p-8">
      <h1 className="mb-6 font-bold text-center text-heading">
        NYU Purity Test Statistics
      </h1>

      <div className="mb-sectionGap">
        <h2 className="mb-4 font-semibold text-subheading">Overall Stats</h2>
        <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-medium text-body">Total Participants</p>
            <p className="font-bold text-heading">
              {statistics.overall.totalParticipants.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-medium text-body">Average Score</p>
            <p className="font-bold text-heading">
              {statistics.overall.averageScore.toFixed(1)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-medium text-body">Median Score</p>
            <p className="font-bold text-heading">
              {statistics.overall.medianScore}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-sectionGap">
        <h2 className="mb-4 font-semibold text-subheading">
          Score Distribution
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statistics.distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill="#000000"
                name="Number of Participants"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-sectionGap">
        <h2 className="mb-4 font-semibold text-subheading">
          Score Trends Over Time
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={statistics.timeBasedTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="averageScore"
                stroke="#000000"
                name="Average Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-sectionGap">
        <h2 className="mb-4 font-semibold text-subheading">
          Most Common Experiences
        </h2>
        <ul className="list-disc list-inside">
          {mostCommon.map((item) => (
            <li key={item.questionId} className="mb-2">
              <span className="font-medium">{item.questionText}</span> -{" "}
              <span className="text-gray-600">
                {item.yesPercentage.toFixed(1)}% said yes
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-sectionGap">
        <h2 className="mb-4 font-semibold text-subheading">
          Least Common Experiences
        </h2>
        <ul className="list-disc list-inside">
          {leastCommon.map((item) => (
            <li key={item.questionId} className="mb-2">
              <span className="font-medium">{item.questionText}</span> -{" "}
              <span className="text-gray-600">
                {item.yesPercentage.toFixed(1)}% said yes
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center">
        <Link
          href="/"
          className="px-6 py-2 font-medium rounded bg-button text-buttonText text-button hover:bg-gray-800"
        >
          Take the Test Again
        </Link>
      </div>
    </div>
  );
}
