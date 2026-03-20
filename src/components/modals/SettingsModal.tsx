"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Modal from "@/components/ui/Modal";

export default function SettingsModal({ open, onClose, currentDate, onSave, calendarConnected, onCalendarToggle, isPublic, onPublicToggle }: {
  open: boolean; onClose: () => void; currentDate: string; onSave: (d: string) => void;
  calendarConnected: boolean; onCalendarToggle: () => void;
  isPublic: boolean; onPublicToggle: () => void;
}) {
  const [date, setDate] = useState(currentDate);
  useEffect(() => { if (open) setDate(currentDate); }, [open, currentDate]);
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">챌린지 설정</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"><X className="w-4 h-4 text-gray-400 dark:text-neutral-500" /></button>
      </div>
      <label className="text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1 block">시작일</label>
      <input type="date" value={date} onChange={e => setDate(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors mb-4" />
      {/* Calendar Connection */}
      <div className="border-t border-gray-100 dark:border-neutral-800 pt-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-neutral-300">구글 캘린더 연동</p>
            <p className="text-[10px] text-gray-400 dark:text-neutral-500">독서 일정을 캘린더에 자동 등록</p>
          </div>
          <button
            type="button"
            onClick={onCalendarToggle}
            className={`relative rounded-full flex items-center px-0.5 transition-colors ${calendarConnected ? "bg-emerald-500" : "bg-gray-300 dark:bg-neutral-700"}`}
            style={{ height: 22, width: 40 }}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${calendarConnected ? "translate-x-[18px]" : "translate-x-0"}`} />
          </button>
        </div>
      </div>
      {/* Public Profile */}
      <div className="border-t border-gray-100 dark:border-neutral-800 pt-3 mt-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-neutral-300">내 서재 공개</p>
            <p className="text-[10px] text-gray-400 dark:text-neutral-500">다른 모험가에게 활동을 공유</p>
          </div>
          <button type="button" onClick={onPublicToggle}
            className={`relative rounded-full flex items-center px-0.5 transition-colors ${isPublic ? "bg-emerald-500" : "bg-gray-300 dark:bg-neutral-700"}`}
            style={{ height: 22, width: 40 }}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isPublic ? "translate-x-[18px]" : "translate-x-0"}`} />
          </button>
        </div>
      </div>
      <button onClick={() => { onSave(date); onClose(); }} className="w-full py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors mt-4">저장</button>
    </Modal>
  );
}
