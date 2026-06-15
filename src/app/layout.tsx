import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'PainPoint Tracker (통증 다이어리)',
  description: '바쁜 직장인들을 위한 초간단 통증 & 생활습관 기록 및 AI 분석 헬스케어 플랫폼',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PainPoint',
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-slate-100 flex justify-center min-h-screen text-slate-950 font-sans antialiased" suppressHydrationWarning>
        {/* Mobile Mock Container */}
        <div className="w-full max-w-md bg-slate-50 min-h-screen pb-24 shadow-2xl relative border-x border-slate-200 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 bg-white/85 backdrop-blur-md border-b border-slate-100 py-4 px-5 flex items-center justify-between z-40">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🩺</span>
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PainPoint Tracker
              </h1>
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-full border border-blue-100">
              PWA MVP
            </span>
          </header>

          {/* Page Content */}
          <main className="flex-1 px-4 py-5 overflow-x-hidden">
            {children}
          </main>

          {/* Bottom Tab Navigation */}
          <Navigation />
        </div>

        {/* SW Register script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                const isLocal = window.location.hostname === 'localhost' ||
                                window.location.hostname === '127.0.0.1' ||
                                window.location.hostname.startsWith('192.168.') ||
                                window.location.hostname.startsWith('10.') ||
                                window.location.hostname.startsWith('172.') ||
                                window.location.hostname.startsWith('169.254.');
                if (isLocal) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (let registration of registrations) {
                      registration.unregister().then(function(success) {
                        if (success) {
                          console.log('ServiceWorker unregistered successfully in development mode.');
                          window.location.reload();
                        }
                      });
                    }
                  });
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(registration) {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                      },
                      function(err) {
                        console.log('ServiceWorker registration failed: ', err);
                      }
                    );
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
