import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import Script from 'next/script';

// Cache busting version v2.5.3
const APP_VERSION = "2.5.3";

export const metadata: Metadata = {
  title: 'FarmRush - Neon Cyber Mining',
  description: 'The ultimate cyberpunk mining experience with rewards.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        {/* Adsterra Anti-Adblock/Verification Placeholder */}
        <meta name="adsterra-verification" content="5808596" />
      </head>
      <body className="font-body antialiased selection:bg-primary selection:text-white overflow-x-hidden w-screen min-h-screen relative">
        {/* Telegram WebApp SDK */}
        <Script 
          src={`https://telegram.org/js/telegram-web-app.js?v=${APP_VERSION}`} 
          strategy="beforeInteractive" 
        />

        {/* Telegram Initialization Script */}
        <Script id="telegram-init" strategy="afterInteractive">
          {`
            if (window.Telegram && window.Telegram.WebApp) {
              window.Telegram.WebApp.ready();
              window.Telegram.WebApp.expand();
              console.log("Telegram Protocol v${APP_VERSION} Stable");
            }
          `}
        </Script>

        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>

        {/* Adsterra Social Bar Integration (ID: 29460513) */}
        <Script
          src={`//pl29460513.highratecpm.com/ec/2e/9a/ec2e9ab4e9f78367d26e4e5b5e5e5e5e.js?v=${APP_VERSION}`}
          strategy="afterInteractive"
        />

        {/* Adsterra Popunder Integration (ID: 29460514) */}
        <Script
          src={`//pl29460514.highratecpm.com/71/82/e3/7182e3f454f76274472390f05808e002.js?v=${APP_VERSION}`}
          strategy="afterInteractive"
        />

        {/* Adsterra Monitor & Interaction Trigger */}
        <Script id="adsterra-monitor" strategy="lazyOnload">
          {`
            console.log("Adsterra Grid v${APP_VERSION} Initialized...");
            window.addEventListener('click', function() {
              console.log("Global Interaction Recorded - Ad Unit Triggered");
            }, { once: true });
          `}
        </Script>
      </body>
    </html>
  );
}
