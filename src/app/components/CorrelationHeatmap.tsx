"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  Tooltip,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ZAxis,
} from "recharts";

interface DemographicStat {
  _id: string;
  count: number;
  avgScore: number;
  medianScore?: number;
}

interface CorrelationHeatmapProps {
  yearStats: DemographicStat[];
  livingStats: DemographicStat[];
  relationshipStats: DemographicStat[];
}

// Map for relationship status order (from casual to committed)
const RELATIONSHIP_ORDER: { [key: string]: number } = {
  single: 1,
  talking: 2,
  situationship: 3,
  complicated: 4,
  relationship: 5,
  prefer_not_to_say: 0,
};

// Map for year progression
const YEAR_ORDER: { [key: string]: number } = {
  freshman: 1,
  sophomore: 2,
  junior: 3,
  senior: 4,
  graduate: 5,
  alumni: 6,
};

// Map for living situations
const LIVING_ORDER: { [key: string]: number } = {
  dorm: 1,
  offcampus: 2,
  commuter: 3,
  family: 4,
  other: 5,
};

// Human-readable names for display
const READABLE_NAMES: { [key: string]: string } = {
  single: "Single",
  talking: "Talking Stage",
  situationship: "Situationship",
  complicated: "It's Complicated",
  relationship: "In a Relationship",
  prefer_not_to_say: "Not Specified",
  freshman: "Freshman",
  sophomore: "Sophomore",
  junior: "Junior",
  senior: "Senior",
  graduate: "Graduate",
  alumni: "Alumni",
  dorm: "Dorm",
  offcampus: "Off-campus",
  commuter: "Commuter",
  family: "With Family",
  other: "Other",
};

export default function CorrelationHeatmap({
  yearStats,
  livingStats,
  relationshipStats,
}: CorrelationHeatmapProps) {
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>(
    "year_vs_relationship"
  );

  useEffect(() => {
    // Process data based on the selected correlation filter
    const processData = () => {
      switch (selectedFilter) {
        case "year_vs_relationship":
          return generateCorrelationData(
            yearStats,
            relationshipStats,
            "Year",
            "Relationship"
          );
        case "year_vs_living":
          return generateCorrelationData(
            yearStats,
            livingStats,
            "Year",
            "Living Situation"
          );
        case "living_vs_relationship":
          return generateCorrelationData(
            livingStats,
            relationshipStats,
            "Living Situation",
            "Relationship"
          );
        default:
          return generateCorrelationData(
            yearStats,
            relationshipStats,
            "Year",
            "Relationship"
          );
      }
    };

    setScatterData(processData());
  }, [yearStats, livingStats, relationshipStats, selectedFilter]);

  // Generate correlation data between two demographic factors
  const generateCorrelationData = (
    xStats: DemographicStat[],
    yStats: DemographicStat[],
    xLabel: string,
    yLabel: string
  ) => {
    const correlationData: any[] = [];

    // Filtering out "Not Provided" entries and organizing data
    const validXStats = xStats.filter((stat) => stat._id !== "Not Provided");
    const validYStats = yStats.filter((stat) => stat._id !== "Not Provided");

    // Create data points for the scatter chart
    validXStats.forEach((xStat) => {
      const xValue = getOrderValue(xStat._id, xLabel);
      if (xValue === 0) return; // Skip if can't determine order

      validYStats.forEach((yStat) => {
        const yValue = getOrderValue(yStat._id, yLabel);
        if (yValue === 0) return; // Skip if can't determine order

        correlationData.push({
          x: xValue,
          y: yValue,
          z: Math.round(xStat.avgScore + yStat.avgScore) / 2, // Average of both demographic scores
          xName: getReadableName(xStat._id),
          yName: getReadableName(yStat._id),
          count: Math.min(xStat.count, yStat.count), // Approximating the correlation strength
        });
      });
    });

    return correlationData;
  };

  // Helper function to get ordering value based on category
  const getOrderValue = (id: string, category: string): number => {
    const lowerCaseId = id.toLowerCase();

    if (category === "Year") {
      return YEAR_ORDER[lowerCaseId] || 0;
    } else if (category === "Relationship") {
      return RELATIONSHIP_ORDER[lowerCaseId] || 0;
    } else if (category === "Living Situation") {
      return LIVING_ORDER[lowerCaseId] || 0;
    }
    return 0;
  };

  // Get human-readable name
  const getReadableName = (id: string): string => {
    return READABLE_NAMES[id.toLowerCase()] || id;
  };

  // Custom tooltip to show detailed information
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-white rounded-lg shadow-md border border-gray-200">
          <p className="font-bold text-[#57068C]">
            {data.xName} + {data.yName}
          </p>
          <p className="text-sm">
            <span className="font-medium">Average Score:</span> {data.z}
          </p>
          <p className="text-xs text-gray-500">
            (Based on available submissions)
          </p>
        </div>
      );
    }
    return null;
  };

  // Get axis labels based on selected filter
  const getAxisLabels = () => {
    switch (selectedFilter) {
      case "year_vs_relationship":
        return { xLabel: "Year", yLabel: "Relationship Status" };
      case "year_vs_living":
        return { xLabel: "Year", yLabel: "Living Situation" };
      case "living_vs_relationship":
        return { xLabel: "Living Situation", yLabel: "Relationship Status" };
      default:
        return { xLabel: "Year", yLabel: "Relationship Status" };
    }
  };

  const { xLabel, yLabel } = getAxisLabels();

  // Color scale function based on score value (z)
  const getColor = (score: number) => {
    if (score >= 80) return "#b2df8a"; // High purity = green
    if (score >= 60) return "#a6cee3"; // Medium-high = light blue
    if (score >= 40) return "#fb9a99"; // Medium-low = light red
    return "#e31a1c"; // Low purity = dark red
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm">
      <h3 className="mb-4 font-serif text-lg font-semibold text-[#57068C]">
        Demographic Correlations
      </h3>

      {/* Filter controls */}
      <div className="mb-4">
        <label className="mr-2 text-sm font-medium">Correlation Type:</label>
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="p-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#57068C]"
        >
          <option value="year_vs_relationship">
            Year vs. Relationship Status
          </option>
          <option value="year_vs_living">Year vs. Living Situation</option>
          <option value="living_vs_relationship">
            Living Situation vs. Relationship Status
          </option>
        </select>
      </div>

      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name={xLabel}
              domain={[0, 7]}
              allowDecimals={false}
              tick={false}
              label={{ value: xLabel, position: "insideBottom", offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yLabel}
              domain={[0, 6]}
              allowDecimals={false}
              tick={false}
              label={{ value: yLabel, angle: -90, position: "insideLeft" }}
            />
            <ZAxis
              type="number"
              dataKey="z"
              range={[50, 600]} // Bubble size range
              name="Average Score"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Scatter
              name="Demographic Correlation"
              data={scatterData}
              fill="#57068C"
              shape="circle"
            >
              {scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.z)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-center">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 mr-1 bg-[#e31a1c] rounded-sm"></div>
            <span>Low Score (&lt;40)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-1 bg-[#fb9a99] rounded-sm"></div>
            <span>Medium-Low (40-59)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-1 bg-[#a6cee3] rounded-sm"></div>
            <span>Medium-High (60-79)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 mr-1 bg-[#b2df8a] rounded-sm"></div>
            <span>High Score (≥80)</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-600 text-center">
        Bubble size represents relative number of submissions in each category
      </p>
    </div>
  );
}
