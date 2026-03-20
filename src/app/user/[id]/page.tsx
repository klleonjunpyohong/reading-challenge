"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface PublicProfile {
  id: string;
  nickname: string;
  bio: string;
  is_public: boolean;
  start_date: string;
}

interface PublicBook {
  id: string;
  title: string;
  category: string;
  status: string;
  completed_at: string | null;
}

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [books, setBooks] = useState<PublicBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("reading-dark-mode");
    if (
      saved === "true" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!url || url.includes("placeholder") || url.includes("your-project")) {
          setIsLocal(true);
          setLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, nickname, bio, is_public, start_date")
          .eq("id", userId)
          .eq("is_public", true)
          .single();

        if (profileError || !profileData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProfile(profileData as PublicProfile);

        const { data: booksData } = await supabase
          .from("books")
          .select("id, title, category, status, completed_at")
          .eq("user_id", userId);

        if (booksData) {
          setBooks(booksData as PublicBook[]);
        }
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [userId]);

  const completedBooks = books.filter((b) => b.status === "completed");
  const daysPassed = profile
    ? Math.max(
        0,
        Math.floor(
          (new Date().getTime() - new Date(profile.start_date).getTime()) /
            86400000
        )
      )
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-neutral-950">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLocal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-neutral-950 px-4">
        <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">📖</p>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            로컬 모드
          </h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Supabase가 연결되지 않은 로컬 환경에서는 공개 프로필을 조회할 수 없습니다.
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-neutral-950 px-4">
        <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            비공개 서재입니다
          </h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            이 모험가의 서재는 비공개로 설정되어 있습니다.
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-neutral-950 px-4 py-8">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Profile Card */}
        <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {profile?.nickname?.[0] || "?"}
            </span>
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {profile?.nickname || "모험가"}
          </h1>
          {profile?.bio && (
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
              {profile.bio}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-500">
                {completedBooks.length}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-neutral-500">
                완독
              </p>
            </div>
            <div className="w-px h-8 bg-gray-100 dark:bg-neutral-800" />
            <div className="text-center">
              <p className="text-lg font-bold text-gray-700 dark:text-neutral-300">
                D+{daysPassed}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-neutral-500">
                진행일
              </p>
            </div>
            <div className="w-px h-8 bg-gray-100 dark:bg-neutral-800" />
            <div className="text-center">
              <p className="text-lg font-bold text-gray-700 dark:text-neutral-300">
                {books.length}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-neutral-500">
                전체
              </p>
            </div>
          </div>
        </div>

        {/* Mini Collection Map */}
        <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <p className="text-[10px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
            컬렉션 맵
          </p>
          <div className="grid grid-cols-11 gap-1">
            {Array.from({ length: 33 }).map((_, i) => {
              const book = completedBooks[i];
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-md flex items-center justify-center text-[8px] font-bold ${
                    book
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                      : "bg-gray-100 dark:bg-neutral-800 text-gray-300 dark:text-neutral-600"
                  }`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <a
            href="/"
            className="text-xs text-gray-400 dark:text-neutral-500 hover:text-emerald-500 transition-colors"
          >
            나도 챌린지 시작하기 &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
