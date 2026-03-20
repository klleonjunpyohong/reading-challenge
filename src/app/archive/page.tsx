"use client";

import { useEffect, useState } from "react";
import { getArchives } from "@/lib/storage";
import { BookOpen, ArrowLeft, Award } from "lucide-react";
import Link from "next/link";

interface ArchiveEntry {
  type: string;
  books: any[];
  profile: any;
  completedAt: string;
}

const CHALLENGE_LABELS: Record<string, string> = {
  "100days_33books": "100일 33권 챌린지",
  "365days_100expert": "365일 전공 서적 100권 챌린지",
};

export default function ArchivePage() {
  const [archives, setArchives] = useState<ArchiveEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setArchives(getArchives());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-neutral-950 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500 dark:text-neutral-400" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">완료된 챌린지</h1>
            <p className="text-xs text-gray-400 dark:text-neutral-500">과거에 완수한 챌린지 기록입니다</p>
          </div>
        </div>

        {/* Archives */}
        {archives.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-gray-200 dark:text-neutral-700 mx-auto mb-3" />
            <p className="text-sm text-gray-400 dark:text-neutral-500">아직 완료된 챌린지가 없습니다</p>
            <p className="text-xs text-gray-300 dark:text-neutral-600 mt-1">챌린지를 완수하면 이곳에 기록됩니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {archives.map((archive, i) => {
              const completedBooks = archive.books.filter((b: any) => b.status === "completed");
              const completedDate = new Date(archive.completedAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              return (
                <div
                  key={i}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm dark:shadow-none p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Award className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {CHALLENGE_LABELS[archive.type] || archive.type}
                        </h3>
                        <p className="text-[11px] text-gray-400 dark:text-neutral-500">{completedDate} 완료</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold">
                      완수
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{completedBooks.length}</p>
                      <p className="text-[10px] text-gray-400 dark:text-neutral-500">완독</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{archive.books.length}</p>
                      <p className="text-[10px] text-gray-400 dark:text-neutral-500">전체</p>
                    </div>
                    {archive.profile?.name && (
                      <div className="ml-auto text-right">
                        <p className="text-xs font-medium text-gray-600 dark:text-neutral-300">{archive.profile.name}</p>
                        {archive.profile.motto && (
                          <p className="text-[10px] text-gray-400 dark:text-neutral-500 italic">&ldquo;{archive.profile.motto}&rdquo;</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Book list preview */}
                  {completedBooks.length > 0 && (
                    <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3 max-h-[120px] overflow-y-auto scrollbar-hide">
                      <div className="space-y-1">
                        {completedBooks.slice(0, 10).map((b: any, j: number) => (
                          <p key={j} className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">
                            <span className="text-gray-300 dark:text-neutral-600 mr-1.5">{String(j + 1).padStart(2, "0")}.</span>
                            {b.title}
                          </p>
                        ))}
                        {completedBooks.length > 10 && (
                          <p className="text-[10px] text-gray-300 dark:text-neutral-600">+{completedBooks.length - 10}권 더</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
