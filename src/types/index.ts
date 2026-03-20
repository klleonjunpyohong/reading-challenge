import { Clock, BookMarked, CheckCircle2 } from "lucide-react";

export interface BookFormData {
  title: string;
  author: string;
  category: string;
  cover_url: string;
  book_type: "paper" | "ebook" | "audio";
  goal: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface CompletionData {
  note: string;
  rating: number;
  keywords: string[];
}

export interface StatusConfig {
  label: string;
  color: string;
  icon: React.ElementType;
}

export const STATUS_MAP: Record<string, StatusConfig> = {
  not_started: { label: "읽기 전", color: "bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400", icon: Clock },
  reading: { label: "읽는 중", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", icon: BookMarked },
  completed: { label: "완독", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 },
};

// AI Report
export interface AIReport {
  growth_summary: string;
  knowledge_connection: string;
  next_step_advice: string;
}

// Analytics Event
export type AnalyticsEvent =
  | 'challenge_init'
  | 'challenge_switch'
  | 'book_finish'
  | 'ai_report_gen'
  | 'streak_fire'
  | 'user_cheer'
  | 'feed_click'
  | 'page_view';
