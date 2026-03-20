"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { ChallengeProfile, saveProfile } from "@/lib/storage";

export default function VisionEditModal({ open, onClose, profile, onSave }: {
  open: boolean; onClose: () => void; profile: ChallengeProfile | null;
  onSave: (p: ChallengeProfile) => void;
}) {
  const [name, setName] = useState("");
  const [motto, setMotto] = useState("");
  const [goals, setGoals] = useState(["", "", ""]);

  useEffect(() => {
    if (open && profile) {
      setName(profile.name);
      setMotto(profile.motto);
      setGoals(profile.goals.length >= 3 ? [...profile.goals] : [...profile.goals, "", "", ""].slice(0, 3));
    }
  }, [open, profile]);

  const updateGoal = (i: number, v: string) => {
    const g = [...goals];
    g[i] = v;
    setGoals(g);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">챌린지 비전 수정</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"><X className="w-4 h-4 text-gray-400" /></button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-gray-400 dark:text-neutral-500 block mb-1">이름</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 dark:text-neutral-500 block mb-1">각오 한마디</label>
          <input value={motto} onChange={e => setMotto(e.target.value)} maxLength={50}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 dark:text-neutral-500 block mb-1">목표 3가지</label>
          <div className="space-y-2">
            {goals.map((g, i) => (
              <input key={i} value={g} onChange={e => updateGoal(i, e.target.value)} placeholder={`목표 ${i + 1}`}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500" />
            ))}
          </div>
        </div>
        <button onClick={() => {
          if (!name.trim() || !profile) return;
          const updated = { ...profile, name: name.trim(), motto: motto.trim(), goals };
          saveProfile(updated);
          onSave(updated);
          onClose();
        }} className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">저장하기</button>
      </div>
    </Modal>
  );
}
