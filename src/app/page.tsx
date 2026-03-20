"use client";

import { useEffect, useState, useRef } from "react";
import {
  BookOpen, Plus, Calendar, Target, BookMarked, Clock,
  CheckCircle2, Trash2, X, BarChart3, Settings,
  Edit3, TrendingUp, Award, Zap,
  Sun, Moon, Sparkles, LogOut, ChevronDown, ChevronUp,
} from "lucide-react";
import { Book } from "@/lib/database.types";
import { getBooks, saveBooks, getStartDate, setStartDate, hasProfile, getProfile, saveProfile, ChallengeProfile, getChallengeType, setChallengeType, archiveCurrentChallenge, ChallengeType, calculateStreak, calculateSeason } from "@/lib/storage";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { isCalendarConnected, setCalendarConnected, createBookEvent, completeBookEvent } from "@/lib/calendar";
import ToastProvider, { showToast } from "@/components/Toast";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";

// Extracted components
import BookFormModal from "@/components/books/BookFormModal";
import CompletionModal from "@/components/books/CompletionModal";
import ReviewEditModal from "@/components/books/ReviewEditModal";
import SettingsModal from "@/components/modals/SettingsModal";
import ReportModal from "@/components/modals/ReportModal";
import CertificateModal from "@/components/modals/CertificateModal";
import SuccessTransitionModal from "@/components/modals/SuccessTransitionModal";
import VisionEditModal from "@/components/modals/VisionEditModal";
import useDarkMode from "@/hooks/useDarkMode";

// Extracted types & constants
import { BookFormData, CompletionData, STATUS_MAP } from "@/types";
import { CATEGORIES, QUOTES, CAT_COLORS, BUBBLE_COLORS } from "@/utils/constants";

/* ═══════════════ Countdown Timer ═══════════════ */
function Countdown({ endDate }: { endDate: Date }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endDate.getTime() - Date.now());
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const Unit = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold text-emerald-500 tabular-nums leading-none">{value}</span>
      <span className="text-[9px] text-gray-400 dark:text-neutral-500 mt-1 font-medium uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm dark:shadow-none p-5 bg-white dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-4">
        <Unit value={String(time.d)} label="days" />
        <span className="text-xl text-gray-200 dark:text-neutral-700 font-light mt-0.5">:</span>
        <Unit value={pad(time.h)} label="hours" />
        <span className="text-xl text-gray-200 dark:text-neutral-700 font-light mt-0.5">:</span>
        <Unit value={pad(time.m)} label="mins" />
        <span className="text-xl text-gray-200 dark:text-neutral-700 font-light mt-0.5">:</span>
        <Unit value={pad(time.s)} label="secs" />
      </div>
    </div>
  );
}

