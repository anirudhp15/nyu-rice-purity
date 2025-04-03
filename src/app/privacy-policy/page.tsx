"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
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

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 200,
      },
    },
  };

  return (
    <main className="mx-auto max-w-4xl">
      <motion.div
        className="bg-[#fcf6e3] text-left shadow-lg rounded-2xl overflow-hidden border-2 border-[#f0d37d] p-8 pb-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1
          className="font-serif text-3xl font-bold mb-6 text-[#57068C] text-center"
          variants={itemVariants}
        >
          Privacy Policy
        </motion.h1>

        <motion.div
          variants={buttonVariants}
          className="flex justify-center mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 font-bold text-white bg-[#57068C] rounded-full hover:bg-[#7A29A1] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </motion.div>

        <motion.div
          className="max-w-none text-black prose prose-lg"
          variants={itemVariants}
        >
          <motion.p className="mb-4" variants={itemVariants}>
            <strong>Last Updated:</strong>{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </motion.p>

          <motion.h2
            className="font-serif text-xl font-bold mt-6 mb-3 text-[#57068C]"
            variants={itemVariants}
          >
            1. Introduction
          </motion.h2>
          <motion.p variants={itemVariants}>
            This Privacy Policy outlines how NYU Purity Test ("we," "us," or
            "our") handles information collected from users. Your privacy and
            data security are paramount. By using our website, you acknowledge
            and consent to the practices described herein.
          </motion.p>

          <motion.h2
            className="font-serif text-xl font-bold mt-6 mb-3 text-[#57068C]"
            variants={itemVariants}
          >
            2. Information Collected
          </motion.h2>
          <motion.p variants={itemVariants}>
            We may collect the following types of non-identifiable data:
          </motion.p>
          <motion.ul className="mb-4 ml-6 list-disc" variants={itemVariants}>
            <motion.li variants={itemVariants}>
              Anonymous test responses and aggregated results
            </motion.li>
            <motion.li variants={itemVariants}>
              Optional demographic data (e.g., academic year, school)
            </motion.li>
            <motion.li variants={itemVariants}>
              Technical details such as device type and browser information
            </motion.li>
            <motion.li variants={itemVariants}>
              Website usage metrics and analytics
            </motion.li>
          </motion.ul>

          <motion.h2
            className="font-serif text-xl font-bold mt-6 mb-3 text-[#57068C]"
            variants={itemVariants}
          >
            3. Use of Collected Information
          </motion.h2>
          <motion.p variants={itemVariants}>
            Collected data is utilized solely for:
          </motion.p>
          <motion.ul className="mb-4 ml-6 list-disc" variants={itemVariants}>
            <motion.li variants={itemVariants}>
              Providing and improving our services
            </motion.li>
            <motion.li variants={itemVariants}>
              Analyzing collective student behavior and habits for entertainment
              purposes
            </motion.li>
            <motion.li variants={itemVariants}>
              Ensuring our website remains effective and responsive on various
              devices
            </motion.li>
            <motion.li variants={itemVariants}>
              Generating humorous and relatable statistics for NYU students
            </motion.li>
          </motion.ul>

          <motion.h2
            className="font-serif text-xl font-bold mt-6 mb-3 text-[#57068C]"
            variants={itemVariants}
          >
            4. Data Security
          </motion.h2>
          <motion.p variants={itemVariants}>
            We implement stringent security protocols to protect your data from
            unauthorized access, modification, disclosure, or destruction.
            Personal identifiable information is neither collected nor stored,
            ensuring complete user anonymity.
          </motion.p>

          <motion.h2
            className="font-serif text-xl font-bold mt-6 mb-3 text-[#57068C]"
            variants={itemVariants}
          >
            5. Cookies and Tracking
          </motion.h2>
          <motion.p variants={itemVariants}>
            Our site utilizes cookies and similar technologies to enhance your
            user experience and analyze site usage. You have full control to
            disable cookies through your browser settings if preferred.
          </motion.p>

          <motion.h2
            className="font-serif text-xl font-bold mt-6 mb-3 text-[#57068C]"
            variants={itemVariants}
          >
            6. Third-Party Services
          </motion.h2>
          <motion.p variants={itemVariants}>
            Third-party services may be employed to assist in providing our
            services, analyze usage data, or improve our website's
            functionality. These entities have access only to non-identifiable
            data necessary for performing their designated tasks and are
            strictly prohibited from using this information for other purposes.
          </motion.p>

          <motion.h2
            className="font-serif text-xl font-bold mt-6 mb-3 text-[#57068C]"
            variants={itemVariants}
          >
            7. Liability and Disclaimer
          </motion.h2>
          <motion.p variants={itemVariants}>
            NYU Purity Test is intended solely for entertainment purposes. We
            assume no liability for the misuse or unintended interpretations of
            collected data. By using this site, you agree that any insights or
            information derived from this data do not represent advice or
            recommendations.
          </motion.p>

          <motion.h2
            className="font-serif text-xl font-bold mt-6 mb-3 text-[#57068C]"
            variants={itemVariants}
          >
            8. Changes to This Privacy Policy
          </motion.h2>
          <motion.p variants={itemVariants}>
            We reserve the right to update this Privacy Policy periodically.
            Changes will be effective immediately upon posting the updated
            policy, and the "Last Updated" date above will reflect the most
            recent revisions.
          </motion.p>

          <motion.h2
            className="font-serif text-xl font-bold mt-6 mb-3 text-[#57068C]"
            variants={itemVariants}
          >
            9. Contact Information
          </motion.h2>
          <motion.p variants={itemVariants}>
            For any inquiries regarding this Privacy Policy, please reach out
            to:
          </motion.p>
          <motion.p className="ml-6" variants={itemVariants}>
            NYU Purity Test Team
            <br />
            nyupuritytest@gmail.com
          </motion.p>
        </motion.div>

        <motion.div className="pt-4 mt-10" variants={itemVariants}>
          <motion.div variants={buttonVariants} className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 font-bold text-white bg-[#57068C] rounded-full hover:bg-[#7A29A1] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Return to Home Page
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="mt-4 p-4 pb-0 w-full text-center text-xs text-black bg-[#fcf6e3] border-t border-[#f0e9d2]"
        >
          <p>
            Based on the Rice Purity Test. Made for NYU students, by NYU
            students.
          </p>
          <p className="mt-1 text-[10px] text-gray-500">
            <Link
              href="/privacy-policy"
              className="hover:text-[#57068C] hover:underline transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
