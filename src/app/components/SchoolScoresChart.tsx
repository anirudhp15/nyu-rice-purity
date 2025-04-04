"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface SchoolStat {
  _id: string;
  count: number;
  avgScore: number;
  medianScore?: number;
}

interface SchoolScoresChartProps {
  schoolStats: SchoolStat[];
}

const NYU_SCHOOLS = [
  "cas",
  "tandon",
  "stern",
  "gallatin",
  "courant",
  "tisch",
  "steinhardt",
  "sps",
  "silver",
  "law",
  "wagner",
];

export default function SchoolScoresChart({
  schoolStats,
}: SchoolScoresChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Process the school stats and prepare data for the chart
    const processData = () => {
      // Group by NYU schools and "Other"
      const nyuSchools = schoolStats.filter(
        (stat) =>
          stat._id !== "Not Provided" &&
          NYU_SCHOOLS.includes(stat._id.toLowerCase())
      );

      // Calculate average score for "Other" schools
      const otherSchools = schoolStats.filter(
        (stat) =>
          stat._id !== "Not Provided" &&
          !NYU_SCHOOLS.includes(stat._id.toLowerCase())
      );

      const otherScore =
        otherSchools.length > 0
          ? otherSchools.reduce(
              (sum, school) => sum + school.avgScore * school.count,
              0
            ) / otherSchools.reduce((sum, school) => sum + school.count, 0)
          : 0;

      // Create formatted data for the chart
      const formattedData = nyuSchools.map((school) => ({
        name: school._id.charAt(0).toUpperCase() + school._id.slice(1),
        averageScore: Math.round(school.avgScore * 10) / 10,
        submissions: school.count,
      }));

      // Add "Other" category if there are non-NYU schools
      if (otherSchools.length > 0) {
        formattedData.push({
          name: "Other",
          averageScore: Math.round(otherScore * 10) / 10,
          submissions: otherSchools.reduce(
            (sum, school) => sum + school.count,
            0
          ),
        });
      }

      // Sort by average score
      return formattedData.sort((a, b) => a.averageScore - b.averageScore);
    };

    setChartData(processData());
  }, [schoolStats]);

  // Custom tooltip to show number of submissions alongside the average score
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-md">
          <p className="font-bold text-[#57068C]">{label}</p>
          <p className="text-sm">
            <span className="font-medium">Average Score:</span>{" "}
            {payload[0].value}
          </p>
          <p className="text-sm">
            <span className="font-medium">Submissions:</span>{" "}
            {payload[0].payload.submissions}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 pb-0 bg-white rounded-xl shadow-sm">
      <h3 className="mb-4 font-serif text-lg font-semibold text-[#57068C]">
        Average Scores by School
      </h3>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
            barSize={30}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              label={{
                value: "Average Score",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <Bar
              dataKey="averageScore"
              name="Average Score"
              fill="#57068C"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
