"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface FeedbackProps {
  score: number;
  resultId?: string; // MongoDB ObjectId of the result
  demographics?: {
    gender?: string;
    school?: string;
    year?: string;
    living?: string;
  };
  deviceType?: string;
}

export default function Feedback({
  score,
  resultId,
  demographics,
  deviceType,
}: FeedbackProps) {
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (feedback.trim() === "") {
      setError("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Save feedback to MongoDB
      const response = await fetch("/api/save-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          feedback,
          score,
          resultId,
          demographics,
          deviceType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save feedback");
      }

      // Success! Show confirmation message
      setIsSubmitted(true);
      setFeedback("");
      setEmail("");
    } catch (err) {
      console.error("Failed to save feedback:", err);
      setError("Failed to save feedback. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 mb-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 bg-[#fcf6e3] flex flex-col items-center rounded-xl shadow-sm border border-[#f0d37d]"
      >
        <h3 className="inline-block mb-4 font-serif text-lg font-bold text-black border-b-2 border-black">
          Share Your Feedback
        </h3>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="py-6 text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-4 w-16 h-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-serif text-lg font-bold text-[#57068C]">
              Feedback submitted!
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <textarea
                placeholder="What did you think of the test? Any suggestions for improvement?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="p-2 w-full h-24 font-serif text-sm text-black bg-white rounded border border-[#f0d37d] focus:outline-none focus:ring-2 focus:ring-[#57068C]"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Your email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 w-full font-serif text-sm text-black bg-white rounded border border-[#f0d37d] focus:outline-none focus:ring-2 focus:ring-[#57068C]"
              />
            </div>

            {error && (
              <p className="font-serif text-xs text-red-500">{error}</p>
            )}

            <div className="flex justify-center">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 font-serif text-xs font-bold text-white bg-[#57068C] rounded-full hover:bg-[#7A29A1] disabled:opacity-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? "Sending..." : "Send Feedback"}
              </motion.button>
            </div>
          </form>
        )}

        <p className="mt-4 w-full font-serif text-xs text-center text-gray-600">
          We appreciate your help in improving the NYUPT.
        </p>
      </motion.div>
    </div>
  );
}
