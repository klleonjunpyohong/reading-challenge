import {
  Zap, TrendingUp as ChartUp, Brain, BookText, Beaker,
  History, PenLine, Layers,
} from "lucide-react";

export const CATEGORIES = [
  { name: "자기계발", icon: Zap, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600" },
  { name: "경영/경제", icon: ChartUp, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
  { name: "인문학", icon: Brain, bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-600" },
  { name: "소설/문학", icon: BookText, bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-600" },
  { name: "과학/기술", icon: Beaker, bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-600" },
  { name: "역사", icon: History, bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600" },
  { name: "심리학", icon: Brain, bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-600" },
  { name: "에세이", icon: PenLine, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
  { name: "기타", icon: Layers, bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500" },
];

export const CATEGORY_NAMES = CATEGORIES.map(c => c.name);

export const CAT_COLORS: Record<string, string> = {};
CATEGORIES.forEach(c => { CAT_COLORS[c.name] = `${c.bg} ${c.text}`; });

export const QUOTES = [
  "오늘 읽은 한 페이지가 내일의 나를 만든다.",
  "독서는 마음의 양식이다. — 데카르트",
  "책을 읽는 것은 다른 사람의 생각으로 생각하는 것이다. — 쇼펜하우어",
  "한 권의 책이 인생을 바꿀 수 있다.",
  "독서의 목적은 지식이 아니라 행동이다. — 존 러스킨",
  "책은 도끼다. 우리 속에 얼어붙은 바다를 부수는. — 카프카",
  "리더는 독서가이고, 독서가는 리더이다.",
  "매일 30분 독서가 인생의 방향을 바꾼다.",
];

export const BUBBLE_COLORS: Record<string, { bg: string; text: string }> = {
  "자기계발": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
  "경영/경제": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
  "인문학": { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-400" },
  "소설/문학": { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400" },
  "과학/기술": { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-400" },
  "역사": { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400" },
  "심리학": { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-400" },
  "에세이": { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
  "기타": { bg: "bg-gray-100 dark:bg-neutral-800", text: "text-gray-600 dark:text-neutral-400" },
};
