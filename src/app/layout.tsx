import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/frontend/components/layout/navigation";
import { Footer } from "@/frontend/components/layout/footer";
import { Toaster } from "sonner";
import { AuthProvider } from "@/frontend/components/shared/auth-context";
import { ChatbotWidget } from "@/frontend/components/features/ChatbotWidget";
import { PerformanceMonitor } from "@/frontend/components/shared/performance-monitor";
import { PreviewBadge } from "@/frontend/components/shared/preview-badge";

export const metadata: Metadata = {
  title: "Diskominfo - Dinas Komunikasi dan Informatika Kab. Penajam Paser Utara",
  description: "Website resmi Dinas Komunikasi dan Informatika Kabupaten Penajam Paser Utara. Melayani masyarakat dalam bidang komunikasi, informatika, statistik, dan persandian.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased bg-gray-50 text-gray-900">
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
          <Footer />
          <ChatbotWidget />
          <PerformanceMonitor />
          <PreviewBadge />
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: {
                borderRadius: '12px',
                fontSize: '13px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

