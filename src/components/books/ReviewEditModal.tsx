"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { StarRating, KeywordInput } from "@/components/books/CompletionModal";
import { Book } from "@/lib/database.types";
import { CompletionData } from "@/types";

export default function ReviewEditModal({ open, onClose, onSubmit, book }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CompletionData) => void;
  book: Book | null;
}) {
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(0);
  const [keywords, setKeywords] = useState<string[]>([]);
  useEffect(() => {
    if (open && book) {
      setNote(book.note || "");
      setRating(book.rating || 0);
      setKeywords(book.keywords || []);
    }
  }, [open, book]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">소감 수정</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"><X className="w-4 h-4 text-gray-400 dark:text-neutral-500" /></button>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2">만족도</p>
          <div className="flex justify-center"><StarRating value={rating} onChange={setRating} /></div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2">핵심 키워드</p>
          <KeywordInput value={keywords} onChange={setKeywords} />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2">한 줄 평</p>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none" />
        </div>
      </div>
      <button onClick={() => onSubmit({ note, rating, keywords })} className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors mt-4">저장</button>
    </Modal>
  );
}
