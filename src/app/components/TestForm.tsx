"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { purityQuestions } from "@/app/constants/questions";
import { trackEvents } from "@/app/lib/analytics";

export default function TestForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<boolean[]>(new Array(100).fill(false));
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Track that user started the test
    trackEvents.testStarted();
  }, []);

  const handleCheckboxChange = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = !newAnswers[index];
    setAnswers(newAnswers);

    // Track that user answered a question
    trackEvents.questionAnswered(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/submit-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit test");
      }

      const data = await response.json();

      // Track that user completed the test
      trackEvents.testCompleted(data.score);

      router.push(`/results/${data.score}`);
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Error submitting test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-4 md:p-8">
      <h1 className="text-heading font-bold text-center mb-4">
        NYU/NYC Purity Test
      </h1>
      <p className="text-body mb-6 text-center">
        Check all the statements that apply to you.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-sectionGap">
          {purityQuestions.map((question, index) => (
            <div key={index} className="flex items-start mb-questionGap">
              <input
                type="checkbox"
                id={`question-${index}`}
                checked={answers[index]}
                onChange={() => handleCheckboxChange(index)}
                className="mt-1"
              />
              <label htmlFor={`question-${index}`} className="ml-2 text-body">
                {question}
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-button text-buttonText text-button font-medium py-2 px-6 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Calculating..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
