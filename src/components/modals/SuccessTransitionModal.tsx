"use client";

import React from "react";

export default function SuccessTransitionModal({ open, onClose, onAccept }: {
  open: boolean; onClose: () => void; onAccept: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xl w-full max-w-md p-6 text-center" onClick={e => e.stopPropagation()}>
        <div className="text-5xl mb-4">🏆</div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">100일 챌린지를 완수하셨습니다!</h3>
        <p className="text-xs text-gray-400 dark:text-neutral-500 mb-6">33권의 책이 당신을 성장시켰습니다</p>

        {/* Next challenge card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 mb-5 text-left border border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">다음 도전</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 font-semibold">PRO</span>
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">365일 전공 서적 100권 읽기</h4>
          <p className="text-[11px] text-gray-500 dark:text-neutral-400 leading-relaxed">습관을 넘어 전문가로 성장할 시간입니다. 1년간 100권의 전문 서적에 도전해보세요.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
            나중에 할게요
          </button>
          <button onClick={onAccept} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
            도전하기 🔥
          </button>
        </div>
      </div>
    </div>
  );
}
