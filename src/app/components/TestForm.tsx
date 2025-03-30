"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { purityQuestions } from "@/app/constants/questions";
import { trackEvents } from "@/app/lib/analytics";
import Image from "next/image";
import { motion } from "framer-motion";

export default function TestForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<boolean[]>(new Array(100).fill(false));
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoaded, setPageLoaded] = useState<boolean>(false);

  useEffect(() => {
    trackEvents.testStarted();
    setPageLoaded(true);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const questionVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.01,
      },
    }),
  };

  return (
    <motion.div
      className="bg-[#fcf6e3] text-center max-w-3xl mx-auto shadow-md rounded-2xl border-2 border-[#fcefc7]"
      initial="hidden"
      animate={pageLoaded ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <motion.div
        className="flex overflow-hidden justify-center items-center p-0 bg-transparent"
        variants={itemVariants}
      >
        <div className="relative w-full max-w-[550px] h-[200px] mx-auto mt-8">
          <Image
            src="/images/bannerCropped.png"
            alt="NYU Purity Test"
            fill
            priority
            className="object-contain"
          />
        </div>
      </motion.div>

      <div className="p-6 bg-[#fcf6e3]">
        <motion.p
          className="mx-auto mb-8 max-w-lg font-serif text-lg text-black"
          variants={itemVariants}
        >
          The first-ever NYU Purity Test. Serving as a way for students to bond
          over nights spent debating whether lining up at Phebe's counts as
          networking or if getting ghosted by Citi after a Superday means you're
          officially fucked.
        </motion.p>
        <motion.p
          className="mx-auto mb-8 max-w-lg font-serif text-sm text-black"
          variants={itemVariants}
        >
          Check every item you've done. Your purity score will be calculated at
          the end.
        </motion.p>

        <form onSubmit={handleSubmit} className="text-left">
          <motion.div
            className="grid grid-cols-1 gap-1 mb-8"
            variants={itemVariants}
          >
            {purityQuestions.map((question, index) => (
              <motion.div
                key={index}
                className="flex items-start py-1 px-2 hover:bg-[#f8f8f8]"
                custom={index}
                variants={questionVariants}
                initial="hidden"
                animate="visible"
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
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="text-center" variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={loading}
              className="px-6 py-3 font-bold text-white bg-[#57068C] rounded-full hover:bg-[#7A29A1] transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <span className="flex justify-center items-center">
                  <svg
                    className="mr-3 -ml-1 w-5 h-5 text-white animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Calculating...
                </span>
              ) : (
                "Calculate My Score"
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>

      <motion.div
        className="p-4 text-xs text-black bg-transparent"
        variants={itemVariants}
      >
        <p className="font-serif">
          <span className="font-bold">Caution:</span> This is not a bucket list.
          Completion of all items on this test may result in academic probation.
        </p>
        <p className="mt-1 font-serif">
          Based on the Rice Purity Test. Made for NYU students, by NYU students.
        </p>
      </motion.div>
    </motion.div>
  );
}
