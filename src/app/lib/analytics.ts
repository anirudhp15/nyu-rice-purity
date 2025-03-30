// analytics.ts
type AnalyticsProperties = Record<string, string | number | boolean>;

export const trackEvent = (
  eventName: string,
  properties?: AnalyticsProperties
) => {
  // Google Analytics 4 event tracking
  if (typeof window !== "undefined" && "gtag" in window) {
    const gtag = (
      window as {
        gtag: (
          event: string,
          action: string,
          params?: AnalyticsProperties
        ) => void;
      }
    ).gtag;
    gtag("event", eventName, properties);
  }

  // Vercel Analytics
  if (typeof window !== "undefined" && "va" in window) {
    const va = (
      window as {
        va: (
          event: string,
          params: { name: string } & AnalyticsProperties
        ) => void;
      }
    ).va;
    va("event", {
      name: eventName,
      ...properties,
    });
  }
};

// Track key events
export const trackEvents = {
  testStarted: () => trackEvent("test_started"),
  questionAnswered: (questionId: number) =>
    trackEvent("question_answered", { questionId }),
  testCompleted: (score: number) => trackEvent("test_completed", { score }),
  resultShared: (platform: string, score: number) =>
    trackEvent("result_shared", { platform, score }),
  statisticsViewed: () => trackEvent("statistics_viewed"),
};
