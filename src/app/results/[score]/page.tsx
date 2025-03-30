import { notFound } from "next/navigation";
import ResultsDisplay from "@/app/components/ResultsDisplay";
import { Metadata } from "next";

type Props = {
  params: Promise<{ score: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const score = parseInt(resolvedParams.score);

  if (isNaN(score) || score < 0 || score > 100) {
    return {
      title: "Invalid Score - NYU/NYC Purity Test",
    };
  }

  return {
    title: `Score: ${score} - NYU/NYC Purity Test`,
    description: `I scored ${score} on the NYU/NYC Purity Test! See how pure you are!`,
    openGraph: {
      title: `I scored ${score} on the NYU/NYC Purity Test!`,
      description: "Take the NYU/NYC Purity Test to see how pure you are!",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `I scored ${score} on the NYU/NYC Purity Test!`,
      description: "Take the NYU/NYC Purity Test to see how pure you are!",
    },
  };
}

export default async function ResultsPage({ params }: Props) {
  const resolvedParams = await params;
  const score = parseInt(resolvedParams.score);

  if (isNaN(score) || score < 0 || score > 100) {
    notFound();
  }

  return (
    <main>
      <ResultsDisplay score={score} />
    </main>
  );
}
