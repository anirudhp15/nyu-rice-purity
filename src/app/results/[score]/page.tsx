import { notFound } from "next/navigation";
import ResultsDisplay from "@/app/components/ResultsDisplay";
import { Metadata } from "next";

type Props = {
  params: Promise<{ score: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
};

// Simple encoding/decoding functions
function encodeScore(score: number): string {
  // Base64 encode and add some random-looking characters
  const encoded = Buffer.from(`s${score}`).toString("base64");
  // Replace characters that would make URLs problematic
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function decodeScore(encoded: string): number | null {
  try {
    // Restore base64 standard characters
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    // Decode
    const decoded = Buffer.from(padded, "base64").toString();

    // Extract score (should start with 's' followed by the number)
    if (decoded.startsWith("s")) {
      const score = parseInt(decoded.substring(1), 10);

      // Validate the score
      if (!isNaN(score) && score >= 0 && score <= 100) {
        return score;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Validate an encoded score
function validateEncodedScore(encodedScore: string): number | null {
  return decodeScore(encodedScore);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const score = validateEncodedScore(resolvedParams.score);

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
  const score = validateEncodedScore(resolvedParams.score);

  if (score === null) {
    notFound();
  }

  return (
    <main>
      <ResultsDisplay score={score} />
    </main>
  );
}
