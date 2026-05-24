import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FarmRush - Neon Cyber Farming',
  description: 'The ultimate cyberpunk farming experience with rewards.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        {/* Telegram WebApp SDK */}
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
        {/* Monetag SDK */}
        <script src='//libtl.com/sdk.js' data-zone='11042868' data-sdk='show_11042868' async></script>
      </head>
      <body className="font-body antialiased selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
