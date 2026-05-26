import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';

// Cache busting version
const APP_VERSION = "2.5.1";

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
        {/* Telegram WebApp SDK with Cache Busting */}
        <script src={`https://telegram.org/js/telegram-web-app.js?v=${APP_VERSION}`} async></script>
        {/* Monetag SDK with Cache Busting */}
        <script src={`//libtl.com/sdk.js?v=${APP_VERSION}`} data-zone='11042868' data-sdk='show_11042868' async></script>
      </head>
      <body className="font-body antialiased selection:bg-primary selection:text-white overflow-x-hidden w-screen min-h-screen">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
