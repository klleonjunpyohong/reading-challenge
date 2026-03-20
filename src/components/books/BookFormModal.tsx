"use client";

import React, { useEffect, useState } from "react";
import { X, BookCopy, Smartphone, Headphones } from "lucide-react";
import Modal from "@/components/ui/Modal";
import ImagePasteArea from "@/components/books/ImagePasteArea";
import { CATEGORIES } from "@/utils/constants";
import { BookFormData } from "@/types";

export default function BookFormModal({ open, onClose, onSubmit, initial }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BookFormData) => void;
  initial?: Partial<BookFormData>;
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("자기계발");
  const [coverUrl, setCoverUrl] = useState("");
  const [bookType, setBookType] = useState<"paper" | "ebook" | "audio">("paper");
  const [goal, setGoal] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [completedAt, setCompletedAt] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(initial?.title || "");
      setAuthor(initial?.author || "");
      setCategory(initial?.category || "자기계발");
      setCoverUrl(initial?.cover_url || "");
      setBookType(initial?.book_type || "paper");
      setGoal(initial?.goal || "");
      setStartedAt(initial?.started_at || "");
      setCompletedAt(initial?.completed_at || "");
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(), author: author.trim(), category, cover_url: coverUrl,
      book_type: bookType, goal: goal.trim(),
      started_at: startedAt || null, completed_at: completedAt || null,
    });
  };

  const BOOK_TYPES = [
    { value: "paper" as const, label: "종이책", icon: BookCopy },
    { value: "ebook" as const, label: "전자책", icon: Smartphone },
    { value: "audio" as const, label: "오디오북", icon: Headphones },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">{initial ? "도서 정보 수정" : "새 도서 등록"}</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"><X className="w-4 h-4 text-gray-400 dark:text-neutral-500" /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide pr-1">
        {/* Title & Author */}
        <div className="space-y-2">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="책 제목 *" required
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
          <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="저자"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
        </div>

        {/* Category Grid (Minimal) */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2">카테고리</p>
          <div className="grid grid-cols-3 gap-1">
            {CATEGORIES.map(cat => {
              const CatIcon = cat.icon;
              const selected = category === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                    selected
                      ? "text-emerald-500"
                      : "text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300"
                  }`}
                >
                  <CatIcon className="w-5 h-5" />
                  <span className="text-[10px] font-medium leading-tight">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Book Type - Segmented Control */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2">도서 유형</p>
          <div className="flex gap-1.5 bg-gray-100 dark:bg-neutral-800 p-1 rounded-xl">
            {BOOK_TYPES.map(bt => {
              const BtIcon = bt.icon;
              return (
                <button
                  key={bt.value}
                  type="button"
                  onClick={() => setBookType(bt.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    bookType === bt.value
                      ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300"
                  }`}
                >
                  <BtIcon className="w-3.5 h-3.5" />
                  {bt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2">독서 기간</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 dark:text-neutral-500 mb-0.5 block">시작일</label>
              <input type="date" value={startedAt} onChange={e => setStartedAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 dark:text-neutral-500 mb-0.5 block">종료일 (예정)</label>
              <input type="date" value={completedAt} onChange={e => setCompletedAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2">표지 이미지</p>
          <ImagePasteArea value={coverUrl} onChange={setCoverUrl} />
        </div>

        {/* Goal */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2">기대평 / 목표</p>
          <textarea value={goal} onChange={e => setGoal(e.target.value)}
            placeholder="이 책을 통해 얻고 싶은 것은..." rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none" />
        </div>

        {/* Submit */}
        <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
          {initial ? "수정 완료" : "등록하기"}
        </button>
      </form>
    </Modal>
  );
}
