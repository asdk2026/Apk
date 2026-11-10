# Business Mind - Retail Business Management System

A complete offline-first retail business management and POS platform designed for grocery stores, supermarkets, retail shops, and multi-variant product merchants.

## 📱 Android APK & Downloads
- Download the latest Android APK directly from **[GitHub Releases](https://github.com/asdk2026/Apk/releases)** (`BusinessMind-v1.0.0.apk`).
- Supports Android 7.0 (Nougat) and higher.
- Built-in camera barcode scanning, offline SQLite caching, and bidirectional price/weight calculations.

## 🚀 Key Features
- **Bidirectional POS Calculation**: Real-time two-way formula calculation between Price and Weight/Size.
- **Multi-Variant Product Inventory**: Unlimited qualities, sizes, weights, and automated Low Stock warning banners.
- **Due & Customer Management**: Customer balances, credit limits, transaction histories, and repayment tracking.
- **Purchase & Supplier Procurement**: Supplier bills, cost tracking, and stock restocking.
- **Profit & Loss Analytics**: Real-time gross margin, net profit, operational expense tracking, and visual breakdown.
- **Bilingual Interface**: Seamless instant toggle between English and Bengali (বাংলা).
- **Barcode & QR Scanner**: Camera-powered continuous hardware-assisted scanning.
- **Offline-First Resilience**: Automatic local persistence with synchronization.

## 🛠️ Building the Android APK Locally
```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Build web assets
npm run build

# 3. Sync native Android project
npx cap sync android

# 4. Build APK with Gradle
cd android
./gradlew assembleDebug
```
The compiled APK will be located at `android/app/build/outputs/apk/debug/app-debug.apk`.
