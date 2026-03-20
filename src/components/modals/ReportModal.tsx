"use client";

import React from "react";
import { Award } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Book } from "@/lib/database.types";

export default function ReportModal({ open, onClose, books, startDate, onOpenCertificate }: {
  open: boolean; onClose: () => void; books: Book[]; startDate: string; onOpenCertificate: () => void;
}) {
  const completed = books.filter(b => b.status === "completed");
  const start = new Date(startDate);
  const now = new Date();
  const days = Math.max(1, Math.floor((now.getTime() - start.getTime()) / 86400000));
  const categories: Record<string, number> = {};
  completed.forEach(b => { categories[b.category] = (categories[b.category] || 0) + 1; });
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

  // Monthly completion data
  const monthlyData: Record<string, number> = {};
  completed.forEach(b => {
    if (b.completed_at) {
      const d = new Date(b.completed_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = (monthlyData[key] || 0) + 1;
    }
  });
  const monthlyEntries = Object.entries(monthlyData).sort((a, b) => a[0].localeCompare(b[0]));
  const maxMonthly = Math.max(1, ...monthlyEntries.map(e => e[1]));

  // Category donut data
  const catEntries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  const catTotal = completed.length || 1;
  const DONUT_COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#F97316", "#6B7280"];

  // Build SVG donut segments
  const donutSegments: { offset: number; length: number; color: string; label: string; count: number }[] = [];
  let cumulative = 0;
  catEntries.forEach(([cat, count], i) => {
    const pct = (count / catTotal) * 100;
    donutSegments.push({ offset: cumulative, length: pct, color: DONUT_COLORS[i % DONUT_COLORS.length], label: cat, count });
    cumulative += pct;
  });

  return (
    <Modal open={open} onClose={onClose}>
      <div className="max-h-[80vh] overflow-y-auto scrollbar-hide">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <Award className="w-7 h-7 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">🎊 33권 완독 달성!</h3>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mb-5">나의 100일 프로젝트 리포트</p>

          {/* Stats */}
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 text-left space-y-2.5 mb-4">
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-neutral-400">완독 권수</span><span className="font-bold text-gray-900 dark:text-white">{completed.length}권</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-neutral-400">소요 기간</span><span className="font-bold text-gray-900 dark:text-white">{days}일</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-neutral-400">가장 많이 읽은 분야</span><span className="font-bold text-gray-900 dark:text-white">{topCategory ? `${topCategory[0]} (${topCategory[1]}권)` : "-"}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-neutral-400">하루 평균</span><span className="font-bold text-gray-900 dark:text-white">{(completed.length / days).toFixed(1)}권/일</span></div>
          </div>

          {/* Monthly Bar Chart */}
          {monthlyEntries.length > 0 && (
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 mb-4 text-left">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-3">월별 완독 수</p>
              <div className="space-y-2">
                {monthlyEntries.map(([month, count]) => (
                  <div key={month} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 dark:text-neutral-400 w-14 text-right flex-shrink-0">{month}</span>
                    <div className="flex-1 h-5 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 dark:bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${(count / maxMonthly) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-700 dark:text-neutral-300 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Donut Chart */}
          {catEntries.length > 0 && (
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 mb-5 text-left">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-3">카테고리 분포</p>
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 36 36" className="w-24 h-24 flex-shrink-0 -rotate-90">
                  {donutSegments.map((seg, i) => (
                    <circle
                      key={i}
                      cx="18" cy="18" r="15.915"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="3.5"
                      strokeDasharray={`${seg.length} ${100 - seg.length}`}
                      strokeDashoffset={`${-seg.offset}`}
                    />
                  ))}
                  <circle cx="18" cy="18" r="13" className="fill-gray-50 dark:fill-neutral-800" />
                </svg>
                <div className="flex-1 space-y-1">
                  {donutSegments.slice(0, 5).map((seg, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="text-[10px] text-gray-600 dark:text-neutral-400 truncate">{seg.label}</span>
                      <span className="text-[10px] font-bold text-gray-700 dark:text-neutral-300 ml-auto">{seg.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-gray-900 dark:bg-neutral-700 text-white text-sm font-medium hover:bg-gray-800 dark:hover:bg-neutral-600 transition-colors">닫기</button>
            <button onClick={onOpenCertificate} className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">인증서 보기</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
