# 📱 BookMyBox — Mobile Android Application(Capacitor)

Cross-platform mobile wrapper for **BookMyBox** powered by **CapacitorJS**, enabling native Android APK generation and native mobile device capabilities.

---

## 🌟 Features & Mobile Capabilities

* **🤖 Native Android APK**: Built with Capacitor Android runtime for installation on Android smartphones.
* **⚡ Native WebView Performance**: Wraps the BookMyBox React frontend with hardware-accelerated web view.
* **🔔 Native Push & Device APIs**: Ready for native push notifications, geolocation, and device storage integration.
* **📱 Splash Screens & App Icons**: Custom Android app icons and branded splash screens.

---

## 🛠️ Stack & Dependencies

| Tool | Purpose |
| :--- | :--- |
| **Capacitor Core & Android** | Native bridge & build tools |
| **Android Studio / Gradle** | Android APK compilation environment |
| **React & Web Dist** | Synced web assets located in `www/` |

---

## ⚙️ Building the Android APK

### 1. Install Dependencies
```bash
npm install
```

### 2. Sync Web Build Artifacts with Native Project
```bash
npx cap sync android
```

### 3. Open in Android Studio
```bash
npx cap open android
```
From Android Studio, select **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate the `.apk` file for distribution.
