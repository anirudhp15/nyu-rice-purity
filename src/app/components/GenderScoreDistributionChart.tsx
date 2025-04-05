"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DemographicStat {
  _id: string;
  count: number;
  avgScore: number;
  scores?: number[];
  medianScore?: number;
}

interface GenderScoreDistributionChartProps {
  genderStats: {
    _id: string;
    count: number;
    avgScore: number;
    scores?: number[];
  }[];
  bucketSize?: number;
}

// Helper function to get score distribution by gender
function getGenderScoreDistribution(
  genderStats: GenderScoreDistributionChartProps["genderStats"],
  bucketSize: number = 5
) {
  // Find male, female, and non-binary stats
  const maleStats = genderStats.find((g) => g._id?.toLowerCase() === "male");
  const femaleStats = genderStats.find(
    (g) => g._id?.toLowerCase() === "female"
  );
  const nonBinaryStats = genderStats.find(
    (g) => g._id?.toLowerCase() === "non-binary"
  );

  // Define ranges (0-5, 5-10, etc. OR 0-10, 10-20, etc. depending on bucketSize)
  const ranges = [];
  const numBuckets = 100 / bucketSize;
  for (let i = 0; i < numBuckets; i++) {
    const min = i * bucketSize;
    const max = min + bucketSize;
    ranges.push(`${min}-${max === 100 ? "100" : max - 1}`);
  }

  // Initialize distribution arrays
  const maleDistribution = new Array(ranges.length).fill(0);
  const femaleDistribution = new Array(ranges.length).fill(0);
  const nonBinaryDistribution = new Array(ranges.length).fill(0);

  // Count scores in each range for each gender
  if (maleStats && maleStats.scores && maleStats.scores.length > 0) {
    maleStats.scores.forEach((score) => {
      const bucketIndex = Math.min(
        Math.floor(score / bucketSize),
        numBuckets - 1
      );
      maleDistribution[bucketIndex]++;
    });
  }

  if (femaleStats && femaleStats.scores && femaleStats.scores.length > 0) {
    femaleStats.scores.forEach((score) => {
      const bucketIndex = Math.min(
        Math.floor(score / bucketSize),
        numBuckets - 1
      );
      femaleDistribution[bucketIndex]++;
    });
  }

  if (
    nonBinaryStats &&
    nonBinaryStats.scores &&
    nonBinaryStats.scores.length > 0
  ) {
    nonBinaryStats.scores.forEach((score) => {
      const bucketIndex = Math.min(
        Math.floor(score / bucketSize),
        numBuckets - 1
      );
      nonBinaryDistribution[bucketIndex]++;
    });
  }

  // Calculate percentages
  const maleTotal = maleStats?.count || 0;
  const femaleTotal = femaleStats?.count || 0;
  const nonBinaryTotal = nonBinaryStats?.count || 0;

  const malePercentages = maleDistribution.map((count) =>
    maleTotal > 0 ? (count / maleTotal) * 100 : 0
  );

  const femalePercentages = femaleDistribution.map((count) =>
    femaleTotal > 0 ? (count / femaleTotal) * 100 : 0
  );

  const nonBinaryPercentages = nonBinaryDistribution.map((count) =>
    nonBinaryTotal > 0 ? (count / nonBinaryTotal) * 100 : 0
  );

  return {
    ranges,
    malePercentages,
    femalePercentages,
    nonBinaryPercentages,
    totals: {
      male: maleTotal,
      female: femaleTotal,
      nonBinary: nonBinaryTotal,
    },
  };
}

const GenderScoreDistributionChart: React.FC<
  GenderScoreDistributionChartProps
> = ({ genderStats, bucketSize = 5 }) => {
  const distribution = getGenderScoreDistribution(genderStats, bucketSize);

  const data = {
    labels: distribution.ranges,
    datasets: [
      {
        label: "Male",
        data: distribution.malePercentages,
        backgroundColor: "rgba(54, 162, 235, 0.5)", // Blue
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Female",
        data: distribution.femalePercentages,
        backgroundColor: "rgba(255, 99, 132, 0.5)", // Pink
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "Non-binary",
        data: distribution.nonBinaryPercentages,
        backgroundColor: "rgba(153, 102, 255, 0.5)", // Purple
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            family: "serif",
          },
          color: "#57068C",
        },
      },
      tooltip: {
        backgroundColor: "rgba(87, 6, 140, 0.9)",
        titleFont: {
          family: "serif",
          size: 14,
        },
        bodyFont: {
          family: "serif",
          size: 13,
        },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            const dataset = context.dataset;
            const value = context.parsed.y || 0;
            return `${dataset.label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            family: "serif",
          },
        },
        title: {
          display: true,
          text: "Percentage of Gender Group",
          font: {
            family: "serif",
            size: 14,
          },
          color: "#57068C",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "serif",
          },
        },
        title: {
          display: true,
          text: "Score Range",
          font: {
            family: "serif",
            size: 14,
          },
          color: "#57068C",
        },
      },
    },
  };

  return (
    <div className="w-full">
      <div className="p-4 bg-white rounded-xl shadow-sm">
        <h3 className="text-center font-serif text-lg font-semibold text-[#57068C] mb-4">
          Score Distribution by Gender
        </h3>
        <div className="h-[300px]">
          <Bar data={data} options={options as any} />
        </div>
        <div className="mt-3 text-xs text-center text-gray-500">
          <p>
            Note: Values shown as percentage of each gender's total submissions
            for fair comparison
          </p>
          <p className="mt-1">
            <span className="font-semibold">Male:</span>{" "}
            {distribution.totals.male.toLocaleString()} submissions |
            <span className="ml-3 font-semibold">Female:</span>{" "}
            {distribution.totals.female.toLocaleString()} submissions |
            <span className="ml-3 font-semibold">Non-binary:</span>{" "}
            {distribution.totals.nonBinary.toLocaleString()} submissions
          </p>
        </div>
      </div>
    </div>
  );
};

export default GenderScoreDistributionChart;
