"use client";

import React, { useRef } from "react";
import { X, ImageIcon } from "lucide-react";

export default function ImagePasteArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) processFile(file);
        return;
      }
      if (items[i].type === "text/plain") {
        items[i].getAsString(text => {
          if (text.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)/i)) onChange(text);
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleClick = () => {
    if (value) return;
    fileRef.current?.click();
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <div
        onClick={handleClick}
        onPaste={handlePaste}
        tabIndex={0}
        className={`w-full h-32 rounded-xl flex items-center justify-center cursor-pointer focus:outline-none transition-all overflow-hidden ${
          value ? "border-2 border-emerald-300 bg-emerald-50/30 dark:bg-emerald-900/20" : "border-2 border-dashed border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600 focus:border-emerald-400"
        }`}
      >
        {value ? (
          <div className="relative w-full h-full">
            <img src={value} alt="표지" className="w-full h-full object-contain p-2" />
            <button
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-700"
            >
              <X className="w-3 h-3 text-gray-400 dark:text-neutral-500" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon className="w-6 h-6 text-gray-300 dark:text-neutral-600 mx-auto mb-1.5" />
            <p className="text-[11px] text-gray-400 dark:text-neutral-500">클릭하여 이미지 선택</p>
            <p className="text-[10px] text-gray-300 dark:text-neutral-600 mt-0.5">또는 Ctrl+V로 붙여넣기</p>
          </div>
        )}
      </div>
    </div>
  );
}
