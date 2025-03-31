import { notFound } from "next/navigation";
import connectToDatabase from "../lib/mongodb";
import Result from "../models/Result";
import { purityQuestions } from "../constants/questions";
import Link from "next/link";
import Image from "next/image";

// Function to calculate basic statistics
async function calculateStats() {
  await connectToDatabase();

  // Get total submissions count
  const totalSubmissions = await Result.countDocuments({});

  // Get average score (rounded to 2 decimal places)
  const averageScoreResult = await Result.aggregate([
    { $group: { _id: null, averageScore: { $avg: "$score" } } },
  ]);
  const averageScore =
    averageScoreResult.length > 0
      ? Math.round(averageScoreResult[0].averageScore * 100) / 100
      : 0;

  // Get median score
  const allScores = await Result.find({}, { score: 1, _id: 0 }).sort({
    score: 1,
  });
  const scores = allScores.map((item) => item.score);
  let medianScore = 0;

  if (scores.length > 0) {
    const mid = Math.floor(scores.length / 2);
    medianScore =
      scores.length % 2 === 0
        ? (scores[mid - 1] + scores[mid]) / 2
        : scores[mid];
  }

  // Get score distribution in ranges (0-10, 11-20, etc.)
  const scoreDistribution = [];
  for (let i = 0; i < 10; i++) {
    const min = i * 10;
    const max = min + 10;
    const count = await Result.countDocuments({
      score: { $gte: min, $lt: max < 100 ? max : 101 },
    });
    scoreDistribution.push({
      range: `${min}-${max === 100 ? "100" : max - 1}`,
      count,
    });
  }

  // Get question stats (percentage of "yes" answers for each question)
  const questionStats = [];
  for (let i = 0; i < 100; i++) {
    // Using MongoDB to count documents where the specific answer is true
    const query: { [key: string]: boolean } = {};
    query[`answers.${i}`] = true;
    const yesCount = await Result.countDocuments(query);

    questionStats.push({
      questionId: i,
      question: purityQuestions[i],
      yesPercentage:
        totalSubmissions > 0
          ? Math.round((yesCount / totalSubmissions) * 100)
          : 0,
      totalResponses: yesCount,
    });
  }

  // Get device type distribution
  const deviceStats = await Result.aggregate([
    { $group: { _id: "$deviceType", count: { $sum: 1 } } },
  ]);

  // Sort question stats by yes percentage (most common "yes" answers first)
  questionStats.sort((a, b) => b.yesPercentage - a.yesPercentage);

  return {
    totalSubmissions,
    averageScore,
    medianScore,
    scoreDistribution,
    deviceStats,
    questionStats: questionStats.slice(0, 10), // Only return top 10 for efficiency
  };
}

