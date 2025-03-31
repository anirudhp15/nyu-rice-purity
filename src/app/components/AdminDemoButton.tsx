"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { trackEvents } from "../lib/analytics";
import { useRouter } from "next/navigation";

// This function is copied from src/app/results/[score]/page.tsx for consistency
function encodeScore(score: number): string {
  // Base64 encode and add some random-looking characters
  const encoded = Buffer.from(`s${score}`).toString("base64");
  // Replace characters that would make URLs problematic
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export default function AdminDemoButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [demoScore, setDemoScore] = useState(50);
  const router = useRouter();

  useEffect(() => {
    // Only show in development mode
    const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === "development";
    setIsVisible(isDevelopment);
  }, []);

  // If not in development mode, don't render anything
  if (!isVisible) {
    return null;
  }

  // Get an encoded score for the demo
  const encodedScore = encodeScore(demoScore);

  const handleViewDemo = () => {
    // Track that demo results were viewed
    trackEvents.demoResultsViewed(demoScore);

    // Navigate to the results page
    router.push(`/results/${encodedScore}`);
  };

  return (
    <div className="fixed right-8 bottom-8 z-50">
      <div className="p-4 bg-white rounded-lg border-2 border-red-500 shadow-lg">
        <h3 className="mb-2 text-lg font-bold text-red-600">
          Admin: Demo Mode
        </h3>
        <p className="mb-3 text-sm text-gray-700">
          Show a demo results page without saving to database
        </p>

        <div className="mb-3">
          <label
            htmlFor="demoScore"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Demo Score (0-100):
          </label>
          <input
            type="number"
            id="demoScore"
            className="p-2 w-full rounded border"
            min="0"
            max="100"
            value={demoScore}
            onChange={(e) => setDemoScore(Number(e.target.value))}
          />
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button
            onClick={handleViewDemo}
            className="block px-4 py-2 w-full text-center text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
          >
            View Demo Results
          </button>
        </motion.div>

        <div className="mt-2 text-xs italic text-gray-500">
          *Only visible in development
        </div>
      </div>
    </div>
  );
}
