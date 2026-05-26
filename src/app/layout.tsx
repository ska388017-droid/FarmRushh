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

        {/* Adsterra Monetization - Website ID: 5808596 */}
        
        {/* Social Bar Integration (ID: 29460513) */}
        <script type='text/javascript' src='//pl29460513.highratecpm.com/ec/2e/9a/ec2e9ab4e9f78367d26e4e5b5e5e5e5e.js' async></script>

        {/* Popunder Integration (ID: 29460514) */}
        <script type='text/javascript' src='//pl29460514.highratecpm.com/71/82/e3/7182e3f454f76274472390f05808e002.js' async></script>
      </body>
    </html>
  );
}
