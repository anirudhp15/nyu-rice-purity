import { notFound } from "next/navigation";
import ResultsDisplay from "@/app/components/ResultsDisplay";
import { Metadata } from "next";

type Props = {
  params: Promise<{ score: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
};

// Validate a score to ensure it's an integer between 0-100
function validateScore(score: string): number | null {
  // Check if the score is a valid number
  const parsedScore = parseInt(score, 10);

  // Ensure it's a valid integer between 0-100
  if (
    isNaN(parsedScore) ||
    parsedScore < 0 ||
    parsedScore > 100 ||
    parsedScore.toString() !== score
  ) {
    return null;
  }

  return parsedScore;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const score = validateScore(resolvedParams.score);

  if (score === null) {
    return {
      title: "Invalid Score - NYU Purity Test",
    };
  }

  return {
    title: `Score: ${score} - NYU Purity Test`,
    description: `I scored ${score} on the NYU Purity Test! See how pure you are`,
    openGraph: {
      title: `I scored ${score} on the NYU Purity Test!`,
      description: "Take the NYU Purity Test to see how pure you are",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `I scored ${score} on the NYU Purity Test!`,
      description: "Take the NYU Purity Test to see how pure you are",
    },
  };
}

export default async function ResultsPage({ params }: Props) {
  const resolvedParams = await params;
  const score = validateScore(resolvedParams.score);

  if (score === null) {
    notFound();
  }

  return (
    <main>
      <ResultsDisplay score={score} />
    </main>
  );
}
