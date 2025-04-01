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
      // Send feedback through our API route with all user information
      const response = await fetch("/api/send-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          feedback,
          score,
          resultId, // Include the resultId if available
          demographics, // Include demographic information if available
          deviceType, // Include device type if available
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send feedback");
      }

      setIsSubmitted(true);
      setFeedback("");
      setEmail("");
    } catch (err) {
      console.error("Failed to send feedback:", err);
      setError("Failed to send feedback. Please try again later.");
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
        className="p-4 bg-[#fcf6e3] rounded-xl shadow-sm border border-[#f0d37d]"
      >
        <h3 className="mb-3 font-serif font-bold text-black text-md">
          Share Your Feedback
        </h3>

        {isSubmitted ? (
          <p className="font-serif text-sm text-[#57068C]">
            Thank you for your feedback! We appreciate your input.
          </p>
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
          Thanks for helping improve the NYUPT—we appreciate it!
        </p>
      </motion.div>
    </div>
  );
}
