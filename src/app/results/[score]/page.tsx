import { notFound } from "next/navigation";
import ResultsDisplay from "../../components/ResultsDisplay";
import { Metadata } from "next";
import Feedback from "../../components/Feedback";
import { cookies } from "next/headers";
import connectToDatabase from "../../lib/mongodb";
import Result from "../../models/Result";

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

  // Try to retrieve the result ID and demographics from cookies
  const cookieStore = cookies();
  const resultIdCookie = cookieStore.get("resultId");
  let resultId = resultIdCookie ? resultIdCookie.value : undefined;
  let demographics = undefined;
  let deviceType = undefined;

  // If resultId cookie exists, try to fetch the demographic information
  if (resultId) {
    try {
      await connectToDatabase();
      const result = await Result.findById(resultId);

      if (result) {
        // Extract demographic information
        demographics = {
          gender: result.gender || undefined,
          school: result.school || undefined,
          year: result.year || undefined,
          living: result.living || undefined,
        };
        deviceType = result.deviceType;
      } else {
        // If result not found, clear the cookie
        resultId = undefined;
      }
    } catch (error) {
      console.error("Error fetching result:", error);
      // If there's an error, don't pass the data
      resultId = undefined;
      demographics = undefined;
      deviceType = undefined;
    }
  }

  return (
    <main>
      <ResultsDisplay score={score} />
      <Feedback
        score={score}
        resultId={resultId}
        demographics={demographics}
        deviceType={deviceType}
      />
    </main>
  );
}
