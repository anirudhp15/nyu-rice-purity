"use client";

import { useState } from "react";

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
  const [showNotProvided, setShowNotProvided] = useState(true);

  // Filter stats based on toggle state
  const filterStats = (stats: DemographicStat[]) => {
    if (showNotProvided) return stats;
    return stats.filter(
      (stat) =>
        stat._id !== "Not Provided" &&
        stat._id !== "not_provided" &&
        stat._id !== null &&
        stat._id !== "null"
    );
  };

  // Get the filtered stats
  const filteredGenderStats = filterStats(genderStats);
  const filteredSchoolStats = filterStats(schoolStats);
  const filteredYearStats = filterStats(yearStats);
  const filteredLivingStats = filterStats(livingStats);
  const filteredRaceStats = filterStats(raceStats);
  const filteredRelationshipStats = filterStats(relationshipStats);

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
      <div className="flex justify-center mb-6 text-black">
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
      </div>

      {/* Score by Gender */}
      <section className="mb-10 text-xs text-black lg:text-base">
        <h2 className="inline-block mb-6 font-serif text-xl font-bold border-b-2 border-black">
          Scores by Gender
        </h2>
        <div className="overflow-x-auto">
          <table className="overflow-hidden w-full bg-white rounded-xl shadow-sm border-collapse">
            <thead className="bg-[#57068C] text-white">
              <tr>
                <th className="p-2 font-serif text-left">Gender</th>
                <th className="p-2 font-serif text-left">Count</th>
                <th className="p-2 font-serif text-left">%</th>
                <th className="p-2 font-serif text-left">Average Score</th>
                <th className="p-2 font-serif text-left">Median Score</th>
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
                    {gender.count.toLocaleString()}
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
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {gender.medianScore}
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
                <th className="p-2 font-serif text-left">School</th>
                <th className="p-2 font-serif text-left">Count</th>
                <th className="p-2 font-serif text-left">%</th>
                <th className="p-2 font-serif text-left">Average Score</th>
                <th className="p-2 font-serif text-left">Median Score</th>
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
                    {school.count.toLocaleString()}
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
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {school.medianScore}
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
                <th className="p-2 font-serif text-left">Year</th>
                <th className="p-2 font-serif text-left">Count</th>
                <th className="p-2 font-serif text-left">%</th>
                <th className="p-2 font-serif text-left">Average Score</th>
                <th className="p-2 font-serif text-left">Median Score</th>
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
                    {year.count.toLocaleString()}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {filteredYearTotal > 0
                      ? `${Math.round((year.count / filteredYearTotal) * 100)}%`
                      : "0%"}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {year.avgScore}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {year.medianScore}
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
                <th className="p-2 font-serif text-left">Living Situation</th>
                <th className="p-2 font-serif text-left">Count</th>
                <th className="p-2 font-serif text-left">%</th>
                <th className="p-2 font-serif text-left">Average Score</th>
                <th className="p-2 font-serif text-left">Median Score</th>
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
                    {living.count.toLocaleString()}
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
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {living.medianScore}
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
                <th className="p-2 font-serif text-left">Race/Ethnicity</th>
                <th className="p-2 font-serif text-left">Count</th>
                <th className="p-2 font-serif text-left">%</th>
                <th className="p-2 font-serif text-left">Average Score</th>
                <th className="p-2 font-serif text-left">Median Score</th>
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
                    {race.count.toLocaleString()}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {filteredRaceTotal > 0
                      ? `${Math.round((race.count / filteredRaceTotal) * 100)}%`
                      : "0%"}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {race.avgScore}
                  </td>
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {race.medianScore}
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
                <th className="p-2 font-serif text-left">
                  Relationship Status
                </th>
                <th className="p-2 font-serif text-left">Count</th>
                <th className="p-2 font-serif text-left">%</th>
                <th className="p-2 font-serif text-left">Average Score</th>
                <th className="p-2 font-serif text-left">Median Score</th>
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
                    {relationship.count.toLocaleString()}
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
                  <td className="p-2 font-serif border-t border-[#f0e9d2]">
                    {relationship.medianScore}
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
