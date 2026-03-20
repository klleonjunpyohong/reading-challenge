"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { saveProfile, hasProfile } from "@/lib/storage";
import confetti from "canvas-confetti";

export default function StartPage() {
  const [screen, setScreen] = useState<"landing" | "form">("landing");
  const [fadeIn, setFadeIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [existing, setExisting] = useState(false);

  const [name, setName] = useState("");
  const [motto, setMotto] = useState("");
  const [goal1, setGoal1] = useState("");
  const [goal2, setGoal2] = useState("");
  const [goal3, setGoal3] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    setExisting(hasProfile());
    setTimeout(() => setFadeIn(true), 100);
    const saved = localStorage.getItem("reading-dark-mode");
    if (saved === "true" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("reading-dark-mode", String(next));
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const endDateStr = (() => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 100);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveProfile({ name: name.trim(), motto: motto.trim(), goals: [goal1, goal2, goal3].filter(g => g.trim()), startDate });
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ["#10B981", "#34D399", "#6EE7B7", "#FFD700"] });
    setTimeout(() => { window.location.href = "/"; }, 1200);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Dark toggle */}
      <div className="fixed top-5 right-5 z-50">
        <button onClick={toggleDark}
          className={`relative rounded-full flex items-center px-0.5 transition-colors ${darkMode ? "bg-emerald-500" : "bg-gray-300"}`}
          style={{ height: 22, width: 40 }}>
          <div className={`w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform duration-300 ${darkMode ? "translate-x-[18px]" : "translate-x-0"}`}>
            {darkMode ? <Moon className="w-2.5 h-2.5 text-emerald-500" /> : <Sun className="w-2.5 h-2.5 text-amber-400" />}
          </div>
        </button>
      </div>

      {screen === "landing" ? (
        <div className={`flex flex-col items-center justify-center min-h-screen px-6 transition-all duration-700 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {/* Logo */}
          <svg viewBox="0 0 28 28" width="60" height="60" className="mb-8">
            <path d="M4 22 Q4 18 8 18 L20 18 Q24 18 24 22 L24 24 Q24 26 22 26 L6 26 Q4 26 4 24 Z" fill="currentColor" className="text-neutral-300 dark:text-neutral-600" />
            <path d="M6 18 L6 22 Q6 24 8 24 L20 24 Q22 24 22 22 L22 18" fill="currentColor" className="text-neutral-200 dark:text-neutral-700" />
            <path d="M14 18 L14 10" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14 12 C10 8 8 11 12 13" fill="#10B981" />
            <path d="M14 10 C18 6 20 9 16 11" fill="#34D399" />
            <circle cx="14" cy="8" r="1.2" fill="#10B981" />
          </svg>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">100일, 33권.</h1>
          <p className="text-gray-500 dark:text-neutral-400 text-center text-sm max-w-xs leading-relaxed">당신의 인생을 바꿀 지적인 모험을 시작합니다.</p>

          {existing ? (
            <div className="mt-10 flex flex-col items-center gap-3">
              <a href="/" className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm inline-block">내 대시보드로 이동</a>
              <button onClick={() => { localStorage.removeItem("reading-challenge-profile"); setExisting(false); }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors">새로 시작하기</button>
            </div>
          ) : (
            <button onClick={() => setScreen("form")}
              className="mt-10 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm">
              챌린지 시작하기
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen px-4 py-12">
          <form onSubmit={handleSubmit} className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">챌린지 설정</h2>
              <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">100일간의 여정을 준비합니다</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-300 mb-1">모험가님의 이름</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="이름을 입력하세요"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:outline-none focus:border-emerald-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-300 mb-1">각오 한마디</label>
              <input type="text" value={motto} onChange={e => setMotto(e.target.value)} maxLength={50} placeholder="나에게 100일 33권이란?"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:outline-none focus:border-emerald-500" />
              <p className="text-[10px] text-gray-400 text-right mt-0.5">{motto.length}/50</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-300 mb-1">이 도전을 통해 얻고 싶은 3가지</label>
              <div className="space-y-2">
                {[{v: goal1, s: setGoal1, n: 1}, {v: goal2, s: setGoal2, n: 2}, {v: goal3, s: setGoal3, n: 3}].map(({v, s, n}) => (
                  <div key={n} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-500 w-5 text-center">{n}</span>
                    <input type="text" value={v} onChange={e => s(e.target.value)} placeholder={`목표 ${n}`}
                      className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-neutral-300 mb-1">시작 날짜</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:outline-none focus:border-emerald-500" />
              <p className="text-[10px] text-gray-400 mt-0.5">종료 예정일: {endDateStr} (100일 후)</p>
            </div>

            <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm">
              챌린지 정식 시작
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
