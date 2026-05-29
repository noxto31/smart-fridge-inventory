import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { DisclaimerBar } from "@/components/layout/DisclaimerBar";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "家庭冰箱库存管理",
  description: "管理家庭冰箱食材，追踪保质期，减少浪费",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <ToastProvider>
          <DisclaimerBar />
          <main className="pb-20 max-w-lg mx-auto">{children}</main>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
