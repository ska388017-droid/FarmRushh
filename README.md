# FarmRush - Neon Cyber Mining v2.5.1

A high-performance Telegram Mini App (TMA) built with Next.js, Genkit, and Firebase. Optimized for the Telegram WebApp environment with strict economy controls and secure administrative protocols.

## 🚀 Version 2.5.1 Features

- **Economy Stabilization**: All game-based rewards (Chests, Flip, Boss) capped at 3,000 CyberCoins to prevent inflation.
- **Manual-Only Mining**: Passive background income removed; energy consumption and tap-rewards are now 100% user-driven.
- **VIP Earning Protocol**: Tiered investment plans (Silver, Gold, Diamond) with manual verification and high-yield daily rewards.
- **Secure Admin Hub**: Protected by **ADMIN123** security key; real-time management of VIP status and Payout ledgers.
- **Advanced Referral Engine**: Real-time verification ladder (3 ads/tasks) to prevent fake referrals and botting.
- **Mobile-First Design**: Optimized viewport with `overflow-x: hidden` and versioned cache busting for instant SDK syncing.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Firebase Firestore & Auth
- **AI Engine**: Genkit 1.x (Google Gemini)
- **Styling**: Tailwind CSS + ShadCN UI (Neon Cyber Theme)
- **Ads**: Monetag Rewarded SDK integration

## 📂 Deployment & Security

- **Cache Busting**: Versioned SDK links and storage keys ensure users always load the latest build.
- **Admin Protocol**: Access the dashboard at `/admin`. Enter security key to initialize grid access.
