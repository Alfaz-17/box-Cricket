# 🏏 Cricket Box Booking System

!
A premium, full-stack **MERN** application designed for booking cricket box venues. This project revolutionizes the booking experience with a **Voice-Activated AI Agent** that allows users to check availability and book slots simply by speaking. It also features seamless **WhatsApp integration** for OTP verification and booking confirmations.

---

## 🚀 Live Demo

**Frontend URL:** 
---https://www.bookmybox.online/

## ✨ Key Features

### 🤖 AI Voice Assistant
- **"Talk-to-Book"**: Users can ask "Is there a slot available next Friday at 6 PM?" and get instant voice feedback.
- **Natural Language Processing**: Built with **Groq SDK (Whisper Model)** for speech-to-text and **Murf AI** for realistic text-to-speech responses.
- **Context Aware**: Remembers previous queries for a conversational experience.

### � WhatsApp Integration
- **Zero-Email Auth**: Sign up and login exclusively using **WhatsApp OTPs**.
- **Instant Notifications**: Receive booking confirmations and receipts directly on WhatsApp via **@whiskeysockets/baileys**.

### 📅 Advanced Booking System
- **Real-Time Slots**: Live slot availability updates using **Socket.IO**.
- **Conflict Management**: Prevents double bookings instantly.
- **Dynamic Pricing**: Support for different pricing tiers (Weekdays vs Weekends).

### 👮 Admin Dashboard
- **Analytics**: View booking trends and revenue.
- **Slot Management**: Manually block slots for maintenance or offline bookings.
- **Box Management**: Create, edit, and manage multiple cricket turf profiles.

### � Secure Payments
- **Integrated Gateway**: Powered by **SabPaisa**.
- **Custom Security**: Implements bespoke encryption/decryption for transaction validation.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS (assumed based on modern standards), CSS Modules
- **State Management**: React Context API
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.IO
- **Cron Jobs**: Automated cleanup for pending bookings and temporary voice files.

### AI & Services
- **Voice Transcribing**: Groq SDK (Whisper Large V3)
- **Text-to-Speech**: Murf AI
- **WhatsApp Bot**: Baileys
- **Payment Gateway**: SabPaisa

---

## 📂 Project Structure

```bash
cricket-box/
├── backend/
│   ├── controllers/      # Logic for Auth, Bookings, Voice, etc.
│   ├── cron/             # Scheduled tasks (File cleanup)
│   ├── lib/              # Integrations (WhatsApp, MongoDB, Socket)
│   ├── models/           # Mongoose Schemas
│   ├── routes/           # API Endpoints
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── pages/        # Public, User, and Admin pages
│   │   ├── components/   # Reusable UI components
│   │   └── utils/        # Helper functions (API conn, formatters)
│   └── .env              # Frontend config
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI
- API Keys for Groq, Murf AI, and SabPaisa

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173

# AI Services
GROQ_API_KEY=your_groq_key
MURF_API_KEY=your_murf_key

# Payment Gateway
SABPAISA_CLIENT_CODE=...
SABPAISA_TRANS_USERNAME=...
SABPAISA_TRANS_PASSWORD=...
```

Start the Server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
# Point this to your backend URL (Local or Deployed)
VITE_API_BASE_URL=http://localhost:5001
```

Start the Client:
```bash
npm run dev
```

---

## 📡 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/send-otp` | Sends WhatsApp OTP for login |
| **POST** | `/api/voice/check-slot` | AI Agent slot query |
| **GET** | `/api/boxes` | Fetch all cricket boxes |
| **POST** | `/api/booking/book` | Create a new booking |
| **POST** | `/api/payment/initiate` | Start payment process |

---

## 🖼️ Screenshots

*(Placeholder: Add screenshots of the Home Page, Booking Flow, and Admin Dashboard here)*

1.  **Home Page**: Clean, modern landing page with "Book Now".
2.  **Voice Agent**: Pop-up listening interface.
3.  **Admin Dashboard**: Revenue charts and slot blocking tools.

---

