'use client';

type EventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function trackEvent(event: string, params?: EventParams) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, params);
  }
  // Also log to console in dev
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, params);
  }
}

export function useAnalytics() {
  return { logEvent: trackEvent };
}
