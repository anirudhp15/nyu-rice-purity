"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  TwitterShareButton,
  FacebookShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  RedditShareButton,
  XIcon,
} from "react-share";
import {
  TwitterIcon,
  FacebookIcon,
  WhatsappIcon,
  TelegramIcon,
  RedditIcon,
} from "react-share";
import { trackEvents } from "@/app/lib/analytics";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLink, FiRepeat } from "react-icons/fi";
import html2canvas from "html2canvas";

interface ResultsDisplayProps {
  score: number;
}

// Custom Instagram Icon Component
const InstagramIcon = ({ size, round }: { size: number; round: boolean }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        borderRadius: round ? "50%" : "0",
        background:
          "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
      }}
    >
      <path
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
        fill="#ffffff"
      />
    </svg>
  );
};

// Custom Email Icon Component
const EmailIcon = ({ size, round }: { size: number; round: boolean }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        borderRadius: round ? "50%" : "0",
        filter: round ? "drop-shadow(0px 1px 2px rgba(0,0,0,0.2))" : "none",
      }}
    >
      {/* Background */}
      <rect width="24" height="24" rx={round ? "12" : "2"} fill="#ffffff" />

      {/* Gmail-inspired outer envelope */}
      <rect x="2" y="4" width="20" height="16" rx="2" fill="#EDEDED" />

      {/* Blue top border */}
      <rect x="2" y="4" width="20" height="1.5" fill="#4285F4" />

      {/* Red left side */}
      <path
        d="M2 5.5V18.5C2 19.33 2.67 20 3.5 20H4.5V7L12 12L19.5 7V20H20.5C21.33 20 22 19.33 22 18.5V5.5L12 13.5L2 5.5Z"
        fill="#EA4335"
      />

      {/* Envelope middle fold */}
      <path d="M4.5 7L12 12L19.5 7V20H4.5V7Z" fill="#FFFFFF" />

      {/* Gray shadow on envelope fold */}
      <path
        opacity="0.2"
        d="M12 12.5L4.5 7.5V8.5L12 13.5L19.5 8.5V7.5L12 12.5Z"
        fill="#000000"
      />
    </svg>
  );
};

// Custom iMessage Icon Component
const IMessageIcon = ({ size, round }: { size: number; round: boolean }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        borderRadius: round ? "50%" : "0",
        filter: round ? "drop-shadow(0px 1px 2px rgba(0,0,0,0.2))" : "none",
      }}
    >
      {/* Green gradient background */}
      <defs>
        <linearGradient
          id="imessage-gradient"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#5DE45A" />
          <stop offset="100%" stopColor="#00C14F" />
        </linearGradient>
      </defs>

      {/* Background circle/shape */}
      <rect
        width="24"
        height="24"
        rx={round ? "12" : "3"}
        fill="url(#imessage-gradient)"
      />

      {/* Speech bubble */}
      <path
        d="M4.5 7C4.5 5.89543 5.39543 5 6.5 5H17.5C18.6046 5 19.5 5.89543 19.5 7V15C19.5 16.1046 18.6046 17 17.5 17H13.5L9.5 20.5V17H6.5C5.39543 17 4.5 16.1046 4.5 15V7Z"
        fill="white"
      />

      {/* Shadow effect inside bubble */}
      <path
        opacity="0.1"
        d="M5.5 15V7C5.5 6.44772 5.94772 6 6.5 6H17.5C18.0523 6 18.5 6.44772 18.5 7V15C18.5 15.5523 18.0523 16 17.5 16H13.5H13L12.7 16.2L9.5 19V16.5V16H9H6.5C5.94772 16 5.5 15.5523 5.5 15Z"
        fill="black"
      />
    </svg>
  );
};

const getScoreInterpretation = (score: number): string => {
  if (score >= 98) return "Get the fuck out of here you transplant.";
  if (score >= 95) return "You're still a NYU virgin—congratulations!";
  if (score >= 90)
    return "You're still spotless—NYC hasn't even scratched you.";
  if (score >= 80)
    return "Pretty tame for the city, you're holding it together.";
  if (score >= 70)
    return "You've dipped into NYC life, but nothing too wild yet.";
  if (score >= 60) return "You're picking up some city habits—watch your step.";
  if (score >= 50) return "Halfway gone—NYU and NYC are testing your limits.";
  if (score >= 40) return "You're in deep; the city's starting to own you.";
  if (score >= 30)
    return "You're way too comfortable with the chaos—slow down.";
  if (score >= 20)
    return "You've crossed some lines—hope you're still breathing.";
  if (score >= 10) return "NYC's chewed you up—are you okay out there?";
  return "You've gone full feral—someone check on you, seriously.";
};

