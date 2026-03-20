import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "독서 기록 서비스 | 100일 33권 챌린지",
  description: "100일 동안 33권 읽기 독서 챌린지 트래커. AI 독서 코치와 함께 지적 성장을 기록하세요.",
  keywords: ["독서 챌린지", "100일 33권", "독서 기록", "독서 습관", "읽기 챌린지", "독서 트래커"],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "독서 기록 서비스 | 100일 33권 챌린지",
    description: "100일 동안 33권 읽기. AI 코치와 함께하는 지적 모험.",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "독서 기록 서비스",
    description: "100일 33권 독서 챌린지 트래커",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-pretendard antialiased min-h-screen bg-[#F9FAFB] dark:bg-neutral-950">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