export default async function StatisticsPage() {
  // Get environment and submission count
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";

  try {
    const stats = await calculateStats();

    // In production, require at least 1500 submissions
    if (isProduction && stats.totalSubmissions < 1500) {
      return notFound();
    }

    return (
      <main className="mx-auto max-w-3xl">
        {/* Main content container */}
        <div className="bg-[#fcf6e3] text-center shadow-lg rounded-2xl overflow-hidden  border-2 border-[#f0d37d]">
          {/* Header with Logo */}
          <div className="flex overflow-hidden justify-center items-center p-0 bg-transparent">
            <div className="relative w-full max-w-[550px] mt-8 h-[200px] mx-auto">
              <Image
                src="/images/bannerCropped.png"
                alt="NYU Purity Test"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>
          <div className="p-8">
            <h1 className="font-serif text-3xl font-bold mb-6 text-[#57068C]">
              Statistics
            </h1>

            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 font-bold text-white bg-[#57068C] rounded-full hover:bg-[#7A29A1] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
            </div>

            {/* Overview Cards */}
            <section className="mb-10 text-black">
              <h2 className="inline-block mb-6 font-serif text-xl font-bold border-b-2 border-black">
                Overview
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm">
                  <p className="font-serif text-lg font-semibold text-[#57068C]">
                    Total Submissions
                  </p>
                  <p className="font-serif text-4xl font-bold text-[#57068C]">
                    {stats.totalSubmissions.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm">
                  <p className="font-serif text-lg font-semibold text-[#57068C]">
                    Average Score
                  </p>
                  <p className="font-serif text-4xl font-bold text-[#57068C]">
                    {stats.averageScore}
                  </p>
                </div>
                <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm">
                  <p className="font-serif text-lg font-semibold text-[#57068C]">
                    Median Score
                  </p>
                  <p className="font-serif text-4xl font-bold text-[#57068C]">
                    {stats.medianScore}
                  </p>
                </div>
              </div>
            </section>

            {/* Score Distribution */}
            <section className="mb-10 text-black">
              <h2 className="inline-block mb-6 font-serif text-xl font-bold border-b-2 border-black">
                Score Distribution
              </h2>
              <div className="overflow-x-auto">
                <table className="overflow-hidden w-full bg-white rounded-xl shadow-sm border-collapse">
                  <thead className="bg-[#57068C] text-white">
                    <tr>
                      <th className="p-3 font-serif text-left">Score Range</th>
                      <th className="p-3 font-serif text-left">Count</th>
                      <th className="p-3 font-serif text-left">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.scoreDistribution.map((range, index) => (
                      <tr
                        key={range.range}
                        className={
                          index % 2 === 0 ? "bg-white" : "bg-[#f8f5e6]"
                        }
                      >
                        <td className="p-3 font-serif border-t border-[#f0e9d2]">
                          {range.range}
                        </td>
                        <td className="p-3 font-serif border-t border-[#f0e9d2]">
                          {range.count.toLocaleString()}
                        </td>
                        <td className="p-3 font-serif border-t border-[#f0e9d2]">
                          {stats.totalSubmissions > 0
                            ? `${Math.round(
                                (range.count / stats.totalSubmissions) * 100
                              )}%`
                            : "0%"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Device Distribution */}
            <section className="mb-10 text-black">
              <h2 className="inline-block mb-6 font-serif text-xl font-bold border-b-2 border-black">
                Device Distribution
              </h2>
              <div className="overflow-x-auto">
                <table className="overflow-hidden w-full bg-white rounded-xl shadow-sm border-collapse">
                  <thead className="bg-[#57068C] text-white">
                    <tr>
                      <th className="p-3 font-serif text-left">Device Type</th>
                      <th className="p-3 font-serif text-left">Count</th>
                      <th className="p-3 font-serif text-left">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.deviceStats.map((device, index) => (
                      <tr
                        key={device._id}
                        className={
                          index % 2 === 0 ? "bg-white" : "bg-[#f8f5e6]"
                        }
                      >
                        <td className="p-3 capitalize font-serif border-t border-[#f0e9d2]">
                          {device._id}
                        </td>
                        <td className="p-3 font-serif border-t border-[#f0e9d2]">
                          {device.count.toLocaleString()}
                        </td>
                        <td className="p-3 font-serif border-t border-[#f0e9d2]">
                          {stats.totalSubmissions > 0
                            ? `${Math.round(
                                (device.count / stats.totalSubmissions) * 100
                              )}%`
                            : "0%"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Top 10 Most Common "Yes" Answers */}
            <section className="mb-6 text-black">
              <h2 className="inline-block mb-6 font-serif text-xl font-bold border-b-2 border-black">
                Top 10 Most Common "Yes" Answers
              </h2>
              <div className="overflow-x-auto">
                <table className="overflow-hidden w-full bg-white rounded-xl shadow-sm border-collapse">
                  <thead className="bg-[#57068C] text-white">
                    <tr>
                      <th className="p-3 font-serif text-left">Question</th>
                      <th className="p-3 font-serif text-left">Yes %</th>
                      <th className="p-3 font-serif text-left">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.questionStats.map((question, index) => (
                      <tr
                        key={question.questionId}
                        className={
                          index % 2 === 0 ? "bg-white" : "bg-[#f8f5e6]"
                        }
                      >
                        <td className="p-3 font-serif text-left border-t border-[#f0e9d2]">
                          {question.questionId + 1}. {question.question}
                        </td>
                        <td className="p-3 font-serif border-t border-[#f0e9d2]">
                          {question.yesPercentage}%
                        </td>
                        <td className="p-3 font-serif border-t border-[#f0e9d2]">
                          {question.totalResponses.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Take Test Again Button */}
            <div className="mt-10">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 font-bold text-white bg-[#57068C] rounded-full hover:bg-[#7A29A1] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 2v6h-6M21 16a9 9 0 1 1-3-14.5" />
                </svg>
                Take Test Again
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 text-xs text-black bg-[#fcf6e3] border-t border-[#f0e9d2]">
            <p>
              Based on the Rice Purity Test. Made for NYU students, by NYU
              students.
            </p>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error loading statistics:", error);
    return (
      <main className="p-6 mx-auto max-w-3xl">
        <div className="bg-[#fcf6e3] text-center shadow-md border-2 border-[#fcefc7] rounded-2xl overflow-hidden">
          <div className="p-8">
            <h1 className="font-serif text-3xl font-bold mb-6 text-[#57068C]">
              Error Loading Statistics
            </h1>
            <p className="mb-8 font-serif text-lg">
              There was an error loading the statistics. Please try again later.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 font-bold text-white bg-[#57068C] rounded-full hover:bg-[#7A29A1] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 text-xs text-black bg-[#fcf6e3] border-t border-[#f0e9d2]">
            <p>
              Based on the Rice Purity Test. Made for NYU students, by NYU
              students.
            </p>
          </div>
        </div>
      </main>
    );
  }
}