export default function ResultsDisplay({ score }: ResultsDisplayProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const interpretation = getScoreInterpretation(score);
  const shareUrl = "https://nyupuritytest.com";
  const shareTitle = `I scored ${score}/100 on the NYU Purity Test! #NYUPurityTest`;

  useEffect(() => {
    setIsLoaded(true);
    // Check if the user is on a mobile device and if it's iOS
    const checkDevice = () => {
      const userAgent =
        navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice =
        /android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
      const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent);

      setIsMobile(isMobileDevice);
      setIsIOS(isIOSDevice);
    };
    checkDevice();

    // Dynamically import html2canvas only on client side
    import("html2canvas").catch((err) => {
      console.error("Failed to load html2canvas", err);
    });
  }, []);

  const handleShare = (platform: string) => {
    trackEvents.resultShared(platform, score);
  };

  // New Instagram sharing function using screenshot + deep linking approach
  const shareToInstagram = async () => {
    if (!resultsRef.current) return;

    handleShare("instagram");
    setIsCapturing(true);

    try {
      // For iOS Safari, we'll take a more direct approach
      if (isIOS) {
        try {
          // Step 1: Create a screenshot of the results with optimized settings for iOS
          const captureElement = resultsRef.current;
          const canvas = await html2canvas(captureElement, {
            scale: 1.5, // Lower resolution for iOS to prevent memory issues
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#fcf6e3",
            logging: false,
            removeContainer: true, // Helps with memory usage
            // iOS Safari-specific optimizations
            ignoreElements: (element: Element) => {
              // Skip complex animations that might cause issues
              return element.classList.contains("animate-spin");
            },
            onclone: (document, element) => {
              // Simplify the DOM for capture to prevent memory issues
              const animations = element.querySelectorAll(
                ".animate-spin, .animate-pulse"
              );
              animations.forEach((el) =>
                el.classList.remove("animate-spin", "animate-pulse")
              );
              return element;
            },
          });

          // Convert to smaller file
          const imgData = canvas.toDataURL("image/jpeg", 0.8); // Use JPEG with 80% quality for smaller file size

          // Create a download link for the image
          const blob = await (await fetch(imgData)).blob();
          const filename = `nyu-purity-test-score-${score}.jpg`;

          // Create download link
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // After a delay, open Instagram
          setTimeout(() => {
            openInstagramStories();
          }, 1500);
        } catch (iosError) {
          console.error("iOS specific error:", iosError);

          // Fallback: Just open Instagram stories without the screenshot
          setTimeout(() => {
            alert(
              "We couldn't create an image automatically. Please take a screenshot of your results, then open Instagram to share it."
            );
            openInstagramStories();
          }, 500);
        }
      } else {
        // Non-iOS approach (Android/desktop) - keep original implementation
        // Step 1: Create a screenshot of the results
        const captureElement = resultsRef.current;
        const canvas = await html2canvas(captureElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#fcf6e3",
          logging: false,
        });

        // Step 2: Convert canvas to blob and download
        const imgData = canvas.toDataURL("image/png");
        const blob = await (await fetch(imgData)).blob();

        // Create a download link for the image
        const filename = `nyu-purity-test-score-${score}.png`;

        if (navigator.share && isMobile) {
          // Use Web Share API if available (modern mobile browsers)
          const file = new File([blob], filename, { type: "image/png" });

          try {
            await navigator.share({
              files: [file],
              title: "My NYU Purity Test Score",
              text: `I scored ${score}/100 on the NYU Purity Test! ${interpretation}`,
            });

            // After share dialog closes, open Instagram stories
            setTimeout(() => {
              openInstagramStories();
            }, 1000);

            return;
          } catch (err) {
            console.log(
              "Share API failed, falling back to download + deep link",
              err
            );
            // Fall back to manual download method
          }
        }

        // Manual download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Step 3: After a small delay, open Instagram's story camera
        setTimeout(() => {
          openInstagramStories();
        }, 1500);
      }
    } catch (error) {
      console.error("Error capturing or sharing screenshot:", error);

      // More user-friendly error handling with specific fallback
      if (isMobile) {
        alert(
          "We couldn't create a shareable image automatically. You can take a screenshot manually and share it to Instagram."
        );

        // Still try to open Instagram even if the image creation failed
        setTimeout(() => {
          openInstagramStories();
        }, 1000);
      } else {
        alert(
          "There was an error creating your shareable image. You can take a screenshot manually."
        );
      }
    } finally {
      setIsCapturing(false);
    }
  };

  // Helper function to open Instagram stories
  const openInstagramStories = () => {
    // Different approaches for iOS and Android
    if (isMobile) {
      // Instagram story deep links
      const instagramUrl = "instagram://story-camera";

      try {
        // Try to open Instagram directly
        window.location.href = instagramUrl;

        // Set a timeout to check if Instagram opened successfully
        setTimeout(() => {
          if (document.hasFocus()) {
            // If we still have focus, Instagram didn't open
            alert(
              "Please make sure you have Instagram installed. You can also manually open Instagram and share the image from your camera roll."
            );
          }
        }, 2000);
      } catch (e) {
        alert(
          "Please open Instagram and share the image from your camera roll."
        );
      }
    } else {
      // On desktop, show instructions
      alert(
        "The image has been downloaded. Open Instagram on your mobile device and share it to your story."
      );
    }
  };

  // Enhanced email sharing function
  const shareViaEmail = () => {
    handleShare("email");

    // Create a more formatted email with proper linebreaks and formatting
    const subject = encodeURIComponent("My NYU Purity Test Results");
    const body = encodeURIComponent(
      `Hey,\n\nI just took the NYU Purity Test and scored ${score}/100!\n\nTake the test yourself at: ${shareUrl}\n\n#NYUPurityTest`
    );

    // Open the default email client with a pre-filled message
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // iMessage sharing function
  const shareViaIMessage = () => {
    handleShare("imessage");

    if (isIOS) {
      // Create the message body
      const body = encodeURIComponent(
        `I scored ${score}/100 on the NYU Purity Test! Take the test at: ${shareUrl}`
      );

      // Use the iOS-specific messages: URL scheme if possible, otherwise fallback to sms:
      // The messages: scheme works only on iOS and is more likely to open iMessage specifically
      window.location.href = `messages:&body=${body}`;

      // Fallback in case messages: doesn't work
      setTimeout(() => {
        window.location.href = `sms:&body=${body}`;
      }, 1000);
    } else {
      // For non-iOS devices, open SMS with a fallback message
      const fallbackBody = encodeURIComponent(
        `I scored ${score}/100 on the NYU Purity Test! Take the test at: ${shareUrl}`
      );

      if (isMobile) {
        window.location.href = `sms:?body=${fallbackBody}`;
      } else {
        alert(
          "iMessage sharing is only available on iOS devices. You can copy the link and share it manually."
        );
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText("https://nyupuritytest.com");
    trackEvents.resultShared("clipboard", score);
    alert("Link copied to clipboard!");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const scoreCountVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const shareButtonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.8 + i * 0.2,
        duration: 0.3,
      },
    }),
  };

  return (
    <AnimatePresence>
      <motion.div
        className="bg-[#fcf6e3] text-center max-w-3xl mx-auto shadow-md border-2 border-[#fcefc7] rounded-2xl"
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={containerVariants}
        ref={resultsRef}
      >
        {/* Header Image */}
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

        <div className="p-8 pt-0 bg-[#fcf6e3]">
          {/* Score Display */}
          <motion.div className="mb-10 text-[#57068C]" variants={itemVariants}>
            <motion.div
              className="inline-block p-6 mb-6"
              variants={scoreCountVariants}
            >
              <h2 className="font-serif text-5xl font-bold">{score}</h2>
              <p className="font-serif text-sm">Your purity score</p>
            </motion.div>
            <motion.p
              className="mx-auto mb-6 max-w-lg font-serif text-lg"
              variants={itemVariants}
            >
              {interpretation}
            </motion.p>
          </motion.div>

          {/* Share Section */}
          <motion.div className="mb-4 lg:mb-8" variants={itemVariants}>
            <motion.h2
              className="inline-block mb-4 font-serif text-lg font-bold text-black border-b-2 border-black"
              variants={itemVariants}
            >
              Share Your Score
            </motion.h2>

            {/* QR Code */}
            <motion.div
              className="flex justify-center mb-6"
              variants={itemVariants}
            >
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <QRCodeSVG value={shareUrl} size={120} />
              </div>
            </motion.div>

            {/* Social Share Buttons */}
            <motion.div
              className="flex flex-wrap gap-2 justify-center mb-4"
              variants={itemVariants}
            >
              {/* Instagram Share Button */}
              <motion.div custom={0} variants={shareButtonVariants}>
                <button
                  onClick={shareToInstagram}
                  disabled={isCapturing}
                  className="relative transition-opacity hover:opacity-80"
                  aria-label="Share to Instagram"
                >
                  {isCapturing ? (
                    <div className="flex absolute inset-0 justify-center items-center">
                      <div className="w-5 h-5 border-t-2 border-[#ffffff] rounded-full animate-spin"></div>
                    </div>
                  ) : null}
                  <InstagramIcon size={32} round={true} />
                </button>
              </motion.div>

              {/* Twitter Share Button */}
              <motion.div custom={1} variants={shareButtonVariants}>
                <TwitterShareButton
                  url={shareUrl}
                  title={shareTitle}
                  hashtags={["NYUPurityTest", "NYU", "NYC"]}
                  onClick={() => handleShare("twitter")}
                  className="transition-opacity hover:opacity-80"
                >
                  <XIcon size={32} round bgStyle={{ fill: "#000000" }} />
                </TwitterShareButton>
              </motion.div>

              {/* Facebook Share Button */}
              <motion.div custom={2} variants={shareButtonVariants}>
                <FacebookShareButton
                  url={shareUrl}
                  hashtag="#NYUPurityTest"
                  onClick={() => handleShare("facebook")}
                  className="transition-opacity hover:opacity-80"
                >
                  <FacebookIcon size={32} round bgStyle={{ fill: "#1877F2" }} />
                </FacebookShareButton>
              </motion.div>

              {/* WhatsApp Share Button */}
              <motion.div custom={3} variants={shareButtonVariants}>
                <WhatsappShareButton
                  url={shareUrl}
                  title={shareTitle}
                  onClick={() => handleShare("whatsapp")}
                  className="transition-opacity hover:opacity-80"
                >
                  <WhatsappIcon size={32} round bgStyle={{ fill: "#25D366" }} />
                </WhatsappShareButton>
              </motion.div>

              {/* Reddit Share Button */}
              {/* <motion.div custom={4} variants={shareButtonVariants}>
                <RedditShareButton
                  url={shareUrl}
                  title={shareTitle}
                  onClick={() => handleShare("reddit")}
                  className="transition-opacity hover:opacity-80"
                >
                  <RedditIcon size={32} round bgStyle={{ fill: "#FF5700" }} />
                </RedditShareButton>
              </motion.div> */}

              {/* iMessage Share Button (shows conditionally for iOS devices) */}
              <motion.div custom={6} variants={shareButtonVariants}>
                <button
                  onClick={shareViaIMessage}
                  className="transition-opacity hover:opacity-80"
                  aria-label="Share via iMessage"
                >
                  <IMessageIcon size={32} round={true} />
                </button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-row gap-2 justify-center"
            variants={itemVariants}
          >
            <motion.button
              onClick={copyToClipboard}
              className="flex items-center justify-center whitespace-nowrap font-bold gap-2 px-4 py-2 text-xs lg:text-sm text-[#57068C] bg-white border border-[#57068C] rounded-full hover:bg-gray-50 transition-colors group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiLink className="w-4 h-4 transition-transform group-hover:rotate-12" />
              Copy Link
            </motion.button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 whitespace-nowrap text-xs lg:text-sm font-bold text-white bg-[#57068C] rounded-full hover:bg-[#7A29A1] transition-colors group"
              >
                <FiRepeat className="w-4 h-4 transition-transform group-hover:rotate-180" />
                Take Test Again
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="p-4 text-xs text-black bg-[#fcf6e3]"
          variants={itemVariants}
        >
          <p>
            Stats will be made public once 1500 submissions have been made.
            <br />
            Based on the Rice Purity Test. Made for NYU students, by NYU
            students.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
