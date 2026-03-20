"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { CompletionData } from "@/types";

/* ═══════════════ Star Rating ═══════════════ */
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star} type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill={(hover || value) >= star ? "#FBBF24" : "#E5E7EB"} stroke="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════ Keyword Tag Input ═══════════════ */
function KeywordInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const kw = input.trim();
    if (kw && value.length < 3 && !value.includes(kw)) {
      onChange([...value, kw]);
      setInput("");
    }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map(kw => (
          <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
            #{kw}
            <button type="button" onClick={() => onChange(value.filter(k => k !== kw))} className="hover:text-emerald-800 dark:hover:text-emerald-300">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      {value.length < 3 && (
        <div className="flex gap-1.5">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            placeholder="키워드 입력 (최대 3개)"
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors" />
          <button type="button" onClick={add} className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 text-xs font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">추가</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ Exported: StarRating & KeywordInput for reuse ═══════════════ */
export { StarRating, KeywordInput };

/* ═══════════════ Completion Celebration Modal ═══════════════ */
export default function CompletionModal({ open, onClose, onSubmit, onSkip, completedCount }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CompletionData) => void;
  onSkip: () => void;
  completedCount: number;
}) {
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(0);
  const [keywords, setKeywords] = useState<string[]>([]);
  useEffect(() => { if (open) { setNote(""); setRating(0); setKeywords([]); } }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">🎉</div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">완독을 축하합니다!</h3>
        <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">100일 프로젝트의 <span className="font-bold text-emerald-500">{completedCount + 1}번째</span> 책을 정복하셨어요!</p>
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
        {/* Star Rating */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2">만족도</p>
          <div className="flex justify-center">
            <StarRating value={rating} onChange={setRating} />
          </div>
        </div>

        {/* Keywords */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2">핵심 키워드</p>
          <KeywordInput value={keywords} onChange={setKeywords} />
        </div>

        {/* Note */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2">한 줄 평</p>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="이 책이 나에게 준 가장 큰 변화는 무엇인가요?" rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none" />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={onSkip} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">건너뛰기</button>
        <button onClick={() => onSubmit({ note, rating, keywords })} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors">완독 기록 저장</button>
      </div>
    </Modal>
  );
}
