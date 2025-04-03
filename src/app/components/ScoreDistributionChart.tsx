"use client";

import React, { useState } from "react";
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

interface ScoreRange {
  range: string;
  count: number;
}

interface ScoreDistributionChartProps {
  scoreDistribution: ScoreRange[];
  totalSubmissions: number;
}

const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({
  scoreDistribution,
  totalSubmissions,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);

  // Prepare data for the chart
  const labels = scoreDistribution.map((item) => item.range);
  const counts = scoreDistribution.map((item) => item.count);

  // Calculate percentages
  const percentages = scoreDistribution.map((item) =>
    totalSubmissions > 0 ? Math.round((item.count / totalSubmissions) * 100) : 0
  );

  // Find the most popular score range
  const maxCountIndex = counts.indexOf(Math.max(...counts));
  const mostPopularRange = maxCountIndex !== -1 ? labels[maxCountIndex] : "N/A";
  const mostPopularPercentage =
    maxCountIndex !== -1 ? percentages[maxCountIndex] : 0;

  const data = {
    labels,
    datasets: [
      {
        label: "Score Distribution",
        data: counts,
        backgroundColor: counts.map(
          (_, index) =>
            index === activeIndex
              ? "rgba(122, 41, 161, 0.8)" // Highlighted bar
              : "rgba(87, 6, 140, 0.7)" // Normal bar
        ),
        borderColor: "rgba(87, 6, 140, 1)",
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(122, 41, 161, 0.8)", // Lighter purple for hover
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 400,
    },
    plugins: {
      legend: {
        display: false,
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
            const index = context.dataIndex;
            const count = counts[index];
            const percentage = percentages[index];
            return [
              `Count: ${count.toLocaleString()}`,
              `Percentage: ${percentage}%`,
            ];
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
          text: "Number of Submissions",
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
    onHover: (event: any, elements: any[]) => {
      if (elements && elements.length) {
        setActiveIndex(elements[0].index);
        setHovered(true);
        event.native.target.style.cursor = "pointer";
      } else {
        setActiveIndex(null);
        setHovered(false);
        event.native.target.style.cursor = "default";
      }
    },
  };

  // Display selected range info
  const getSelectedRangeInfo = () => {
    if (activeIndex !== null) {
      const range = scoreDistribution[activeIndex].range;
      const count = scoreDistribution[activeIndex].count;
      const percentage = percentages[activeIndex];

      return (
        <div className="mt-3 text-center bg-[#f8f5e6] p-3 rounded-lg">
          <p className="font-serif text-[#57068C]">
            <span className="font-bold">Score Range:</span> {range}
            <span className="mx-2">|</span>
            <span className="font-bold">Count:</span> {count.toLocaleString()}
            <span className="mx-2">|</span>
            <span className="font-bold">Percentage:</span> {percentage}%
          </p>
        </div>
      );
    }
    return (
      <div className="p-3 mt-3 italic text-center text-gray-500">
        <p className="font-serif">Hover over the chart to see details</p>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div
        className={`bg-white p-4 rounded-xl shadow-sm transition-shadow duration-200 ${
          hovered ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="h-[300px]">
          <Bar data={data} options={options as any} />
        </div>
        {getSelectedRangeInfo()}
      </div>
    </div>
  );
};

export default ScoreDistributionChart;
