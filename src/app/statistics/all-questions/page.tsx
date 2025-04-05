import { notFound } from "next/navigation";
import connectToDatabase from "../../lib/mongodb";
import Result from "../../models/Result";
import { purityQuestions } from "../../constants/questions";
import Link from "next/link";
import Image from "next/image";

// Function to calculate question statistics
async function calculateQuestionStats() {
  await connectToDatabase();

  // Get total submissions count
  const totalSubmissions = await Result.countDocuments({});

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

  // Sort question stats by yes percentage (most common "yes" answers first)
  questionStats.sort((a, b) => b.yesPercentage - a.yesPercentage);

  return {
    totalSubmissions,
    questionStats,
  };
}

export default async function AllQuestionsPage() {
  // Get environment
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";

  try {
    const stats = await calculateQuestionStats();

    // In production, require at least 2025 submissions
    if (isProduction && stats.totalSubmissions < 2025) {
      return notFound();
    }

    return (
      <main className="mx-auto max-w-5xl">
        {/* Main content container */}
        <div className="bg-[#fcf6e3] text-center shadow-lg rounded-2xl overflow-hidden border-2 border-[#f0d37d]">
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
              All Question Statistics
            </h1>

            <div className="mb-8">
              <Link
                href="/statistics"
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
                Back to Statistics
              </Link>
            </div>

            {/* All 100 Questions with "Yes" Percentages */}
            <section className="mb-6 text-black">
              <h2 className="inline-block mb-6 font-serif text-xl font-bold border-b-2 border-black">
                All Questions Ranked by "Yes" Percentage
              </h2>
              <div className="overflow-x-auto text-xs lg:text-base">
                <table className="overflow-hidden w-full bg-white rounded-xl shadow-sm border-collapse">
                  <thead className="bg-[#57068C] text-white">
                    <tr>
                      <th className="p-3 font-serif text-left">Rank</th>
                      <th className="p-3 font-serif text-left">Question</th>
                      <th className="p-3 font-serif text-left whitespace-nowrap">
                        Yes %
                      </th>
                      <th className="p-3 font-serif text-left">Count</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#57068C]">
                    {stats.questionStats.map((question, index) => (
                      <tr
                        key={question.questionId}
                        className={
                          index % 2 === 0 ? "bg-white" : "bg-[#f8f5e6]"
                        }
                      >
                        <td className="p-3 font-serif text-left border-t border-[#f0e9d2]">
                          {index + 1}
                        </td>
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

            {/* Back to Statistics Button */}
            <div className="mt-10">
              <Link
                href="/statistics"
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
                Back to Statistics
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
    console.error("Error loading question statistics:", error);
    return (
      <main className="p-6 mx-auto max-w-5xl">
        <div className="bg-[#fcf6e3] text-center shadow-md border-2 border-[#fcefc7] rounded-2xl overflow-hidden">
          <div className="p-8">
            <h1 className="font-serif text-3xl font-bold mb-6 text-[#57068C]">
              Error Loading Statistics
            </h1>
            <p className="mb-8 font-serif text-lg text-black">
              There was an error loading the question statistics. Please try
              again later.
            </p>
            <div className="mt-8">
              <Link
                href="/statistics"
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
                Back to Statistics
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 text-xs text-black bg-[#fcf6e3] border-t border-[#f0e9d2]">
            <p>
              Based on the Rice Purity Test. Made for NYU students, by NYU
              students. Not NYU affiliated.
            </p>
            <p className="mt-1 text-[10px] text-gray-500">
              <Link
                href="/privacy-policy"
                className="hover:text-[#57068C] hover:underline transition-colors"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>
    );
  }
}
