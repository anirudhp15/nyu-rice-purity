"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
} from "react-share";
import {
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  EmailIcon,
} from "react-share";
import { trackEvents } from "@/app/lib/analytics";

interface ResultsDisplayProps {
  score: number;
}

const getScoreInterpretation = (score: number): string => {
  if (score >= 90) return "You're practically a NYC/NYU saint!";
  if (score >= 80) return "You're quite innocent by NYC standards.";
  if (score >= 70)
    return "You've had some NYC experiences, but you're still pretty pure.";
  if (score >= 60) return "You've experienced a bit of what NYC has to offer.";
  if (score >= 50)
    return "You're right in the middle - half NYC veteran, half newcomer.";
  if (score >= 40)
    return "You've definitely embraced quite a bit of the NYC lifestyle.";
  if (score >= 30) return "You're well-versed in NYC living and NYU culture.";
  if (score >= 20)
    return "You've really immersed yourself in the NYC/NYU experience!";
  if (score >= 10)
    return "You're a true NYC veteran with tons of experiences under your belt.";
  return "Wow, you've done it all! You're a complete NYC/NYU expert!";
};

export default function ResultsDisplay({ score }: ResultsDisplayProps) {
  const interpretation = getScoreInterpretation(score);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = `I scored ${score} on the NYU/NYC Purity Test!`;

  const handleShare = (platform: string) => {
    trackEvents.resultShared(platform, score);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-4 md:p-8 text-center">
      <h1 className="text-heading font-bold mb-4">
        Your Purity Score: {score}
      </h1>
      <p className="text-body mb-6">{interpretation}</p>

      <div className="mb-8">
        <h2 className="text-subheading font-semibold mb-2">
          Share Your Score:
        </h2>
        <div className="flex justify-center gap-4 mb-4">
          <FacebookShareButton
            url={shareUrl}
            hashtag="#NYUPurityTest"
            onClick={() => handleShare("facebook")}
          >
            <FacebookIcon size={36} round />
          </FacebookShareButton>
          <TwitterShareButton
            url={shareUrl}
            title={shareTitle}
            onClick={() => handleShare("twitter")}
          >
            <TwitterIcon size={36} round />
          </TwitterShareButton>
          <WhatsappShareButton
            url={shareUrl}
            title={shareTitle}
            onClick={() => handleShare("whatsapp")}
          >
            <WhatsappIcon size={36} round />
          </WhatsappShareButton>
          <EmailShareButton
            url={shareUrl}
            subject="My NYU/NYC Purity Test Result"
            body={shareTitle}
            onClick={() => handleShare("email")}
          >
            <EmailIcon size={36} round />
          </EmailShareButton>
        </div>

        <div className="flex flex-col items-center mb-6">
          <p className="text-body mb-2">Scan to share:</p>
          <QRCodeSVG value={shareUrl} size={150} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-4">
        <Link
          href="/statistics"
          className="bg-button text-buttonText text-button font-medium py-2 px-6 rounded hover:bg-gray-800"
        >
          View Statistics
        </Link>
        <Link
          href="/"
          className="bg-white text-button border border-button text-button font-medium py-2 px-6 rounded hover:bg-gray-100"
        >
          Take Again
        </Link>
      </div>
    </div>
  );
}
