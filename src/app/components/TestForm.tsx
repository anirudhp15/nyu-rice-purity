"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { purityQuestions } from "../constants/questions";
import { trackEvents } from "../lib/analytics";
import Image from "next/image";
import { motion } from "framer-motion";

export default function TestForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<boolean[]>(new Array(100).fill(false));
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoaded, setPageLoaded] = useState<boolean>(false);
  // New state for granular user info:
  const [gender, setGender] = useState("");
  const [customGender, setCustomGender] = useState("");
  const [school, setSchool] = useState("");
  const [customSchool, setCustomSchool] = useState("");
  const [year, setYear] = useState("");
  const [living, setLiving] = useState("");

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
        // Include the new granular info in the submission
        body: JSON.stringify({
          answers,
          gender: gender === "other" ? customGender : gender,
          school: school === "other" ? customSchool : school,
          year,
          living,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit test");
      }

      const data = await response.json();
      trackEvents.testCompleted(data.score);
      const scoreParam = data.encodedScore || data.score;
      router.push(`/results/${scoreParam}`);
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
      className="bg-[#fcf6e3] text-center max-w-3xl mx-auto shadow-lg rounded-2xl border-2 border-[#f0d37d]"
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
          className="mx-auto mb-8 max-w-xl font-serif text-lg text-black"
          variants={itemVariants}
        >
          The first-ever NYU Purity Test, for students to bond over nights spent
          debating whether lining up at Phebe's counts as networking or if
          getting ghosted by Citi after a Superday means you're officially
          fucked.
        </motion.p>
        <motion.p
          className="mx-auto mb-8 max-w-lg font-serif text-sm text-black"
          variants={itemVariants}
        >
          Check every item you've done. Your purity score will be calculated at
          the end.
        </motion.p>

        {/* Updated dropdown section for user info */}
        <motion.div className="p-4 mb-8" variants={containerVariants}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Gender dropdown */}
            <motion.div className="flex flex-col" variants={itemVariants}>
              <label className="mb-2 font-serif text-sm text-black">
                Gender (optional):
              </label>
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  if (e.target.value !== "other") {
                    setCustomGender("");
                  }
                }}
                className="p-2 w-full rounded border border-[#f0d37d] bg-[#fcf6e3] font-serif text-sm text-black hover:bg-[#f8f8f8] focus:outline-none focus:ring-2 focus:ring-[#f0d37d] transition-colors"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
              {gender === "other" && (
                <motion.input
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  type="text"
                  placeholder="Specify gender"
                  value={customGender}
                  onChange={(e) => setCustomGender(e.target.value)}
                  className="p-2 mt-2 w-full rounded border border-[#f0d37d] bg-[#fcf6e3] font-serif text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#f0d37d]"
                />
              )}
            </motion.div>

            {/* School dropdown */}
            <motion.div className="flex flex-col" variants={itemVariants}>
              <label className="mb-2 font-serif text-sm text-black">
                School (optional):
              </label>
              <select
                value={school}
                onChange={(e) => {
                  setSchool(e.target.value);
                  if (e.target.value !== "other") {
                    setCustomSchool("");
                  }
                }}
                className="p-2 w-full rounded border border-[#f0d37d] bg-[#fcf6e3] font-serif text-sm text-black hover:bg-[#f8f8f8] focus:outline-none focus:ring-2 focus:ring-[#f0d37d] transition-colors"
              >
                <option value="">Select a school</option>
                <option value="cas">CAS</option>
                <option value="tandon">Tandon</option>
                <option value="stern">Stern</option>
                <option value="gallatin">Gallatin</option>
                <option value="courant">Courant</option>
                <option value="tisch">Tisch</option>
                <option value="steinhardt">Steinhardt</option>
                <option value="sps">SPS</option>
                <option value="silver">Silver</option>
                <option value="law">Law</option>
                <option value="wagner">Wagner</option>
                <option value="other">Other</option>
              </select>
              {school === "other" && (
                <motion.input
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  type="text"
                  placeholder="Specify school"
                  value={customSchool}
                  onChange={(e) => setCustomSchool(e.target.value)}
                  className="p-2 mt-2 w-full rounded border border-[#f0d37d] bg-[#fcf6e3] font-serif text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#f0d37d]"
                />
              )}
              {school === "courant" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 font-serif text-sm text-red-500"
                >
                  (Courant is technically not an official fucking school, but
                  okay)
                </motion.p>
              )}
            </motion.div>

            {/* Year dropdown - New field */}
            <motion.div className="flex flex-col" variants={itemVariants}>
              <label className="mb-2 font-serif text-sm text-black">
                Year (optional):
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="p-2 w-full rounded border border-[#f0d37d] bg-[#fcf6e3] font-serif text-sm text-black hover:bg-[#f8f8f8] focus:outline-none focus:ring-2 focus:ring-[#f0d37d] transition-colors"
              >
                <option value="">Select your year</option>
                <option value="freshman">Freshman</option>
                <option value="sophomore">Sophomore</option>
                <option value="junior">Junior</option>
                <option value="senior">Senior</option>
                <option value="graduate">Graduate</option>
                <option value="alumni">Alumni</option>
              </select>
            </motion.div>

            {/* Living situation - New field */}
            <motion.div className="flex flex-col" variants={itemVariants}>
              <label className="mb-2 font-serif text-sm text-black">
                Living Situation (optional):
              </label>
              <select
                value={living}
                onChange={(e) => setLiving(e.target.value)}
                className="p-2 w-full rounded border border-[#f0d37d] bg-[#fcf6e3] font-serif text-sm text-black hover:bg-[#f8f8f8] focus:outline-none focus:ring-2 focus:ring-[#f0d37d] transition-colors"
              >
                <option value="">Select your living situation</option>
                <option value="dorm">Dorm</option>
                <option value="offcampus">Off-campus apartment</option>
                <option value="commuter">Commuter</option>
                <option value="family">With family</option>
                <option value="other">Other</option>
              </select>
            </motion.div>
          </div>
        </motion.div>

        <motion.p
          className="pl-2 mb-4 max-w-lg font-serif text-sm text-left text-black"
          variants={itemVariants}
        >
          Have you ever...
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
          Completing this test might leave you safe-riding back from the ER at
          6am with no ID.
        </p>
        <p className="mt-1 font-serif">
          Based on the Rice Purity Test. Made for NYU students, by NYU students.
        </p>
      </motion.div>
    </motion.div>
  );
}
