# ⚙️ BookMyBox — Backend Service

The core REST API and WebSocket engine powering the **BookMyBox** platform. Built with **Node.js**, **Express**, **TypeScript**, **MongoDB (Mongoose)**, **Socket.IO**, **Google Gemini GenAI**, and **Cashfree Payment Gateway**.

---

## 🚀 Key Features

* **⚡ WebSocket Slot Concurrency**: Real-time slot status propagation via Socket.IO.
* **🤖 Google Gemini AI Integration**: Parses natural language voice & text requests into structured booking queries.
* **💳 Cashfree Payment Gateway**: Generates payment session tokens and processes webhooks with HMAC SHA256 cryptographic signatures.
* **⏰ Automated Cleanup Cron Job**: Automatically releases unpaid reserved slots after a 10-minute hold window.
* **🔐 Security & Validation**: JWT-based authentication, Phone OTP verification, Zod schema validation, Helmet header security, and rate limiting.
* **📊 Analytics Engine**: Revenue statistics, booking rate metrics, and owner box management APIs.

---

## 🛠️ Stack & Dependencies

| Tool / Library | Purpose |
| :--- | :--- |
| **Node.js & TypeScript** | Runtime environment & static type system |
| **Express.js** | Web application framework & routing |
| **MongoDB & Mongoose** | Document database & ODM schema modeling |
| **Socket.IO** | Bi-directional real-time communication |
| **Google GenAI SDK** | Gemini API integration for AI assistant |
| **Winston & Morgan** | Logging & HTTP request auditing |
| **Vitest** | Unit & integration test runner |

---

## 📂 Architecture & Directory Structure

```
backend/
├── src/
│   ├── controllers/      # Route logic handlers (auth, box, slot, booking, payment, AI)
│   ├── cron/             # Scheduled tasks (expired slot releasing engine)
│   ├── lib/              # Database clients & Socket.IO initialization
│   ├── middleware/       # Auth guards, error handlers, rate limiters, validation
│   ├── models/           # Mongoose ODM schemas (User, Box, Booking, Review)
│   ├── routes/           # Express router declarations & endpoints
│   ├── utils/            # Helper functions (time formatting, cryptographic HMAC)
│   ├── validators/       # Zod validation schemas
│   └── server.ts         # Main server bootstrap & Socket.IO server setup
├── tests/                # Vitest test specs
├── Dockerfile            # Container configuration
└── tsconfig.json         # TypeScript compiler config
```

---

## 💻 Setup & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Execute Unit Tests
```bash
npm run test
```
