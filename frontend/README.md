# 🎨 BookMyBox — Frontend Web Client

The responsive web client for **BookMyBox**, providing an interactive user UI, real-time slot selection, Google Gemini AI booking prompt/voice bar, Cashfree checkout integration, and an owner administration dashboard. Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Socket.IO-client**.

---

## 🌟 Key Features

* **⚡ Real-Time Dynamic Grid**: Visual slot booking layout updated live over WebSockets without requiring full page refreshes.
* **🎙️ AI Prompt & Voice Assistant**: Interactive conversational component using Google Gemini AI to auto-parse user booking intent into date and time selections.
* **💳 Integrated Cashfree Payment**: Embedded Cashfree JS SDK checkout overlay for seamless card, UPI, and net banking payments.
* **📱 Responsive & PWA Ready**: Optimized mobile layout with mobile bottom navigation bar and dynamic touch interactions.
* **🔑 Authentication Flow**: Phone number OTP login, JWT persistence, and protected routes for user history & admin controls.
* **🛠️ Admin Management Panel**: Owner interface for managing box properties, toggling slot availability, blocking dates, and viewing revenue reports.

---

## 🛠️ Stack & Dependencies

| Tool / Library | Purpose |
| :--- | :--- |
| **React 18 & TypeScript** | Component UI engine & type safety |
| **Vite** | Next-generation build tool & dev server |
| **Tailwind CSS** | Utility-first responsive styling system |
| **Socket.IO Client** | Real-time WebSocket connection to backend |
| **Axios** | HTTP client with automatic auth header interceptors |
| **React Router v6** | Single Page Application (SPA) client-side routing |
| **Lucide React** | Modern vector icon set |

---

## 📂 Architecture & Directory Structure

```
frontend/
├── public/           # Favicons, sitemap.xml, robots.txt, static assets
├── src/
│   ├── components/   # UI elements (AI Assistant, Slot Grid, Navbars, Modals)
│   ├── context/      # React Context (AuthContext, SocketContext)
│   ├── pages/        # Route pages (Home, BoxDetails, Checkout, UserBookings, Admin)
│   ├── services/     # Axios API service handlers & endpoints
│   ├── store/        # State management helpers
│   ├── utils/        # Date formatting, price calculators, storage utilities
│   ├── App.tsx       # Core router setup & global providers
│   └── main.tsx      # Application entry point
├── Dockerfile        # Production NGINX deployment container
├── nginx.conf        # NGINX SPA routing configuration
└── vite.config.ts    # Vite bundler options
```

---

## 💻 Setup & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` based on `.env.example`:
```bash
cp .env.example .env.local
```

### 3. Start Local Development Server
```bash
npm run dev
```
Access the web client at `http://localhost:5173`.

### 4. Build Production Bundle
```bash
npm run build
```
The output bundle will be compiled into the `dist/` directory.
