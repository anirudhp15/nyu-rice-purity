"use client";

import { useState, useEffect } from "react";

interface DemographicStat {
  _id: string;
  count: number;
  avgScore: number;
  scores?: number[];
  medianScore?: number;
}

interface DemographicCategory {
  total: number;
  percentage: number;
}

interface DemographicStats {
  gender: DemographicCategory;
  school: DemographicCategory;
  year: DemographicCategory;
  living: DemographicCategory;
  race: DemographicCategory;
  relationship: DemographicCategory;
}

interface DemographicTablesProps {
  genderStats: DemographicStat[];
  schoolStats: DemographicStat[];
  yearStats: DemographicStat[];
  livingStats: DemographicStat[];
  raceStats: DemographicStat[];
  relationshipStats: DemographicStat[];
  demographicStats: DemographicStats;
}

// Define NYU school options - same as in TestForm component
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

// Define standard race options
const STANDARD_RACES = [
  "asian",
  "black",
  "hispanic",
  "middle_eastern",
  "native",
  "pacific",
  "white",
  "multiracial",
  "prefer_not_to_say",
];

export default function DemographicTables({
  genderStats,
  schoolStats,
  yearStats,
  livingStats,
  raceStats,
  relationshipStats,
  demographicStats,
}: DemographicTablesProps) {
  // State to track whether to show "Not Provided" data
  const [showNotProvided, setShowNotProvided] = useState(false);

  // Filter stats based on toggle state
  const filterStats = (stats: DemographicStat[], type?: string) => {
    let filteredStats = showNotProvided
      ? stats
      : stats.filter(
          (stat) =>
            stat._id !== "Not Provided" &&
            stat._id !== "not_provided" &&
            stat._id !== null &&
            stat._id !== "null"
        );

    // Special handling for school stats - group non-NYU schools
    if (type === "school") {
      // Get NYU schools
      const nyuSchools = filteredStats.filter((stat) =>
        NYU_SCHOOLS.includes(String(stat._id).toLowerCase())
      );

      // Get non-NYU schools
      const otherSchools = filteredStats.filter(
        (stat) =>
          !NYU_SCHOOLS.includes(String(stat._id).toLowerCase()) &&
          stat._id !== "Not Provided" &&
          stat._id !== "not_provided" &&
          stat._id !== null &&
          stat._id !== "null"
      );

      // If there are other schools, combine them
      if (otherSchools.length > 0) {
        const totalCount = otherSchools.reduce(
          (sum, school) => sum + school.count,
          0
        );

        // Calculate weighted average score
        const weightedAvgScore =
          otherSchools.reduce(
            (sum, school) => sum + school.avgScore * school.count,
            0
          ) / totalCount;

        // Estimate median score (using average of medians)
        const weightedMedianScore =
          otherSchools.reduce(
            (sum, school) => sum + (school.medianScore || 0) * school.count,
            0
          ) / totalCount;

        // Add combined "Other" entry
        nyuSchools.push({
          _id: "Other",
          count: totalCount,
          avgScore: Math.round(weightedAvgScore * 100) / 100,
          medianScore: Math.round(weightedMedianScore),
        });
      }

      // Get entries that should be labeled as "Prefer not to say" (not_provided, null)
      const notProvidedEntries = stats.filter(
        (stat) =>
          stat._id === "not_provided" ||
          stat._id === null ||
          stat._id === "null"
      );

      // Get entries that are literally "Not Provided" (which will be displayed as "Unknown")
      const unknownEntries = stats.filter(
        (stat) => stat._id === "Not Provided"
      );

      // If we have any not_provided entries, combine them
      if (notProvidedEntries.length > 0) {
        const totalCount = notProvidedEntries.reduce(
          (sum, entry) => sum + entry.count,
          0
        );

        // Only proceed if we have entries to combine
        if (totalCount > 0) {
          // Calculate weighted average score
          const weightedAvgScore =
            notProvidedEntries.reduce(
              (sum, entry) => sum + entry.avgScore * entry.count,
              0
            ) / totalCount;

          // Estimate median score
          const weightedMedianScore =
            notProvidedEntries.reduce(
              (sum, entry) => sum + (entry.medianScore || 0) * entry.count,
              0
            ) / totalCount;

          // Add "Prefer not to say" entry (renamed from "Not Provided")
          nyuSchools.push({
            _id: "prefer_not_to_say_school",
            count: totalCount,
            avgScore: Math.round(weightedAvgScore * 100) / 100,
            medianScore: Math.round(weightedMedianScore),
          });
        }
      }

      // Include Unknown entries only if showNotProvided is true
      return showNotProvided ? [...nyuSchools, ...unknownEntries] : nyuSchools;
    }

    // Special handling for race stats - group non-standard races and handle Middle Eastern
    if (type === "race") {
      // Standard races from dropdown (excluding prefer_not_to_say which will be handled separately)
      const standardRaces = filteredStats.filter(
        (stat) =>
          STANDARD_RACES.includes(String(stat._id).toLowerCase()) &&
          stat._id !== "prefer_not_to_say"
      );

      // Find any Middle Eastern entries in "other" responses
      const middleEasternEntries = filteredStats.filter(
        (stat) =>
          !STANDARD_RACES.includes(String(stat._id).toLowerCase()) &&
          stat._id !== "Not Provided" &&
          stat._id !== "not_provided" &&
          stat._id !== null &&
          stat._id !== "null" &&
          String(stat._id).toLowerCase().includes("middle eastern")
      );

      // If we found any Middle Eastern entries, add them to middle_eastern or create it
      if (middleEasternEntries.length > 0) {
        const totalMECount = middleEasternEntries.reduce(
          (sum, entry) => sum + entry.count,
          0
        );

        // Calculate weighted average score
        const weightedMEAvgScore =
          middleEasternEntries.reduce(
            (sum, entry) => sum + entry.avgScore * entry.count,
            0
          ) / totalMECount;

        // Estimate median score
        const weightedMEMedianScore =
          middleEasternEntries.reduce(
            (sum, entry) => sum + (entry.medianScore || 0) * entry.count,
            0
          ) / totalMECount;

        // Find existing middle_eastern entry
        const existingMEIndex = standardRaces.findIndex(
          (race) => String(race._id).toLowerCase() === "middle_eastern"
        );

        if (existingMEIndex >= 0) {
          // Update existing entry
          const existingME = standardRaces[existingMEIndex];
          const combinedCount = existingME.count + totalMECount;
          const combinedAvg =
            (existingME.avgScore * existingME.count +
              weightedMEAvgScore * totalMECount) /
            combinedCount;
          const combinedMedian =
            ((existingME.medianScore || 0) * existingME.count) / combinedCount +
            (weightedMEMedianScore * totalMECount) / combinedCount;

          standardRaces[existingMEIndex] = {
            ...existingME,
            count: combinedCount,
            avgScore: Math.round(combinedAvg * 100) / 100,
            medianScore: Math.round(combinedMedian),
          };
        } else {
          // Create new entry
          standardRaces.push({
            _id: "middle_eastern",
            count: totalMECount,
            avgScore: Math.round(weightedMEAvgScore * 100) / 100,
            medianScore: Math.round(weightedMEMedianScore),
          });
        }
      }

      // Get other non-standard races that are not Middle Eastern
      const otherRaces = filteredStats.filter(
        (stat) =>
          !STANDARD_RACES.includes(String(stat._id).toLowerCase()) &&
          stat._id !== "Not Provided" &&
          stat._id !== "not_provided" &&
          stat._id !== null &&
          stat._id !== "null" &&
          !String(stat._id).toLowerCase().includes("middle eastern")
      );

      // If there are other races, combine them
      if (otherRaces.length > 0) {
        const totalCount = otherRaces.reduce(
          (sum, race) => sum + race.count,
          0
        );

        // Calculate weighted average score
        const weightedAvgScore =
          otherRaces.reduce(
            (sum, race) => sum + race.avgScore * race.count,
            0
          ) / totalCount;

        // Estimate median score
        const weightedMedianScore =
          otherRaces.reduce(
            (sum, race) => sum + (race.medianScore || 0) * race.count,
            0
          ) / totalCount;

        // Add combined "Other" entry
        standardRaces.push({
          _id: "Other",
          count: totalCount,
          avgScore: Math.round(weightedAvgScore * 100) / 100,
          medianScore: Math.round(weightedMedianScore),
        });
      }

      // Collect all entries that are either "prefer_not_to_say" or some form of "not provided"
      const preferNotToSayEntries = stats.filter(
        (stat) => stat._id === "prefer_not_to_say"
      );

      const notProvidedEntries = stats.filter(
        (stat) =>
          stat._id === "not_provided" ||
          stat._id === null ||
          stat._id === "null"
      );

      // Get entries that are literally "Not Provided" (which will be displayed as "Unknown")
      const unknownEntries = stats.filter(
        (stat) => stat._id === "Not Provided"
      );

      // Always create the combined row for "prefer_not_to_say" and "not_provided"
      if (preferNotToSayEntries.length > 0 || notProvidedEntries.length > 0) {
        const allNotDisclosedEntries = [
          ...preferNotToSayEntries,
          ...notProvidedEntries,
        ];
        const totalCount = allNotDisclosedEntries.reduce(
          (sum, entry) => sum + entry.count,
          0
        );

        // Only proceed if we have entries to combine
        if (totalCount > 0) {
          // Calculate weighted average score
          const weightedAvgScore =
            allNotDisclosedEntries.reduce(
              (sum, entry) => sum + entry.avgScore * entry.count,
              0
            ) / totalCount;

          // Estimate median score
          const weightedMedianScore =
            allNotDisclosedEntries.reduce(
              (sum, entry) => sum + (entry.medianScore || 0) * entry.count,
              0
            ) / totalCount;

          // Add combined "Prefer not to say/Not provided" entry
          standardRaces.push({
            _id: "prefer_not_to_say_combined",
            count: totalCount,
            avgScore: Math.round(weightedAvgScore * 100) / 100,
            medianScore: Math.round(weightedMedianScore),
          });
        }
      }

      // Include Unknown entries only if showNotProvided is true
      return showNotProvided
        ? [...standardRaces, ...unknownEntries]
        : standardRaces;
    }

    // Special handling for gender and relationship status - combine "prefer_not_to_say" with "not_provided"
    if (type === "gender" || type === "relationship") {
      // Get non-missing entries (excluding all forms of not provided/prefer not to say)
      const normalEntries = filteredStats.filter(
        (stat) =>
          stat._id !== "prefer_not_to_say" &&
          stat._id !== "not_provided" &&
          stat._id !== null &&
          stat._id !== "null" &&
          stat._id !== "Not Provided"
      );

      // Collect all entries that are either "prefer_not_to_say" or some form of "not provided"
      const preferNotToSayEntries = stats.filter(
        (stat) => stat._id === "prefer_not_to_say"
      );

      const notProvidedEntries = stats.filter(
        (stat) =>
          stat._id === "not_provided" ||
          stat._id === null ||
          stat._id === "null"
      );

      // Get entries that are literally "Not Provided" (which will be displayed as "Unknown")
      const unknownEntries = stats.filter(
        (stat) => stat._id === "Not Provided"
      );

      // Always create the combined row, regardless of showNotProvided value
      if (preferNotToSayEntries.length > 0 || notProvidedEntries.length > 0) {
        const allNotDisclosedEntries = [
          ...preferNotToSayEntries,
          ...notProvidedEntries,
        ];
        const totalCount = allNotDisclosedEntries.reduce(
          (sum, entry) => sum + entry.count,
          0
        );

        // Only proceed if we have entries to combine
        if (totalCount > 0) {
          // Calculate weighted average score
          const weightedAvgScore =
            allNotDisclosedEntries.reduce(
              (sum, entry) => sum + entry.avgScore * entry.count,
              0
            ) / totalCount;

          // Estimate median score
          const weightedMedianScore =
            allNotDisclosedEntries.reduce(
              (sum, entry) => sum + (entry.medianScore || 0) * entry.count,
              0
            ) / totalCount;

          // Add combined "Prefer not to say/Not provided" entry
          normalEntries.push({
            _id: "prefer_not_to_say_combined",
            count: totalCount,
            avgScore: Math.round(weightedAvgScore * 100) / 100,
            medianScore: Math.round(weightedMedianScore),
          });
        }
      }

      // Include Unknown entries only if showNotProvided is true
      return showNotProvided
        ? [...normalEntries, ...unknownEntries]
        : normalEntries;
    }

    // Special handling for Year stats - rename "not_provided" to "Prefer not to say" and keep visible
    if (type === "year") {
      // Get regular entries (excluding Unknown and Not Provided)
      const normalEntries = filteredStats.filter(
        (stat) =>
          stat._id !== "Not Provided" &&
          stat._id !== "not_provided" &&
          stat._id !== null &&
          stat._id !== "null"
      );

      // Get entries that should be labeled as "Prefer not to say" (not_provided, null)
      const notProvidedEntries = stats.filter(
        (stat) =>
          stat._id === "not_provided" ||
          stat._id === null ||
          stat._id === "null"
      );

      // Get entries that are literally "Not Provided" (which will be displayed as "Unknown")
      const unknownEntries = stats.filter(
        (stat) => stat._id === "Not Provided"
      );

      // If we have any not_provided entries, combine them
      if (notProvidedEntries.length > 0) {
        const totalCount = notProvidedEntries.reduce(
          (sum, entry) => sum + entry.count,
          0
        );

        // Only proceed if we have entries to combine
        if (totalCount > 0) {
          // Calculate weighted average score
          const weightedAvgScore =
            notProvidedEntries.reduce(
              (sum, entry) => sum + entry.avgScore * entry.count,
              0
            ) / totalCount;

          // Estimate median score
          const weightedMedianScore =
            notProvidedEntries.reduce(
              (sum, entry) => sum + (entry.medianScore || 0) * entry.count,
              0
            ) / totalCount;

          // Add "Prefer not to say" entry (renamed from "Not Provided")
          normalEntries.push({
            _id: "prefer_not_to_say_year",
            count: totalCount,
            avgScore: Math.round(weightedAvgScore * 100) / 100,
            medianScore: Math.round(weightedMedianScore),
          });
        }
      }

      // Include Unknown entries only if showNotProvided is true
      return showNotProvided
        ? [...normalEntries, ...unknownEntries]
        : normalEntries;
    }

    // Special handling for Living Situation stats - rename "not_provided" to "Prefer not to say" and keep visible
    if (type === "living") {
      // Get regular entries (excluding Unknown and Not Provided)
      const normalEntries = filteredStats.filter(
        (stat) =>
          stat._id !== "Not Provided" &&
          stat._id !== "not_provided" &&
          stat._id !== null &&
          stat._id !== "null"
      );

      // Get entries that should be labeled as "Prefer not to say" (not_provided, null)
      const notProvidedEntries = stats.filter(
        (stat) =>
          stat._id === "not_provided" ||
          stat._id === null ||
          stat._id === "null"
      );

      // Get entries that are literally "Not Provided" (which will be displayed as "Unknown")
      const unknownEntries = stats.filter(
        (stat) => stat._id === "Not Provided"
      );

      // If we have any not_provided entries, combine them
      if (notProvidedEntries.length > 0) {
        const totalCount = notProvidedEntries.reduce(
          (sum, entry) => sum + entry.count,
          0
        );

        // Only proceed if we have entries to combine
        if (totalCount > 0) {
          // Calculate weighted average score
          const weightedAvgScore =
            notProvidedEntries.reduce(
              (sum, entry) => sum + entry.avgScore * entry.count,
              0
            ) / totalCount;

          // Estimate median score
          const weightedMedianScore =
            notProvidedEntries.reduce(
              (sum, entry) => sum + (entry.medianScore || 0) * entry.count,
              0
            ) / totalCount;

          // Add "Prefer not to say" entry (renamed from "Not Provided")
          normalEntries.push({
            _id: "prefer_not_to_say_living",
            count: totalCount,
            avgScore: Math.round(weightedAvgScore * 100) / 100,
            medianScore: Math.round(weightedMedianScore),
          });
        }
      }

      // Include Unknown entries only if showNotProvided is true
      return showNotProvided
        ? [...normalEntries, ...unknownEntries]
        : normalEntries;
    }

    return filteredStats;
  };

  // Get the filtered stats
  const filteredGenderStats = filterStats(genderStats, "gender");
  const filteredSchoolStats = filterStats(schoolStats, "school").sort(
    (a, b) => {
      // Put "Unknown" at the very end
      if (a._id === "Not Provided") return 1;
      if (b._id === "Not Provided") return -1;

      // Put "Prefer not to say" right after "Other"
      if (a._id === "prefer_not_to_say_school" && b._id === "Other") return 1;
      if (b._id === "prefer_not_to_say_school" && a._id === "Other") return -1;

      // Put "Prefer not to say" before all other non-"Other" items
      if (a._id === "prefer_not_to_say_school") return 1;
      if (b._id === "prefer_not_to_say_school") return -1;

      // Put "Other" after regular entries but before "Prefer not to say" and "Unknown"
      if (a._id === "Other") return 1;
      if (b._id === "Other") return -1;

      // Sort remaining schools by count (descending)
      return b.count - a.count;
    }
  );
  const filteredYearStats = filterStats(yearStats, "year");
  const filteredLivingStats = filterStats(livingStats, "living");
  const filteredRaceStats = filterStats(raceStats, "race").sort((a, b) => {
    // Put "Unknown" at the very end
    if (a._id === "Not Provided") return 1;
    if (b._id === "Not Provided") return -1;

    // Put "Prefer not to say" right after "Other"
    if (a._id === "prefer_not_to_say_combined" && b._id === "Other") return 1;
    if (b._id === "prefer_not_to_say_combined" && a._id === "Other") return -1;

    // Put "Prefer not to say" before all other non-"Other" items
    if (a._id === "prefer_not_to_say_combined") return 1;
    if (b._id === "prefer_not_to_say_combined") return -1;

    // Put "Other" after regular entries but before "Prefer not to say" and "Unknown"
    if (a._id === "Other") return 1;
    if (b._id === "Other") return -1;

    // Sort remaining races by count (descending)
    return b.count - a.count;
  });
  const filteredRelationshipStats = filterStats(
    relationshipStats,
    "relationship"
  );

  // Helper function to format display names for demographic categories
  const formatDisplayName = (name: string | null | undefined): string => {
    if (
      name === "not_provided" ||
      name === null ||
      name === undefined ||
      name === "null"
    )
      return "Not Provided";
    if (name === "Not Provided") return "Unknown";
    if (name === "prefer_not_to_say_combined") return "Prefer not to say";
    if (name === "prefer_not_to_say_year") return "Prefer not to say";
    if (name === "prefer_not_to_say_living") return "Prefer not to say";
    if (name === "prefer_not_to_say_school") return "Prefer not to say";
    if (name === "middle_eastern") return "Middle Eastern";
    return name;
  };

  // Calculate totals for filtered data (for percentage calculations)
  const getFilteredTotal = (stats: DemographicStat[]) => {
    return stats.reduce((total, stat) => total + stat.count, 0);
  };

  const filteredGenderTotal = getFilteredTotal(filteredGenderStats);
  const filteredSchoolTotal = getFilteredTotal(filteredSchoolStats);
  const filteredYearTotal = getFilteredTotal(filteredYearStats);
  const filteredLivingTotal = getFilteredTotal(filteredLivingStats);
  const filteredRaceTotal = getFilteredTotal(filteredRaceStats);
  const filteredRelationshipTotal = getFilteredTotal(filteredRelationshipStats);

  return (
    <>
      {/* Toggle Switch for Unknown Data */}
      {/* <div className="flex justify-center mb-6 text-black">
        <div className="flex flex-col gap-2 items-center mt-8 mb-4">
          <span className="font-serif">
            {showNotProvided ? "Including " : "Excluding "}
            responses with demographic data that is unknown or not provided
          </span>
          <button
            onClick={() => setShowNotProvided(!showNotProvided)}
            className="px-4 py-2 font-bold text-white whitespace-nowrap bg-[#57068C] rounded-full hover:bg-[#7A29A1] transition-colors"
          >
            {showNotProvided ? "Hide Unknown Responses" : "Show All Responses"}
          </button>
        </div>
      </div> */}

      {/* Score by Gender */}
      <section className="mb-10 text-xs text-black lg:text-base">
        <h2 className="inline-block mb-6 font-serif text-xl font-bold border-b-2 border-black">
          Scores by Gender
        </h2>
        <div className="overflow-x-auto">
          <table className="overflow-hidden w-full bg-white rounded-xl shadow-sm border-collapse">
            <thead className="bg-[#57068C] text-white">
              <tr>
                <th className="p-2 font-serif text-center">Gender</th>
                <th className="p-2 font-serif text-center whitespace-nowrap">
                  % of Submissions
                </th>
                <th className="p-2 font-serif text-center">Average Score</th>
              </tr>
            </thead>
            <tbody className="text-[#57068C]">
              {filteredGenderStats.map((gender, index) => (
                <tr
                  key={gender._id}
                  className={index % 2 === 0 ? "bg-white" : "bg-[#f8f5e6]"}
                >
                  <td className="p-2 capitalize font-serif border-t border-[#f0e9d2]">
                    {formatDisplayName(gender._id)}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {filteredGenderTotal > 0
                      ? `${Math.round(
                          (gender.count / filteredGenderTotal) * 100
                        )}%`
                      : "0%"}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {gender.avgScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Score by School */}
      <section className="mb-10 text-xs text-black lg:text-base">
        <h2 className="inline-block mb-6 font-serif text-xl font-bold border-b-2 border-black">
          Scores by School
        </h2>
        <div className="overflow-x-auto">
          <table className="overflow-hidden w-full bg-white rounded-xl shadow-sm border-collapse">
            <thead className="bg-[#57068C] text-white">
              <tr>
                <th className="p-2 font-serif text-center">School</th>
                <th className="p-2 font-serif text-center whitespace-nowrap">
                  % of Submissions
                </th>
                <th className="p-2 font-serif text-center">Average Score</th>
              </tr>
            </thead>
            <tbody className="text-[#57068C]">
              {filteredSchoolStats.map((school, index) => (
                <tr
                  key={school._id}
                  className={index % 2 === 0 ? "bg-white" : "bg-[#f8f5e6]"}
                >
                  <td className="p-2 capitalize font-serif border-t border-[#f0e9d2]">
                    {formatDisplayName(school._id)}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {filteredSchoolTotal > 0
                      ? `${Math.round(
                          (school.count / filteredSchoolTotal) * 100
                        )}%`
                      : "0%"}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {school.avgScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Score by Year */}
      <section className="mb-10 text-xs text-black lg:text-base">
        <h2 className="inline-block mb-6 font-serif text-xl font-bold border-b-2 border-black">
          Scores by Year
        </h2>
        <div className="overflow-x-auto">
          <table className="overflow-hidden w-full bg-white rounded-xl shadow-sm border-collapse">
            <thead className="bg-[#57068C] text-white">
              <tr>
                <th className="p-2 font-serif text-center">Year</th>
                <th className="p-2 font-serif text-center whitespace-nowrap">
                  % of Submissions
                </th>
                <th className="p-2 font-serif text-center">Average Score</th>
              </tr>
            </thead>
            <tbody className="text-[#57068C]">
              {filteredYearStats.map((year, index) => (
                <tr
                  key={year._id}
                  className={index % 2 === 0 ? "bg-white" : "bg-[#f8f5e6]"}
                >
                  <td className="p-2 capitalize font-serif border-t border-[#f0e9d2]">
                    {formatDisplayName(year._id)}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {filteredYearTotal > 0
                      ? `${Math.round((year.count / filteredYearTotal) * 100)}%`
                      : "0%"}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {year.avgScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Score by Living Situation */}
      <section className="mb-10 text-xs text-black lg:text-base">
        <h2 className="inline-block mb-6 font-serif text-xl font-bold border-b-2 border-black">
          Scores by Living Situation
        </h2>
        <div className="overflow-x-auto">
          <table className="overflow-hidden w-full bg-white rounded-xl shadow-sm border-collapse">
            <thead className="bg-[#57068C] text-white">
              <tr>
                <th className="p-2 font-serif text-center">Living Situation</th>
                <th className="p-2 font-serif text-center whitespace-nowrap">
                  % of Submissions
                </th>
                <th className="p-2 font-serif text-center">Average Score</th>
              </tr>
            </thead>
            <tbody className="text-[#57068C]">
              {filteredLivingStats.map((living, index) => (
                <tr
                  key={living._id}
                  className={index % 2 === 0 ? "bg-white" : "bg-[#f8f5e6]"}
                >
                  <td className="p-2 capitalize font-serif border-t border-[#f0e9d2]">
                    {formatDisplayName(living._id)}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {filteredLivingTotal > 0
                      ? `${Math.round(
                          (living.count / filteredLivingTotal) * 100
                        )}%`
                      : "0%"}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {living.avgScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Score by Race/Ethnicity */}
      <section className="mb-10 text-xs text-black lg:text-base">
        <h2 className="inline-block mb-6 font-serif text-xl font-bold border-b-2 border-black">
          Scores by Race/Ethnicity
        </h2>
        <div className="overflow-x-auto">
          <table className="overflow-hidden w-full bg-white rounded-xl shadow-sm border-collapse">
            <thead className="bg-[#57068C] text-white">
              <tr>
                <th className="p-2 font-serif text-center">Race/Ethnicity</th>
                <th className="p-2 font-serif text-center whitespace-nowrap">
                  % of Submissions
                </th>
                <th className="p-2 font-serif text-center">Average Score</th>
              </tr>
            </thead>
            <tbody className="text-[#57068C]">
              {filteredRaceStats.map((race, index) => (
                <tr
                  key={race._id}
                  className={index % 2 === 0 ? "bg-white" : "bg-[#f8f5e6]"}
                >
                  <td className="p-2 capitalize font-serif border-t border-[#f0e9d2]">
                    {formatDisplayName(race._id)}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {filteredRaceTotal > 0
                      ? `${Math.round((race.count / filteredRaceTotal) * 100)}%`
                      : "0%"}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {race.avgScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Score by Relationship Status */}
      <section className="mb-10 text-xs text-black lg:text-base">
        <h2 className="inline-block mb-6 font-serif text-xl font-bold border-b-2 border-black">
          Scores by Relationship Status
        </h2>
        <div className="overflow-x-auto">
          <table className="overflow-hidden w-full bg-white rounded-xl shadow-sm border-collapse">
            <thead className="bg-[#57068C] text-white">
              <tr>
                <th className="p-2 font-serif text-center">
                  Relationship Status
                </th>
                <th className="p-2 font-serif text-center whitespace-nowrap">
                  % of Submissions
                </th>
                <th className="p-2 font-serif text-center">Average Score</th>
              </tr>
            </thead>
            <tbody className="text-[#57068C]">
              {filteredRelationshipStats.map((relationship, index) => (
                <tr
                  key={relationship._id}
                  className={index % 2 === 0 ? "bg-white" : "bg-[#f8f5e6]"}
                >
                  <td className="p-2 capitalize font-serif border-t border-[#f0e9d2]">
                    {formatDisplayName(relationship._id)}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {filteredRelationshipTotal > 0
                      ? `${Math.round(
                          (relationship.count / filteredRelationshipTotal) * 100
                        )}%`
                      : "0%"}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {relationship.avgScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
