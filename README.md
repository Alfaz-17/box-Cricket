# Box Cricket Booking System (MERN)

A **box cricket ground booking platform** with role-based features for users and owners, real-time chat, and offline/online booking management.  
This project is **backend-focused** – I designed and implemented the complete backend architecture, APIs, and database models.

---

## 🚀 Features

### Backend Responsibilities (My Focus)

- **RESTful API Development** with Express.js
- **Role-Based Booking Flow**
  - Users can book box online
  - Owners can manage offline bookings for their own box(when they have offline booking so)
  - Prevents double-booking of time slots
- **Authentication & Authorization**
  - Secure login/register with JWT
  - Role-based access control (user/owner)
  - Secure owner signup with owner code
- **Real-time Group Chat**
  - Implemented using Socket.IO
  - also real time notifications
  - Group creation ,delete, invitations, live messaging, exit fronm group
- **Database Design (MongoDB Atlas)**
  - Models for users, boxes ,blokedslots, bookings,review ,groups ,notification and messages
  - Query optimizations and validations
- **Deployment-Ready Backend**
  - Environment variables
  - Render-compatible

---

## 🛠 Tech Stack (Backend)

- **Node.js / Express.js**
- **MongoDB Atlas (Mongoose ODM)**
- **Socket.IO (WebSockets)**
- **@whiskeysockets/baileys(whatsappBot for otp)**
- **JWT (JSON Web Token) for authentication**
- **Redis upsatsh (for otp store )**
- **bullmq for background jobs(when otp send)**
- **Zustand (frontend state – to consume APIs)**


---

---

## 1. Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/verify-otp` | Verify OTP during signup/login | No |
| POST | `/signup` | Complete user signup | No |
| POST | `/login` | Login and get JWT token | No |
| POST | `/forgot-password` | Send reset password email/OTP | No |
| PUT  | `/update-profile` | Update user profile | Yes |
| POST | `/me` | Get current logged-in user profile | Yes |
| POST | `/logout` | Logout user | Yes |
| GET  | `/users` | Get all users (admin) | Yes |

---

## 2. Booking Routes (`/api/booking`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/temporary-booking` | Create a temporary booking | Yes |
| POST | `/check-slot` | Check slot availability | Yes |
| POST | `/cancel/:id` | Cancel a booking by ID | Yes |
| GET  | `/report/:id` | Get booking receipt PDF/details | Yes |
| GET  | `/my-bookings` | Get all bookings for current user | Yes |
| GET  | `/owner-bookings` | Get all bookings for an owner | Yes |
| GET  | `/owner-recent-bookings` | Get owner’s recent bookings | Yes |

---

## 3. Box Routes (`/api/boxes`)

### Owner-specific
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST   | `/create` | Create a new cricket box | Yes (Owner) |
| PUT    | `/update/:id` | Update a box by ID | Yes (Owner) |
| DELETE | `/delete/:id` | Delete a box by ID | Yes (Owner) |
| GET    | `/my-box` | Get boxes owned by the user | Yes (Owner) |

### Public
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET  | `/public` | List all cricket boxes | No |
| GET  | `/public/:id` | Get box details by ID | No |
| POST | `/availableBoxes` | Get available boxes by criteria | No |
| POST | `/support` | Submit feedback/support request | Yes |

---

## 4. Group Routes (`/api/group`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create` | Create a new group | Yes |
| POST | `/invite` | Invite user to a group | Yes |
| POST | `/join` | Join a group | Yes |
| GET  | `/myGroups` | Get all groups of logged user | Yes |
| POST | `/getMembers/:groupId` | Get group members by group ID | Yes |
| POST | `/delete/:groupId` | Delete a group by ID | Yes |
| POST | `/leave/:groupId` | Leave a group by ID | Yes |

---

## 5. Review Routes (`/api/reviews`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create/:id` | Add a review for a box by box ID | Yes |
| GET  | `/:id` | Get reviews for a box by ID | Yes |

---

## 6. Notification Routes (`/api/notification`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET  | `/` | Get all notifications | Yes |
| POST | `/deleteNotification/:notificationId` | Delete a notification by ID | Yes |
| PUT  | `/mark-all-read` | Mark all notifications as read | Yes |
| GET  | `/unread-count` | Get count of unread notifications | Yes |

---

## 7. Message Routes (`/api/messages`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/send` | Send a new message in a group | Yes |
| GET  | `/all/:groupId` | Get all messages in a group | Yes |

---

## 8. Slots Routes (`/api/slots`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/block-slots` | Block a time slot (owner) | Yes (Owner) |
| GET  | `/booked-blocked-slots/:id` | Get blocked & booked slots by box ID | Yes |
| DELETE | `/unblock/:slotId` | Unblock a slot by slot ID | Yes (Owner) |

---

### Authentication
- `protectedRoute`: Requires JWT token.
- `isOwner`: Requires owner privileges.


---

      

## 🏗 System Architecture

![Architecture](link-to-your-architecture-diagram.png)

(Frontend on Vercel → Backend on Render → MongoDB Atlas → Socket.IO for real-time)

---

## 📸 Screenshots / Demo
*(Add screenshots or a Loom/YouTube demo video link)*

---

## 🔗 Live Links
- **Frontend**: [https://your-frontend.vercel.app](https://your-frontend.vercel.app)
- **Backend API**: [https://your-backend.onrender.com](https://your-backend.onrender.com)

---

## 🧪 API Documentation
Postman collection link: [Postman Docs](https://link-to-postman-documentation)

---

## How to Run Locally

```bash
git clone https://github.com/Alfaz-17/box-Cricket.git
cd box-Cricket/backend
npm install
npm run dev


## 📂 Folder Structure

box-Cricket/
│
├── backend/ # All backend APIs, routes, models, socket code
├── frontend/ # React app to consume APIs
└── README.md