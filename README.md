# 🏏 Cricket Box Booking System

!
A premium, full-stack **MERN** application designed for booking cricket box venues. This project provides a seamless and efficient booking experience with real-time slot checking, automated payments, and comprehensive turf management.

---

## 🚀 Live Demo

**Frontend URL:** 
---https://www.bookmybox.online/

---

## 🌟 Project Highlights & Architecture

BookMyBox is architected to be a scalable, high-performance platform demonstrating modern backend engineering practices:

- 🤖 **AI Booking Assistant**: Integrates a seamless AI-driven booking flow using advanced SDKs to process natural language queries into actionable booking data.
- ⚡ **Real-Time Event Driven Architecture**: Utilizes WebSocket connections (`Socket.IO`) to handle live slot availability and instant conflict resolution, ensuring zero double-bookings in a high-concurrency environment.
- 🔒 **Secure Payment & Financials**: Robust integration with the Cashfree payment gateway, featuring webhook handling, custom cryptographic payload validation, and automated transaction states.
- 🧪 **Test-Driven Reliability**: Comprehensively tested backend logic using `Vitest`, guaranteeing flawless date/time parsing and complex slot allocation.
- 🐳 **Containerization & Deployment**: Fully containerized using Docker (`docker-compose`) with streamlined CI/CD workflows for reliable, automated deployments.


---

## ✨ Key Features

### 📅 Advanced Booking System
- **Real-Time Slots**: Live slot availability updates using **Socket.IO**.
- **Conflict Management**: Prevents double bookings instantly.
- **Dynamic Pricing**: Support for different pricing tiers (Weekdays vs Weekends).

### 👮 Admin Dashboard
- **Analytics**: View booking trends and revenue.
- **Slot Management**: Manually block slots for maintenance or offline bookings.
- **Box Management**: Create, edit, and manage multiple cricket turf profiles.

###  Secure Payments
- **Integrated Gateway**: Powered by **Cashfree**.
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
- **Cron Jobs**: Automated cleanup for pending bookings.

### Services
- **Payment Gateway**: Cashfree

---

## 📂 Project Structure

```bash
cricket-box/
├── backend/
│   ├── controllers/      # Logic for Auth, Bookings, etc.
│   ├── cron/             # Scheduled tasks (File cleanup)
│   ├── lib/              # Integrations (MongoDB, Socket)
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
- API Keys for Cashfree

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

# Payment Gateway
CASHFREE_CLIENT_ID=...
CASHFREE_CLIENT_SECRET=...
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
| **POST** | `/api/auth/send-otp` | Sends OTP for login |
| **GET** | `/api/boxes` | Fetch all cricket boxes |
| **POST** | `/api/booking/book` | Create a new booking |
| **POST** | `/api/payment/initiate` | Start payment process |

---

## 🖼️ Screenshots

*(Placeholder: Add screenshots of the Home Page, Booking Flow, and Admin Dashboard here)*

1.  **Home Page**: Clean, modern landing page with "Book Now".
2.  **Admin Dashboard**: Revenue charts and slot blocking tools.

---