/* ═══════════════ Dashboard ═══════════════ */
export default function Dashboard() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [startDate, setStartDateState] = useState(new Date().toISOString().split("T")[0]);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ChallengeProfile | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Book | null>(null);
  const [showVisionEdit, setShowVisionEdit] = useState(false);
  const [showRemind, setShowRemind] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [remindDismissed, setRemindDismissed] = useState(false);
  const [completionTarget, setCompletionTarget] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<Book | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [filter, setFilter] = useState<"all" | "not_started" | "reading" | "completed">("all");
  const [showTimeline, setShowTimeline] = useState(true);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const prevCompletedRef = useRef(0);
  const { darkMode, toggleDark } = useDarkMode();
  const [calendarConnected, setCalendarConnectedState] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [challengeType, setChallengeTypeState] = useState<ChallengeType>('100days_33books');
  const [showSuccessTransition, setShowSuccessTransition] = useState(false);
  const [streak, setStreak] = useState(0);
  const [aiReport, setAiReport] = useState<{growth_summary: string; knowledge_connection: string; next_step_advice: string} | null>(null);

  const togglePublic = () => {
    const next = !isPublic;
    setIsPublic(next);
    localStorage.setItem('reading-public-profile', String(next));
    showToast(next ? "서재가 공개되었습니다" : "서재가 비공개로 전환되었습니다");
  };

  // Challenge config
  const isProChallenge = challengeType === '365days_100expert';
  const challengeDays = isProChallenge ? 365 : 100;
  const challengeGoal = isProChallenge ? 100 : 33;
  const completedCount = books.filter(b => b.status === "completed").length;

  const fetchAiReport = async () => {
    setAiReport(null);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ books, completedCount, challengeType }),
      });
      const data = await res.json();
      setAiReport(data);
    } catch {
      setAiReport({ growth_summary: '분석을 준비 중입니다.', knowledge_connection: '', next_step_advice: '오늘도 한 페이지!' });
    }
  };

  // Load from localStorage & check profile (with auth)
  useEffect(() => {
    const loadData = () => {
      if (!hasProfile()) {
        window.location.href = "/start";
        return;
      }
      try {
        setProfile(getProfile());
        const loadedBooks = getBooks();
        setBooks(loadedBooks);
        setStartDateState(getStartDate());
        setStreak(calculateStreak(loadedBooks));
      } catch (e) { console.error(e); }
      setMounted(true);
      setCalendarConnectedState(isCalendarConnected());
      setIsPublic(localStorage.getItem('reading-public-profile') === 'true');
      setChallengeTypeState(getChallengeType());
    };

    const checkAuth = async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isSupabaseConfigured = url && !url.includes('placeholder') && !url.includes('your-project');

      if (!isSupabaseConfigured) {
        loadData();
        return;
      }

      // Listen for auth state changes (handles OAuth redirect)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          loadData();
        }
      });

      // Check existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        loadData();
      } else {
        // Wait a moment for OAuth redirect to complete
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            loadData();
          } else {
            window.location.href = "/login";
          }
        }, 1000);
      }

      return () => subscription.unsubscribe();
    };
    checkAuth();
  }, []);

  // Remind check: D+30, D+66, or 7 days no activity
  useEffect(() => {
    if (!mounted || remindDismissed) return;
    const dp = Math.max(0, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000));
    const isCheckpoint = dp === 30 || dp === 66;
    const lastActivity = books.reduce((latest, b) => {
      const dates = [b.created_at, b.started_at, b.completed_at].filter(Boolean) as string[];
      const max = dates.reduce((m, d) => Math.max(m, new Date(d).getTime()), 0);
      return Math.max(latest, max);
    }, 0);
    const daysSinceActivity = lastActivity > 0 ? Math.floor((Date.now() - lastActivity) / 86400000) : 999;
    if (isCheckpoint || (daysSinceActivity >= 7 && books.length > 0)) setShowRemind(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Save whenever books change
  useEffect(() => {
    if (mounted) saveBooks(books);
  }, [books, mounted]);

  // Check for goal completion
  useEffect(() => {
    if (mounted && completedCount >= challengeGoal && prevCompletedRef.current < challengeGoal) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ["#10B981", "#34D399", "#6EE7B7", "#FFD700"] });
      if (!isProChallenge) {
        setTimeout(() => setShowSuccessTransition(true), 2000);
      } else {
        setTimeout(() => setShowReport(true), 1500);
      }
    }
    prevCompletedRef.current = completedCount;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCount, mounted]);

  // Fetch AI report when completed books exist
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (mounted && completedCount > 0 && !aiReport) fetchAiReport();
  }, [mounted, completedCount]);

  // Handle accepting pro challenge
  const handleAcceptProChallenge = () => {
    archiveCurrentChallenge(books, profile);
    setChallengeType('365days_100expert');
    setChallengeTypeState('365days_100expert');
    setShowSuccessTransition(false);
    saveBooks([]);
    setBooks([]);
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setStartDateState(today);
    showToast("365일 100권 챌린지가 시작되었습니다! 🔥");
  };

  // Handlers
  const handleAdd = (data: BookFormData) => {
    const book: Book = {
      ...data, id: crypto.randomUUID(), user_id: "local", status: "not_started",
      note: "", rating: 0, keywords: [], created_at: new Date().toISOString(),
    };
    setBooks(prev => [book, ...prev]);
    if (calendarConnected && book.completed_at) {
      createBookEvent(book.title, book.completed_at).then(ok => {
        if (ok) showToast("구글 캘린더에 일정이 등록되었습니다");
      });
    }
    setShowAdd(false);
  };

  const handleEdit = (data: BookFormData) => {
    if (!editTarget) return;
    setBooks(prev => prev.map(b => b.id === editTarget.id ? { ...b, ...data } : b));
    setEditTarget(null);
  };

  const handleStartReading = (id: string) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, status: "reading" as const, started_at: new Date().toISOString().split("T")[0] } : b));
  };

  const handleComplete = (data: CompletionData) => {
    if (!completionTarget) return;
    setBooks(prev => prev.map(b => b.id === completionTarget ? {
      ...b, status: "completed" as const, completed_at: new Date().toISOString().split("T")[0],
      note: data.note, rating: data.rating, keywords: data.keywords,
    } : b));
    const targetBook = books.find(b => b.id === completionTarget);
    setCompletionTarget(null);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#10B981", "#34D399", "#FBBF24", "#F472B6"] });
    if (calendarConnected && targetBook) {
      completeBookEvent(targetBook.title, new Date().toISOString().split("T")[0]).then(ok => {
        if (ok) showToast("구글 캘린더에 완독이 반영되었습니다");
      });
    }
  };

  const handleCompleteSkip = () => {
    if (!completionTarget) return;
    setBooks(prev => prev.map(b => b.id === completionTarget ? { ...b, status: "completed" as const, completed_at: new Date().toISOString().split("T")[0] } : b));
    setCompletionTarget(null);
  };

  const handleReviewSave = (data: CompletionData) => {
    if (!reviewTarget) return;
    setBooks(prev => prev.map(b => b.id === reviewTarget.id ? { ...b, note: data.note, rating: data.rating, keywords: data.keywords } : b));
    setReviewTarget(null);
  };

  const handleDelete = (id: string) => setBooks(prev => prev.filter(b => b.id !== id));

  const handleSaveStartDate = (d: string) => { setStartDate(d); setStartDateState(d); };

  // Derived data
  const filteredBooks = filter === "all" ? books : books.filter(b => b.status === filter);
  const start = new Date(startDate);
  const now = new Date();
  const daysPassed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
  const daysRemaining = Math.max(0, challengeDays - daysPassed);
  const dayProgress = Math.min(challengeDays, daysPassed);

  // Pacemaker prediction
  const pace = daysPassed > 0 ? (completedCount / daysPassed) * challengeDays : 0;

  // Category insights
  const categoryData: Record<string, number> = {};
  books.filter(b => b.status === "completed").forEach(b => { categoryData[b.category] = (categoryData[b.category] || 0) + 1; });
  const sortedCategories = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);
  const maxCat = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-neutral-950">
      <div className="flex flex-col lg:flex-row max-w-[1400px] mx-auto">

        {/* ═══════════ LEFT SIDEBAR ═══════════ */}
        <aside className="w-full lg:w-80 lg:flex-shrink-0 lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto scrollbar-hide bg-gray-50/50 dark:bg-neutral-900 lg:border-r border-b lg:border-b-0 border-gray-100 dark:border-neutral-800 p-4 lg:p-5 space-y-5">
          {/* Logo + Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 28 28" width="28" height="28" className="flex-shrink-0">
                <path d="M4 22 Q4 18 8 18 L20 18 Q24 18 24 22 L24 24 Q24 26 22 26 L6 26 Q4 26 4 24 Z" fill="currentColor" className="text-neutral-300 dark:text-neutral-600" />
                <path d="M6 18 L6 22 Q6 24 8 24 L20 24 Q22 24 22 22 L22 18" fill="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <line x1="14" y1="18" x2="14" y2="24" stroke="currentColor" strokeWidth="0.5" className="text-neutral-400 dark:text-neutral-500" />
                <path d="M14 18 L14 10" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M14 12 C10 8 8 11 12 13" fill="#10B981" />
                <path d="M14 10 C18 6 20 9 16 11" fill="#34D399" />
                <circle cx="14" cy="8" r="1.2" fill="#10B981" />
              </svg>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">독서 기록</span>
                  {isProChallenge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 font-semibold">PRO</span>
                  )}
                </div>
                {profile?.name && (
                  <span className="text-xs text-gray-500 dark:text-neutral-400">{profile.name}님의 챌린지</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDark}
                className={`relative w-10 h-5.5 rounded-full transition-colors duration-300 flex items-center px-0.5 ${
                  darkMode ? "bg-emerald-500" : "bg-gray-300"
                }`}
                style={{ height: 22, width: 40 }}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform duration-300 ${
                    darkMode ? "translate-x-[18px]" : "translate-x-0"
                  }`}
                >
                  {darkMode ? <Moon className="w-2.5 h-2.5 text-emerald-500" /> : <Sun className="w-2.5 h-2.5 text-amber-400" />}
                </div>
              </button>
              <button onClick={() => setShowSettings(true)} className="p-1.5 rounded-lg text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={async () => { await signOut(); window.location.href = "/login"; }} className="p-1.5 rounded-lg text-gray-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors" title="로그아웃">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Live readers counter */}
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] text-gray-400 dark:text-neutral-500">현재 <span className="font-semibold text-gray-600 dark:text-neutral-300">{Math.floor(80 + Math.random() * 60)}명</span>의 모험가가 함께 읽고 있어요</p>
          </div>

          {/* Fire Streak */}
          {streak > 0 && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium ${
              streak >= 7 ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" : "bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400"
            }`}>
              <span>🔥</span>
              <span>{streak}일 연속 독서 중</span>
              {streak >= 7 && <span className="text-[9px] ml-1">FEVER!</span>}
            </div>
          )}

          {/* Profile Vision Card */}
          {profile && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-4 relative group/profile">
              <button onClick={() => setShowVisionEdit(true)} className="absolute top-3 right-3 opacity-0 group-hover/profile:opacity-100 transition-opacity text-gray-300 dark:text-neutral-600 hover:text-gray-500 dark:hover:text-neutral-400">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <p className="text-base font-semibold text-gray-900 dark:text-white">{profile.name}</p>
              {profile.motto && <p className="text-[11px] text-gray-400 dark:text-neutral-500 italic mt-0.5 truncate">&ldquo;{profile.motto}&rdquo;</p>}
              {profile.goals && profile.goals.filter(g => g).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {profile.goals.filter(g => g).map((g, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium">• {g}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Countdown */}
          <Countdown endDate={new Date(new Date(startDate).getTime() + challengeDays * 86400000)} />

          {/* Season System (PRO only) */}
          {isProChallenge && mounted && (() => {
            const s = calculateSeason(startDate, challengeDays);
            return (
              <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Season {s.season}</span>
                  <span className="text-[10px] text-gray-400 dark:text-neutral-500">D+{s.dayInSeason}/{s.seasonDays}</span>
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-2">{s.seasonName}</p>
                <div className="h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(s.dayInSeason / s.seasonDays) * 100}%` }} />
                </div>
              </div>
            );
          })()}

          {/* Growth Tree */}
          {mounted && (() => {
            const progress = daysPassed / challengeDays;
            const stage = progress < 0.25 ? 0 : progress < 0.5 ? 1 : progress < 0.75 ? 2 : 3;
            const treeColors = ["#6EE7B7", "#34D399", "#10B981", "#059669"];
            const treeSizes = [8, 14, 20, 26];
            return (
              <div className="flex flex-col items-center py-3">
                <svg viewBox="0 0 40 50" width="48" height="60">
                  <rect x="18" y={50 - treeSizes[stage] - 8} width="4" height={treeSizes[stage] + 8} rx="2" fill="#92400E" opacity="0.6" />
                  {stage >= 0 && <circle cx="20" cy={50 - treeSizes[stage] - 10} r={treeSizes[stage] / 2 + 4} fill={treeColors[stage]} opacity="0.8" />}
                  {stage >= 1 && <circle cx="14" cy={50 - treeSizes[stage] - 6} r={treeSizes[stage] / 3 + 2} fill={treeColors[stage]} opacity="0.6" />}
                  {stage >= 1 && <circle cx="26" cy={50 - treeSizes[stage] - 6} r={treeSizes[stage] / 3 + 2} fill={treeColors[stage]} opacity="0.6" />}
                  {stage >= 2 && <circle cx="12" cy={50 - treeSizes[stage] - 14} r={treeSizes[stage] / 4 + 1} fill={treeColors[stage]} opacity="0.5" />}
                  {stage >= 2 && <circle cx="28" cy={50 - treeSizes[stage] - 14} r={treeSizes[stage] / 4 + 1} fill={treeColors[stage]} opacity="0.5" />}
                  {stage >= 3 && <circle cx="20" cy={50 - treeSizes[stage] - 20} r={treeSizes[stage] / 3} fill="#FBBF24" opacity="0.7" />}
                  <ellipse cx="20" cy="48" rx="12" ry="2" fill="#D1D5DB" opacity="0.3" />
                </svg>
                <p className="text-[9px] text-gray-400 dark:text-neutral-500 mt-1">
                  {["🌱 새싹", "🌿 작은 나무", "🌳 풍성한 나무", "🌍 세계수"][stage]}
                </p>
              </div>
            );
          })()}

          {/* Dashboard Widgets (stacked vertically in sidebar) */}
          <div className="space-y-3 lg:space-y-3 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-0">

          {/* Card 1: D-Day — Character Grid */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm dark:shadow-none p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-gray-400 dark:text-neutral-500 tracking-wide uppercase">챌린지 진행</span>
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">D+{daysPassed}</span>
            </div>
            <div className="relative">
              <div className="max-h-[180px] overflow-y-auto scrollbar-hide" style={{ scrollSnapType: "y mandatory" }}>
                <div className="grid grid-cols-10 gap-1 p-1">
                  {Array.from({ length: challengeDays }, (_, i) => {
                    const isToday = i === dayProgress - 1 && dayProgress > 0;
                    const isPassed = i < dayProgress && !isToday;
                    return (
                      <div key={i} className="flex items-center justify-center" style={{ width: 24, height: 24, scrollSnapAlign: i % 10 === 0 ? "start" : undefined }}>
                        {isToday ? (
                          <svg viewBox="0 0 20 20" width="22" height="22">
                            <circle cx="10" cy="11" r="7" fill="#FBBF24" />
                            <ellipse cx="10" cy="6" rx="5" ry="3.5" fill="#92400E" />
                            <circle cx="7.5" cy="11" r="0.8" fill="#78350F" />
                            <line x1="11" y1="10.5" x2="13" y2="10.5" stroke="#78350F" strokeWidth="0.8" strokeLinecap="round" />
                            <path d="M 8 13.5 Q 10 15 12 13.5" fill="none" stroke="#78350F" strokeWidth="0.7" strokeLinecap="round" />
                            <rect x="9" y="1" width="2" height="3" rx="1" fill="#78350F" />
                          </svg>
                        ) : isPassed ? (
                          <svg viewBox="0 0 20 20" width="20" height="20">
                            <circle cx="10" cy="12" r="6" fill="#6EE7B7" />
                            <circle cx="8" cy="11.5" r="0.7" fill="#065F46" />
                            <circle cx="12" cy="11.5" r="0.7" fill="#065F46" />
                            <path d="M 8.5 13.5 Q 10 15 11.5 13.5" fill="none" stroke="#065F46" strokeWidth="0.6" strokeLinecap="round" />
                            <path d="M 10 6 C 7 4 5 7 8 8" fill="#34D399" />
                            <path d="M 10 6 C 13 4 15 7 12 8" fill="#34D399" />
                            <line x1="10" y1="6" x2="10" y2="9" stroke="#059669" strokeWidth="0.7" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 20 20" width="18" height="18">
                            <circle cx="10" cy="11" r="6" fill="#F3F4F6" />
                            <line x1="7.5" y1="11" x2="9" y2="11" stroke="#D1D5DB" strokeWidth="0.7" strokeLinecap="round" />
                            <line x1="11" y1="11" x2="12.5" y2="11" stroke="#D1D5DB" strokeWidth="0.7" strokeLinecap="round" />
                            <circle cx="10" cy="7" r="1.5" fill="#E5E7EB" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white dark:from-neutral-900 to-transparent pointer-events-none rounded-t-xl" />
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent pointer-events-none rounded-b-xl" />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 text-center mt-2">{daysRemaining}일 남음 · {Math.round((dayProgress / challengeDays) * 100)}%</p>
          </div>

          {/* Card 2: Goal — Arc Gauge (SVG) */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm dark:shadow-none p-5 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 self-start">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-gray-400 dark:text-neutral-500 tracking-wide uppercase">목표 달성</span>
            </div>
            <div className="relative w-48 h-28">
              <svg viewBox="0 0 200 110" className="w-full h-full">
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f3f4f6" strokeWidth="14" strokeLinecap="round" />
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#10B981" strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${(Math.min(completedCount, challengeGoal) / challengeGoal) * 251.2} 251.2`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{completedCount}</p>
                <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">/ {challengeGoal}권</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-2">{Math.round((completedCount / challengeGoal) * 100)}% 달성</p>
            <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 w-fit mx-auto">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <p className="text-[10px] text-emerald-600 font-medium">
                {daysPassed > 0 ? `${challengeDays}일 후 약 ${Math.round(pace)}권 예상` : "첫 완독 후 표시"}
              </p>
            </div>
          </div>

          {/* Card 3: Category — Bubble Chart */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm dark:shadow-none p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-gray-400 dark:text-neutral-500 tracking-wide uppercase">카테고리 분석</span>
            </div>
            {sortedCategories.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-xs text-gray-300 dark:text-neutral-600">완독한 책이 없습니다</p>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2 min-h-[120px]">
                {sortedCategories.map(([cat, count]) => {
                  const total = books.filter(b => b.status === "completed").length;
                  const pct = Math.round((count / total) * 100);
                  const size = Math.max(52, Math.min(90, 40 + (count / maxCat) * 50));
                  const bc = BUBBLE_COLORS[cat] || BUBBLE_COLORS["기타"];
                  return (
                    <div
                      key={cat}
                      className={`rounded-full ${bc.bg} flex flex-col items-center justify-center`}
                      style={{ width: size, height: size }}
                    >
                      <span className={`text-[10px] font-semibold leading-tight text-center px-1 truncate max-w-full ${bc.text}`}>{cat}</span>
                      <span className={`text-[9px] ${bc.text} opacity-70`}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>


          {/* Live Activity Feed */}
          {mounted && (
            <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">실시간 소식</span>
              </div>
              {[
                { name: "지식탐험가", action: "완독", book: "사피엔스", emoji: "👏" },
                { name: "독서광", action: "읽기 시작", book: "원씽", emoji: "📖" },
                { name: "새벽독서러", action: "완독", book: "아토믹 해빗", emoji: "🎉" },
              ].slice(0, 2).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <p className="text-gray-500 dark:text-neutral-400">
                    <span className="font-medium text-gray-700 dark:text-neutral-300">{item.name}</span>님이 &apos;{item.book}&apos; {item.action} {item.emoji}
                  </p>
                  <button className="text-[10px] text-gray-300 dark:text-neutral-600 hover:text-orange-400 dark:hover:text-orange-400 transition-colors" title="응원하기">🔥</button>
                </div>
              ))}
            </div>
          )}

          {/* Pace Comparison */}
          {mounted && completedCount > 0 && (() => {
            const avgPace = 0.28;
            const myPace = daysPassed > 0 ? completedCount / daysPassed : 0;
            const diff = Math.round(((myPace - avgPace) / avgPace) * 100);
            const isFaster = diff > 0;
            return (
              <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
                <p className="text-[10px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">내 페이스 vs 평균</p>
                <div className="space-y-1.5 mb-2">
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5"><span className="text-gray-500 dark:text-neutral-400">나</span><span className="font-medium text-gray-700 dark:text-neutral-300">{completedCount}권</span></div>
                    <div className="h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (completedCount / challengeGoal) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5"><span className="text-gray-500 dark:text-neutral-400">평균</span><span className="font-medium text-gray-400 dark:text-neutral-500">{Math.round(avgPace * daysPassed)}권</span></div>
                    <div className="h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-300 dark:bg-neutral-600 rounded-full" style={{ width: `${Math.min(100, (avgPace * daysPassed / challengeGoal) * 100)}%` }} />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-neutral-400">
                  {isFaster
                    ? `🔥 다른 모험가들보다 ${Math.abs(diff)}% 더 빠르게 지식을 쌓고 있어요!`
                    : `📚 평균보다 조금 천천히 가고 있어요. 오늘 10분만 더 읽어볼까요?`
                  }
                </p>
              </div>
            );
          })()}

          {/* Pacemaker - Similar pace users */}
          {mounted && (
            <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
              <p className="text-[10px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">함께 달리는 모험가</p>
              <div className="space-y-2">
                {[
                  { name: "지식탐험가", dday: daysPassed - 2, books: Math.max(0, completedCount - 1) },
                  { name: "새벽독서러", dday: daysPassed + 1, books: completedCount },
                  { name: "독서왕꿈나무", dday: daysPassed - 3, books: Math.max(0, completedCount + 1) },
                ].map((u, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[8px] font-bold text-emerald-600 dark:text-emerald-400">{u.name[0]}</div>
                      <div>
                        <p className="text-[11px] font-medium text-gray-700 dark:text-neutral-300">{u.name}</p>
                        <p className="text-[9px] text-gray-400 dark:text-neutral-500">D+{u.dday} · {u.books}권</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-emerald-500 mt-2 font-medium">함께 {Math.round((completedCount / challengeGoal) * 100)}% 지점을 통과 중이에요! 🔥</p>
            </div>
          )}

          {/* AI Coach Widget */}
          {mounted && completedCount > 0 && (() => {
            return (
              <div className="rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 bg-white dark:bg-neutral-900 p-4 space-y-3 relative overflow-hidden">
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: "inset 0 0 20px rgba(16, 185, 129, 0.05)" }} />
                <div className="flex items-center gap-1.5 relative">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">AI 독서 코치</span>
                </div>
                <div className="space-y-2 relative">
                  {aiReport ? (
                    <>
                      <div className="text-[11px] text-gray-600 dark:text-neutral-400 leading-relaxed">💡 {aiReport.growth_summary}</div>
                      <div className="text-[11px] text-gray-600 dark:text-neutral-400 leading-relaxed">🔗 {aiReport.knowledge_connection}</div>
                      <div className="text-[11px] text-gray-600 dark:text-neutral-400 leading-relaxed">📚 {aiReport.next_step_advice}</div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
                      <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse w-4/5" />
                      <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse w-3/5" />
                    </div>
                  )}
                </div>
                <button onClick={fetchAiReport} className="text-[10px] text-emerald-500 hover:text-emerald-600 font-medium relative">새 리포트 생성 →</button>
              </div>
            );
          })()}

          {/* Quote */}
          <div className="px-1">
            <p className="text-[10px] text-gray-400 dark:text-neutral-600 italic leading-relaxed">{quote}</p>
          </div>
        </aside>

        {/* ═══════════ RIGHT MAIN CONTENT ═══════════ */}
        <main className="flex-1 min-w-0 p-4 lg:p-6 pb-16 lg:overflow-y-auto">

        {/* Remind Banner */}
        {showRemind && !remindDismissed && profile && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl px-5 py-3 mb-4 flex items-center justify-between">
            <button onClick={() => setShowVisionEdit(true)} className="flex items-center gap-2 text-left flex-1">
              <span className="text-base">🌿</span>
              <div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{profile.name}님, 처음에 약속했던 다짐을 기억하시나요?</p>
                {profile.motto && <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 mt-0.5 italic">&ldquo;{profile.motto}&rdquo;</p>}
              </div>
            </button>
            <button onClick={() => { setRemindDismissed(true); setShowRemind(false); }}
              className="text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 ml-2 flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 완독 도서 전용 책장 (Hall of Fame) */}
        {(() => {
          const shelfBooks = books.filter(b => b.status === "completed" && b.note);
          const emptyCount = Math.max(0, challengeGoal - shelfBooks.length);
          return (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm dark:shadow-none p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-gray-400 dark:text-neutral-500 tracking-wide uppercase">완독 도서 전용 책장</span>
                <span className="text-[10px] text-gray-300 dark:text-neutral-600 ml-auto">{shelfBooks.length} / {challengeGoal}</span>
              </div>
              <div className="relative">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 pt-8" style={{ scrollSnapType: "x mandatory" }}>
                  {shelfBooks.map(book => (
                    <div key={book.id} onClick={() => setEditTarget(book)}
                      className="flex-shrink-0 relative group cursor-pointer" style={{ scrollSnapAlign: "start" }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10 pointer-events-none max-w-[160px] truncate">
                        {book.note}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                      </div>
                      <div className="w-10 h-14 rounded overflow-hidden bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 transition-all group-hover:-translate-y-2 group-hover:shadow-md group-hover:border-emerald-400">
                        {book.cover_url ? (
                          <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {Array.from({ length: emptyCount }, (_, i) => (
                    <div key={`e-${i}`} className="flex-shrink-0 w-10 h-14 rounded border border-dashed border-gray-200 dark:border-neutral-700 bg-gray-50/30 dark:bg-neutral-800/30 flex items-center justify-center">
                      <span className="text-[8px] text-gray-200 dark:text-neutral-700 font-medium select-none">{shelfBooks.length + i + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="h-[2px] bg-gray-200 dark:bg-neutral-800 rounded-full" />
              </div>
            </div>
          );
        })()}

        {/* 33권 컬렉션 맵 버튼 */}
        <button onClick={() => setShowCollection(true)}
          className="w-full h-12 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors mb-6">
          <Award className="w-4 h-4" />
          나의 {challengeGoal}권 컬렉션 맵 보기 ({books.filter(b => b.status === "completed" && b.note).length}/{challengeGoal})
        </button>

        {/* ═══════════════ Reading Timeline (Gantt) ═══════════════ */}
        {(() => {
          const timelineBooks = books.filter(b => b.started_at);
          if (timelineBooks.length === 0) return null;

          const challengeStart = new Date(startDate);
          const totalDays = challengeDays;
          const today = new Date();
          const todayStr = today.toISOString().split("T")[0];

          const dayWidth = 12;
          const totalWidth = totalDays * dayWidth;
          const rowHeight = 32;
          const headerHeight = 24;

          const todayOffset = Math.max(0, Math.min(totalDays, Math.floor((today.getTime() - challengeStart.getTime()) / 86400000)));

          const weekLabels: { day: number; label: string }[] = [];
          for (let d = 0; d <= totalDays; d += 7) {
            const date = new Date(challengeStart.getTime() + d * 86400000);
            const m = date.getMonth() + 1;
            const dd = date.getDate();
            weekLabels.push({ day: d, label: `${m}/${dd}` });
          }

          const sorted = [...timelineBooks].sort((a, b) => {
            const da = new Date(a.started_at!).getTime();
            const db = new Date(b.started_at!).getTime();
            return da - db;
          });

          const lanes: { end: number }[] = [];
          const bookLanes: { book: Book; lane: number; startDay: number; endDay: number }[] = [];

          sorted.forEach(book => {
            const bStart = Math.max(0, Math.floor((new Date(book.started_at!).getTime() - challengeStart.getTime()) / 86400000));
            const endDate = book.completed_at ? new Date(book.completed_at) : today;
            const bEnd = Math.min(totalDays, Math.max(bStart + 1, Math.floor((endDate.getTime() - challengeStart.getTime()) / 86400000)));

            let assigned = -1;
            for (let i = 0; i < lanes.length; i++) {
              if (lanes[i].end <= bStart) {
                assigned = i;
                lanes[i].end = bEnd;
                break;
              }
            }
            if (assigned === -1) {
              assigned = lanes.length;
              lanes.push({ end: bEnd });
            }

            bookLanes.push({ book, lane: assigned, startDay: bStart, endDay: bEnd });
          });

          const totalRows = lanes.length;
          const chartHeight = totalRows * rowHeight;

          return (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm dark:shadow-none p-5 mb-6">
              <button
                onClick={() => setShowTimeline(prev => !prev)}
                className="flex items-center justify-between w-full mb-0"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-gray-400 dark:text-neutral-500 tracking-wide uppercase">독서 타임라인</span>
                  <span className="text-[10px] text-gray-300 dark:text-neutral-600">{timelineBooks.length}권</span>
                </div>
                {showTimeline ? (
                  <ChevronUp className="w-4 h-4 text-gray-300 dark:text-neutral-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-300 dark:text-neutral-600" />
                )}
              </button>

              {showTimeline && (
                <div className="mt-4 overflow-x-auto overflow-y-auto max-h-[300px] scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                  <div style={{ width: totalWidth + 120, minWidth: "100%" }}>
                    <div className="flex items-end" style={{ height: headerHeight, marginLeft: 120 }}>
                      <div className="relative" style={{ width: totalWidth, height: headerHeight }}>
                        {weekLabels.map(wl => (
                          <span
                            key={wl.day}
                            className="absolute text-[10px] text-gray-400 dark:text-neutral-500 select-none"
                            style={{ left: wl.day * dayWidth, top: 0, transform: "translateX(-50%)" }}
                          >
                            {wl.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="relative" style={{ height: chartHeight, marginTop: 4 }}>
                      {weekLabels.map(wl => (
                        <div
                          key={`grid-${wl.day}`}
                          className="absolute top-0 bottom-0 border-l border-gray-50 dark:border-neutral-800"
                          style={{ left: 120 + wl.day * dayWidth }}
                        />
                      ))}

                      {todayOffset >= 0 && todayOffset <= totalDays && (
                        <div
                          className="absolute top-0 bottom-0 border-l-2 border-emerald-500 z-10"
                          style={{ left: 120 + todayOffset * dayWidth }}
                        >
                          <div className="absolute -top-0.5 -left-[5px] w-[10px] h-[10px] rounded-full bg-emerald-500" />
                        </div>
                      )}

                      {bookLanes.map(({ book, lane, startDay, endDay }) => {
                        const barLeft = 120 + startDay * dayWidth;
                        const barWidth = Math.max(dayWidth, (endDay - startDay) * dayWidth);
                        const barTop = lane * rowHeight + 4;
                        const isCompleted = book.status === "completed";
                        const barColor = isCompleted ? "bg-emerald-200" : "bg-blue-100";
                        const borderColor = isCompleted ? "border-emerald-300" : "border-blue-200";

                        const startStr = book.started_at || "";
                        const endStr = book.completed_at || todayStr;
                        const tooltipText = `${book.title}: ${startStr} ~ ${endStr}`;

                        return (
                          <div
                            key={book.id}
                            className="absolute group"
                            style={{ top: barTop, height: rowHeight - 8 }}
                          >
                            <div
                              className="absolute right-full pr-2 top-0 bottom-0 flex items-center"
                              style={{ width: 116 }}
                            >
                              <span className="text-[11px] text-gray-500 dark:text-neutral-400 truncate block w-full text-right font-medium">
                                {book.title}
                              </span>
                            </div>

                            <div
                              onClick={() => setEditTarget(book)}
                              className={`${barColor} ${borderColor} border rounded-md h-full cursor-pointer hover:opacity-80 transition-opacity flex items-center px-1.5 overflow-hidden`}
                              style={{ marginLeft: barLeft, width: barWidth }}
                            >
                              {barWidth > 60 && (
                                <span className="text-[10px] text-gray-600 dark:text-neutral-300 truncate font-medium">{book.title}</span>
                              )}
                            </div>

                            <div
                              className="absolute z-20 bg-gray-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                              style={{ left: barLeft + barWidth / 2, transform: "translateX(-50%)", bottom: "calc(100% + 4px)" }}
                            >
                              {tooltipText}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                            </div>
                          </div>
                        );
                      })}

                      {Array.from({ length: totalRows }, (_, i) => (
                        <div
                          key={`row-${i}`}
                          className="absolute left-0 right-0 border-b border-gray-50 dark:border-neutral-800"
                          style={{ top: (i + 1) * rowHeight }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Book List Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">내 서재</h2>
            <span className="text-xs text-gray-400 dark:text-neutral-500">{books.length}권</span>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors">
            <Plus className="w-3.5 h-3.5" />도서 추가
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-1.5 mb-4">
          {(["all", "not_started", "reading", "completed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-gray-900 dark:bg-neutral-800 text-white" : "bg-white dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600"}`}>
              {f === "all" ? "전체" : STATUS_MAP[f].label}
            </button>
          ))}
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map(book => {
            const st = STATUS_MAP[book.status];
            const Icon = st.icon;
            return (
              <div key={book.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm dark:shadow-none p-4 hover:border-gray-200 dark:hover:border-neutral-700 transition-colors relative group">
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
                  <button onClick={() => setEditTarget(book)}
                    className="w-7 h-7 rounded-xl bg-white dark:bg-neutral-800 shadow-md dark:shadow-black/30 flex items-center justify-center text-gray-600 dark:text-neutral-300 hover:text-emerald-500 transition-all active:scale-95">
                    <Edit3 className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                  <button onClick={() => { if (window.confirm("정말 이 도서를 삭제하시겠습니까?")) handleDelete(book.id); }}
                    className="w-7 h-7 rounded-xl bg-white dark:bg-neutral-800 shadow-md dark:shadow-black/30 flex items-center justify-center text-gray-600 dark:text-neutral-300 hover:text-red-500 transition-all active:scale-95">
                    <Trash2 className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                </div>

                <div className="w-full h-40 rounded-xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center overflow-hidden mb-3 relative">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <BookOpen className="w-8 h-8 text-gray-200 dark:text-neutral-700" />
                  )}
                  {book.status === "completed" && book.rating > 0 && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} viewBox="0 0 24 24" width="22" height="22" fill={s <= book.rating ? "#FFFFFF" : "rgba(255,255,255,0.25)"}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 z-10">
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.color} backdrop-blur-sm`}>
                      <Icon className="w-2.5 h-2.5" />{st.label}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{book.title}</h4>
                  <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5 truncate">{book.author || "저자 미입력"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium ${CAT_COLORS[book.category] || "bg-gray-50 text-gray-500"}`}>
                      {book.category}
                    </span>
                    {book.keywords && book.keywords.length > 0 && book.keywords.map(kw => (
                      <span key={kw} className="text-[9px] text-gray-400 dark:text-neutral-500">#{kw}</span>
                    ))}
                  </div>
                </div>

                {book.status === "completed" && book.note && (
                  <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-2 line-clamp-2 leading-relaxed">{book.note}</p>
                )}

                <div className="mt-3 flex items-center">
                  {book.status === "not_started" && (
                    <button onClick={() => handleStartReading(book.id)}
                      className="w-full py-2 rounded-lg border border-emerald-500 text-emerald-600 text-xs font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                      읽기 시작
                    </button>
                  )}
                  {book.status === "reading" && (
                    <button onClick={() => setCompletionTarget(book.id)}
                      className="w-full py-2 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors">
                      완독 처리
                    </button>
                  )}
                  {book.status === "completed" && (
                    <button onClick={() => setReviewTarget(book)}
                      className="ml-auto p-1.5 rounded-lg text-gray-300 dark:text-neutral-600 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-10 h-10 text-gray-200 dark:text-neutral-700 mx-auto mb-3" />
            <p className="text-sm text-gray-400 dark:text-neutral-500">등록된 도서가 없습니다</p>
            <p className="text-xs text-gray-300 dark:text-neutral-600 mt-1">도서 추가 버튼을 눌러 시작하세요</p>
          </div>
        )}
        </main>
      </div>

      {/* Modals */}
      <BookFormModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAdd} />
      <BookFormModal open={!!editTarget} onClose={() => setEditTarget(null)} onSubmit={handleEdit} initial={editTarget || undefined} />
      <CompletionModal open={!!completionTarget} onClose={() => setCompletionTarget(null)} onSubmit={handleComplete} onSkip={handleCompleteSkip} completedCount={completedCount} />
      <ReviewEditModal open={!!reviewTarget} onClose={() => setReviewTarget(null)} onSubmit={handleReviewSave} book={reviewTarget} />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} currentDate={startDate} onSave={handleSaveStartDate} calendarConnected={calendarConnected} onCalendarToggle={() => {
        const next = !calendarConnected;
        setCalendarConnected(next);
        setCalendarConnectedState(next);
        showToast(next ? "캘린더 연동이 활성화되었습니다" : "캘린더 연동이 해제되었습니다");
      }} isPublic={isPublic} onPublicToggle={togglePublic} />
      <ReportModal open={showReport} onClose={() => setShowReport(false)} books={books} startDate={startDate} onOpenCertificate={() => { setShowReport(false); setShowCertificate(true); }} />
      <VisionEditModal open={showVisionEdit} onClose={() => setShowVisionEdit(false)} profile={profile} onSave={setProfile} />

      {/* Collection Map Modal */}
      {showCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setShowCollection(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xl w-full max-w-2xl p-6 sm:p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{challengeGoal}권 컬렉션 맵</h3>
                <span className="text-xs text-gray-400 dark:text-neutral-500">{books.filter(b => b.status === "completed" && b.note).length}/{challengeGoal}</span>
              </div>
              <button onClick={() => setShowCollection(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: challengeGoal }, (_, i) => {
                const completed = books.filter(b => b.status === "completed" && b.note);
                const book = completed[i] || null;
                const isMilestone = i === 10 || i === 21;
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-xl overflow-hidden flex items-center justify-center transition-all cursor-default ${
                      book
                        ? `bg-emerald-50 dark:bg-emerald-900/20 border-2 ${isMilestone ? "border-amber-400 ring-1 ring-amber-200 dark:ring-amber-800" : "border-emerald-300 dark:border-emerald-700"} hover:scale-105 cursor-pointer`
                        : `bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 ${isMilestone ? "border-dashed border-amber-300 dark:border-amber-700" : ""}`
                    }`}
                    onClick={() => book && setEditTarget(book)}
                  >
                    {book ? (
                      book.cover_url ? (
                        <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 text-center leading-tight px-0.5">{book.title.slice(0, 4)}</span>
                      )
                    ) : (
                      <span className={`text-sm font-medium select-none ${isMilestone ? "text-amber-300 dark:text-amber-600" : "text-gray-200 dark:text-neutral-700"}`}>{i + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300" /><span className="text-[10px] text-gray-400">완독</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded border-2 border-amber-400" /><span className="text-[10px] text-gray-400">마일스톤 (11, 22권)</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700" /><span className="text-[10px] text-gray-400">미완</span></div>
            </div>
          </div>
        </div>
      )}
      <CertificateModal open={showCertificate} onClose={() => setShowCertificate(false)} books={books} profile={profile} startDate={startDate} />
      <SuccessTransitionModal open={showSuccessTransition} onClose={() => setShowSuccessTransition(false)} onAccept={handleAcceptProChallenge} />
      <ToastProvider />
    </div>
  );
}
