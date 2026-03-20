"use client";

import React from "react";
import { Award } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Book } from "@/lib/database.types";
import { ChallengeProfile } from "@/lib/storage";

export default function CertificateModal({ open, onClose, books, profile, startDate }: {
  open: boolean; onClose: () => void; books: Book[]; profile: ChallengeProfile | null; startDate: string;
}) {
  const completed = books.filter(b => b.status === "completed");
  const start = new Date(startDate);
  const end = new Date(start.getTime() + 100 * 86400000);
  const periodStr = `${start.toLocaleDateString("ko-KR")} ~ ${end.toLocaleDateString("ko-KR")}`;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="max-h-[80vh] overflow-y-auto scrollbar-hide">
        {/* Certificate Card */}
        <div className="border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/30 dark:to-neutral-800 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-3">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-[10px] tracking-[0.2em] text-emerald-600 dark:text-emerald-400 font-semibold uppercase mb-1">Certificate of Completion</p>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">100일 독서 챌린지 완독 인증서</h3>
          <div className="w-12 h-0.5 bg-emerald-300 dark:bg-emerald-700 mx-auto my-3" />

          <p className="text-sm text-gray-700 dark:text-neutral-300 mb-1">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{profile?.name || "챌린저"}</span> 님은
          </p>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">{periodStr}</p>
          <p className="text-sm text-gray-700 dark:text-neutral-300 mb-4">
            총 <span className="font-bold text-emerald-600 dark:text-emerald-400">{completed.length}권</span>의 도서를 완독하였습니다.
          </p>

          {/* Book list */}
          <div className="text-left bg-white/60 dark:bg-neutral-900/60 rounded-xl p-3 mb-4 max-h-[200px] overflow-y-auto scrollbar-hide">
            <p className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 mb-2 uppercase tracking-wider">완독 도서 목록</p>
            <div className="space-y-1">
              {completed.map((b, i) => (
                <p key={b.id} className="text-[11px] text-gray-600 dark:text-neutral-400 truncate">
                  <span className="text-gray-300 dark:text-neutral-600 mr-1.5">{String(i + 1).padStart(2, "0")}.</span>
                  {b.title}
                </p>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-gray-400 dark:text-neutral-500">
            {new Date().toLocaleDateString("ko-KR")} 발행
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-neutral-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors">닫기</button>
          <button onClick={() => window.print()} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors">이미지로 저장</button>
        </div>
      </div>
    </Modal>
  );
}
