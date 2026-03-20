"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

interface ToastData {
  message: string;
  type: ToastType;
}

let toastCallback: ((data: ToastData) => void) | null = null;

export function showToast(message: string, type: ToastType = "success") {
  toastCallback?.({ message, type });
}

const TOAST_CONFIG: Record<ToastType, {
  icon: typeof CheckCircle2;
  light: string;
  dark: string;
  iconColor: string;
}> = {
  success: {
    icon: CheckCircle2,
    light: "bg-white border-emerald-200",
    dark: "dark:bg-neutral-900 dark:border-emerald-800",
    iconColor: "text-emerald-500",
  },
  error: {
    icon: AlertCircle,
    light: "bg-white border-red-200",
    dark: "dark:bg-neutral-900 dark:border-red-800",
    iconColor: "text-red-500",
  },
  warning: {
    icon: AlertTriangle,
    light: "bg-white border-amber-200",
    dark: "dark:bg-neutral-900 dark:border-amber-800",
    iconColor: "text-amber-500",
  },
};

export default function ToastProvider() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    toastCallback = (data: ToastData) => {
      setToast(data);
      setVisible(true);
      setTimeout(() => setVisible(false), 2700);
      setTimeout(() => setToast(null), 3000);
    };
    return () => { toastCallback = null; };
  }, []);

  if (!toast) return null;

  const config = TOAST_CONFIG[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={`fixed top-5 right-5 z-[60] flex items-center gap-3 border rounded-xl shadow-lg px-4 py-3 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      } ${config.light} ${config.dark}`}
      style={{ maxWidth: 360 }}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
      <span className="text-sm font-medium text-gray-800 dark:text-neutral-200">{toast.message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => setToast(null), 200); }}
        className="text-gray-300 dark:text-neutral-600 hover:text-gray-500 dark:hover:text-neutral-400 ml-1 flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
