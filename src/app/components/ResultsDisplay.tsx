"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  TwitterShareButton,
  FacebookShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  RedditShareButton,
  EmailShareButton,
} from "react-share";
import {
  TwitterIcon,
  FacebookIcon,
  WhatsappIcon,
  TelegramIcon,
  RedditIcon,
  EmailIcon,
} from "react-share";
import { trackEvents } from "@/app/lib/analytics";
import Image from "next/image";

interface ResultsDisplayProps {
  score: number;
}

const getScoreInterpretation = (score: number): string => {
  if (score >= 90)
    return "You’re still spotless—NYC hasn’t even scratched you.";
  if (score >= 80)
    return "Pretty tame for the city, you’re holding it together.";
  if (score >= 70)
    return "You’ve dipped into NYC life, but nothing too wild yet.";
  if (score >= 60) return "You’re picking up some city habits—watch your step.";
  if (score >= 50) return "Halfway gone—NYU and NYC are testing your limits.";
  if (score >= 40) return "You’re in deep; the city’s starting to own you.";
  if (score >= 30)
    return "You’re way too comfortable with the chaos—slow down.";
  if (score >= 20)
    return "You’ve crossed some lines—hope you’re still breathing.";
  if (score >= 10) return "NYC’s chewed you up—are you okay out there?";
  return "You’ve gone full feral—someone check on you, seriously.";
};

export default function ResultsDisplay({ score }: ResultsDisplayProps) {
  const interpretation = getScoreInterpretation(score);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = `I scored ${score}/100 on the NYU Purity Test! #NYUPurityTest`;

  const handleShare = (platform: string) => {
    trackEvents.resultShared(platform, score);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText("https://nyupuritytest.com");
    trackEvents.resultShared("clipboard", score);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="bg-[#fcf6e3] text-center max-w-3xl mx-auto shadow-md border-2 border-[#fcefc7] rounded-2xl">
      {/* Header Image */}
      <div className="flex overflow-hidden justify-center items-center p-0 bg-transparent">
        <div className="relative w-full max-w-[550px] h-[200px] mx-auto mt-8">
          <Image
            src="/images/bannerCropped.png"
            alt="NYU Purity Test"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>

      <div className="p-8 pt-0 bg-[#fcf6e3]">
        {/* Score Display */}
        <div className="mb-10 text-[#57068C]">
          <div className="inline-block p-6 mb-6">
            <h2 className="font-serif text-5xl font-bold">{score}</h2>
            <p className="font-serif text-sm">Your purity score</p>
          </div>
          <p className="mx-auto mb-6 max-w-lg font-serif text-lg">
            {interpretation}
          </p>
        </div>

        {/* Share Section */}
        <div className="mb-8">
          <h2 className="inline-block mb-4 font-serif text-lg font-bold text-black border-b-2 border-black">
            Share Your Score
          </h2>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <QRCodeSVG value={shareUrl} size={120} />
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <TwitterShareButton
              url={shareUrl}
              title={shareTitle}
              hashtags={["NYUPurityTest", "NYU", "NYC"]}
              onClick={() => handleShare("twitter")}
              className="transition-opacity hover:opacity-80"
            >
              <TwitterIcon size={32} round bgStyle={{ fill: "#000000" }} />
            </TwitterShareButton>

            <FacebookShareButton
              url={shareUrl}
              hashtag="#NYUPurityTest"
              onClick={() => handleShare("facebook")}
              className="transition-opacity hover:opacity-80"
            >
              <FacebookIcon size={32} round bgStyle={{ fill: "#1877F2" }} />
            </FacebookShareButton>

            <WhatsappShareButton
              url={shareUrl}
              title={shareTitle}
              onClick={() => handleShare("whatsapp")}
              className="transition-opacity hover:opacity-80"
            >
              <WhatsappIcon size={32} round bgStyle={{ fill: "#25D366" }} />
            </WhatsappShareButton>

            <TelegramShareButton
              url={shareUrl}
              title={shareTitle}
              onClick={() => handleShare("telegram")}
              className="transition-opacity hover:opacity-80"
            >
              <TelegramIcon size={32} round bgStyle={{ fill: "#0088CC" }} />
            </TelegramShareButton>

            <RedditShareButton
              url={shareUrl}
              title={shareTitle}
              onClick={() => handleShare("reddit")}
              className="transition-opacity hover:opacity-80"
            >
              <RedditIcon size={32} round bgStyle={{ fill: "#FF5700" }} />
            </RedditShareButton>

            <EmailShareButton
              url={shareUrl}
              subject="My NYU Purity Test Results"
              body={shareTitle}
              onClick={() => handleShare("email")}
              className="transition-opacity hover:opacity-80"
            >
              <EmailIcon size={32} round bgStyle={{ fill: "#777777" }} />
            </EmailShareButton>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 justify-center md:flex-row">
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center font-bold gap-2 px-4 py-2 text-sm text-[#57068C] bg-white border border-[#57068C] rounded-full hover:bg-gray-50 transition-colors"
          >
            <span>📋</span> Copy Link
          </button>
          <Link
            href="/"
            className="px-6 py-3 text-sm font-bold text-white bg-[#57068C] rounded-full hover:bg-[#7A29A1] transition-colors"
          >
            Take Test Again
          </Link>
        </div>
      </div>

      <div className="p-4 text-xs text-black bg-[#fcf6e3]">
        <p>
          Statistics will be made public once 1000 people have taken the test.
          <br />
          Based on the Rice Purity Test. Made for NYU students, by NYU students.
        </p>
      </div>
    </div>
  );
}
