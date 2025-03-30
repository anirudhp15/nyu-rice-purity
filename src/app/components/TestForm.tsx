"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { purityQuestions } from "@/app/constants/questions";
import { trackEvents } from "@/app/lib/analytics";
import Image from "next/image";

export default function TestForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<boolean[]>(new Array(100).fill(false));
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    trackEvents.testStarted();
  }, []);

  const handleCheckboxChange = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = !newAnswers[index];
    setAnswers(newAnswers);
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
    <div className="bg-[#fcf6e3] text-center max-w-3xl mx-auto shadow-md rounded-2xl border-2 border-[#fcefc7]">
      <div className="flex overflow-hidden justify-center items-center p-0 bg-transparent">
        <div className="relative w-full max-w-[550px] h-[200px] mx-auto mt-8">
          <Image
            src="/images/bannerCropped.png"
            alt="NYU/NYC Purity Test"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>

      <div className="p-6 bg-[#fcf6e3]">
        <p className="mx-auto mb-8 max-w-lg font-serif text-lg text-black">
          The first-ever NYU Purity Test. Serving as a way for students to bond
          over nights spent debating whether lining up at Phebe's counts as
          networking or if getting ghosted by Citi after a Superday means you're
          officially fucked.
        </p>
        <p className="mx-auto mb-8 max-w-lg font-serif text-sm text-black">
          Click every item you've done. Your purity score will be calculated at
          the end.
        </p>

        <form onSubmit={handleSubmit} className="text-left">
          <div className="grid grid-cols-1 gap-1 mb-8">
            {purityQuestions.map((question, index) => (
              <div
                key={index}
                className="flex items-start py-1 px-2 hover:bg-[#f8f8f8]"
              >
                <input
                  type="checkbox"
                  id={`question-${index}`}
                  checked={answers[index]}
                  onChange={() => handleCheckboxChange(index)}
                  className="mt-1 w-4 h-4 rounded-none"
                />
                <label
                  htmlFor={`question-${index}`}
                  className="ml-2 font-serif text-sm text-black cursor-pointer"
                >
                  {index + 1}. {question}
                </label>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 font-bold text-white bg-[#57068C] rounded-full hover:bg-[#7A29A1] transition-colors disabled:opacity-50"
            >
              {loading ? "Calculating..." : "Calculate My Score"}
            </button>
          </div>
        </form>
      </div>

      <div className="p-4 text-xs text-black bg-transparent">
        <p className="font-serif">
          <span className="font-bold">Caution:</span> This is not a bucket list.
          Completion of all items on this test may result in academic probation.
        </p>
        <p className="mt-1 font-serif">
          Based on the Rice Purity Test. Made for NYU students, by NYU students.
        </p>
      </div>
    </div>
  );
}
