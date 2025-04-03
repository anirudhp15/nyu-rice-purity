"use client";

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  BarElement,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { format, parseISO } from "date-fns";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface SubmissionData {
  date: string;
  count: number;
}

interface SubmissionsOverTimeChartProps {
  submissionsOverTime: SubmissionData[];
}

const SubmissionsOverTimeChart: React.FC<SubmissionsOverTimeChartProps> = ({
  submissionsOverTime,
}) => {
  const [chartData, setChartData] = useState<{
    dates: string[];
    counts: number[];
    cumulativeCounts: number[];
    mostActiveHour: string;
    peakCount: number;
    totalSubmissions: number;
  }>({
    dates: [],
    counts: [],
    cumulativeCounts: [],
    mostActiveHour: "N/A",
    peakCount: 0,
    totalSubmissions: 0,
  });

  useEffect(() => {
    // Log the raw data received for debugging
    console.log("Raw submissions data:", submissionsOverTime);

    if (!submissionsOverTime || submissionsOverTime.length === 0) {
      console.warn("No submission time data available");
      return;
    }

    // Ensure dates are properly sorted
    const sortedData = [...submissionsOverTime].sort((a, b) => {
      // Format is "YYYY-MM-DD HH"
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    console.log("Sorted data:", sortedData);

    // Prepare data for the chart
    const dates = sortedData.map((item) => item.date);
    const counts = sortedData.map((item) => item.count);

    // Calculate cumulative count
    const cumulativeCounts = [];
    let total = 0;
    for (const count of counts) {
      total += count;
      cumulativeCounts.push(total);
    }

    // Calculate the most active hour
    const maxIndex = counts.indexOf(Math.max(...counts));
    const mostActiveHour = maxIndex !== -1 ? dates[maxIndex] : "N/A";
    const peakCount = maxIndex !== -1 ? counts[maxIndex] : 0;

    // Format dates for better display (MM/DD HH:00)
    const formattedDates = dates.map((dateString) => {
      try {
        // Parse "YYYY-MM-DD HH" format
        const [datePart, hourPart] = dateString.split(" ");
        const date = new Date(`${datePart}T${hourPart.padStart(2, "0")}:00:00`);
        return format(date, "MMM d, h a"); // Apr 1, 3 PM
      } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return dateString;
      }
    });

    const formattedMostActiveHour = (() => {
      try {
        const [datePart, hourPart] = mostActiveHour.split(" ");
        const date = new Date(`${datePart}T${hourPart.padStart(2, "0")}:00:00`);
        return format(date, "MMM d, h a");
      } catch (error) {
        return mostActiveHour;
      }
    })();

    setChartData({
      dates: formattedDates,
      counts,
      cumulativeCounts,
      mostActiveHour: formattedMostActiveHour,
      peakCount,
      totalSubmissions: total,
    });
  }, [submissionsOverTime]);

  const data = {
    labels: chartData.dates,
    datasets: [
      {
        type: "bar" as const,
        label: "Submissions Per Hour",
        data: chartData.counts,
        backgroundColor: "rgba(87, 6, 140, 0.7)",
        borderColor: "rgba(87, 6, 140, 1)",
        borderWidth: 1,
        order: 1,
      },
      {
        type: "line" as const,
        label: "Cumulative Submissions",
        data: chartData.cumulativeCounts,
        borderColor: "rgba(122, 41, 161, 1)",
        backgroundColor: "rgba(122, 41, 161, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2,
        fill: true,
        borderDash: [5, 5],
        yAxisID: "y1",
        order: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category" as const,
        title: {
          display: true,
          text: "Hour",
          font: {
            family: "serif",
            size: 14,
          },
          color: "#57068C",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            family: "serif",
          },
          // Display fewer labels when there are many hours
          callback: function (value: any, index: number, values: any[]) {
            // Show every 4th label when there are more than 24 data points
            return values.length > 24
              ? index % 4 === 0
                ? chartData.dates[index]
                : ""
              : chartData.dates[index];
          },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Submissions Per Hour",
          font: {
            family: "serif",
            size: 14,
          },
          color: "#57068C",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            family: "serif",
          },
        },
      },
      y1: {
        beginAtZero: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Cumulative Submissions",
          font: {
            family: "serif",
            size: 14,
          },
          color: "#7A29A1",
        },
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "serif",
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            family: "serif",
          },
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
      },
    },
  };

  // Display a message when no data is available
  if (!submissionsOverTime || submissionsOverTime.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-4 p-4 bg-white rounded-xl shadow-sm">
          <p className="font-serif text-[#57068C] text-center">
            No submission time data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 p-4 bg-white rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-2 md:mb-0">
            <p className="font-serif text-[#57068C]">
              <span className="font-bold">Total Submissions:</span>{" "}
              {chartData.totalSubmissions.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="font-serif text-[#57068C]">
              <span className="font-bold">Most Active Hour:</span>{" "}
              {chartData.mostActiveHour} ({chartData.peakCount.toLocaleString()}{" "}
              submissions)
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600 font-serif">
          This chart shows the number of submissions per hour (bars) and the
          cumulative total over time (line).
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="h-[350px]">
          <Chart type="bar" data={data} options={options as any} />
        </div>
      </div>
    </div>
  );
};

export default SubmissionsOverTimeChart;
