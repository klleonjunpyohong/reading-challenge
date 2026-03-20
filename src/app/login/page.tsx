"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "@/lib/auth";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
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

  const inputClass = "w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-gray-300 dark:placeholder:text-neutral-600";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isSignUp) {
      if (!nickname.trim()) { setError("닉네임을 입력해주세요."); return; }
      if (/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s]/.test(nickname)) { setError("닉네임에 특수문자는 사용할 수 없어요."); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("올바른 이메일 형식으로 입력해주세요."); return; }
      if (password.length < 6) { setError("비밀번호는 6자 이상이어야 해요."); return; }
      if (password !== passwordConfirm) { setError("비밀번호가 일치하지 않아요."); return; }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(email, password, nickname.trim());
        if (error) setError(error.message);
        else {
          // 가입 성공 → 바로 로그인 시도
          const { error: loginError } = await signInWithEmail(email, password);
          if (loginError) {
            setSuccess("가입이 완료되었습니다! 로그인해주세요.");
            setIsSignUp(false);
          } else {
            window.location.href = "/";
          }
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          if (error.message.includes("Invalid login")) setError("이메일 또는 비밀번호가 올바르지 않습니다.");
          else setError(error.message);
        } else {
          window.location.href = "/";
        }
      }
    } catch { setError("오류가 발생했습니다."); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError("");
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setSuccess("");
    setPasswordConfirm("");
    setNickname("");
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

      <div className={`flex flex-col items-center justify-center min-h-screen px-4 transition-all duration-700 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {/* Logo */}
        <svg viewBox="0 0 28 28" width="48" height="48" className="mb-5">
          <path d="M4 22 Q4 18 8 18 L20 18 Q24 18 24 22 L24 24 Q24 26 22 26 L6 26 Q4 26 4 24 Z" fill="currentColor" className="text-neutral-300 dark:text-neutral-600" />
          <path d="M6 18 L6 22 Q6 24 8 24 L20 24 Q22 24 22 22 L22 18" fill="currentColor" className="text-neutral-200 dark:text-neutral-700" />
          <path d="M14 18 L14 10" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 12 C10 8 8 11 12 13" fill="#10B981" />
          <path d="M14 10 C18 6 20 9 16 11" fill="#34D399" />
          <circle cx="14" cy="8" r="1.2" fill="#10B981" />
        </svg>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">독서 기록 서비스</h1>
        <p className="text-xs text-gray-400 dark:text-neutral-500 mb-8">100일 33권, 당신의 여정을 안전하게 기록하세요.</p>

        {/* Card */}
        <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-6">

          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{isSignUp ? "회원가입" : "로그인"}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nickname (signup only) */}
            {isSignUp && (
              <div>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 mb-1.5">챌린지 기간 동안 사용할 이름이에요</p>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-neutral-600" />
                  <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
                    placeholder="닉네임"
                    className={`${inputClass} ${nickname && /[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s]/.test(nickname) ? "border-red-300 dark:border-red-700" : ""}`} />
                </div>
                {nickname && /[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s]/.test(nickname) && (
                  <p className="text-[10px] text-red-400 mt-1 pl-1">특수문자는 사용할 수 없어요 (한글, 영문, 숫자만 가능)</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              {isSignUp && <p className="text-[11px] text-gray-500 dark:text-neutral-400 mb-1.5">로그인과 독서 리포트 수신에 사용돼요</p>}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-neutral-600" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="이메일"
                  className={`${inputClass} ${isSignUp && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "border-red-300 dark:border-red-700" : ""}`} />
              </div>
              {isSignUp && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                <p className="text-[10px] text-red-400 mt-1 pl-1">올바른 이메일 형식으로 입력해주세요 (예: name@email.com)</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-neutral-600" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  placeholder={isSignUp ? "비밀번호 (6자 이상)" : "비밀번호"}
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:border-emerald-500 placeholder:text-gray-300 dark:placeholder:text-neutral-600 ${
                    isSignUp && password && password.length < 6
                      ? "border-red-300 dark:border-red-700"
                      : "border-gray-200 dark:border-neutral-700"
                  } dark:bg-neutral-800 dark:text-white`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-neutral-600 hover:text-gray-500 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isSignUp && password && password.length < 6 && (
                <p className="text-[10px] text-red-400 mt-1 pl-1">비밀번호는 6자 이상이어야 안전해요 (현재 {password.length}자)</p>
              )}
            </div>

            {/* Password Confirm (signup only) */}
            {isSignUp && (
              <div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-neutral-600" />
                  <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required minLength={6}
                    placeholder="비밀번호 확인"
                    className={`${inputClass} ${passwordConfirm && password !== passwordConfirm ? "border-red-300 dark:border-red-700" : ""}`} />
                </div>
                {passwordConfirm && password !== passwordConfirm && (
                  <p className="text-[10px] text-red-400 mt-1 pl-1">비밀번호가 일치하지 않아요. 다시 확인해주세요</p>
                )}
              </div>
            )}

            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-3 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-3 py-2 rounded-lg">{success}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : isSignUp ? "회원가입" : "로그인"}
            </button>
          </form>

          {/* Bottom links */}
          <div className="flex items-center justify-between mt-4">
            <button onClick={switchMode} className="text-[11px] text-emerald-500 hover:text-emerald-600 font-medium transition-colors">
              {isSignUp ? "로그인으로 돌아가기" : "회원가입"}
            </button>
            {!isSignUp && <span className="text-[11px] text-gray-300 dark:text-neutral-600">비밀번호 찾기</span>}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100 dark:bg-neutral-800" />
            <span className="text-[10px] text-gray-300 dark:text-neutral-600">또는</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-neutral-800" />
          </div>

          {/* Google */}
          <button onClick={handleGoogle}
            className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-750 transition-colors flex items-center justify-center gap-2.5 text-sm font-medium text-gray-700 dark:text-neutral-200">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google로 계속하기
          </button>

          {/* Guest link */}
          <div className="mt-4 text-center">
            <a href="/start" className="text-[11px] text-gray-300 dark:text-neutral-600 hover:text-gray-500 dark:hover:text-neutral-400 transition-colors">
              게스트로 시작하기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
