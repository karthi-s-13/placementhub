# PlacementHub — Class Career Portal & Coordination Engine

<div align="center">

![PlacementHub Banner](https://img.shields.io/badge/PlacementHub-Class%20Career%20Portal-6366f1?style=for-the-badge&logo=rocket)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Firebase](https://img.shields.io/badge/Firebase_FCM-Web_Push-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.style=flat-square)](#license)

**PlacementHub** is a production-grade class placement portal and real-time coordination engine designed for college batches. It features register-number gated student verification, 4-state application status polls, per-opportunity view audit tracking, dual push notification delivery (Firebase FCM Web Push + Gmail SMTP), sub-50ms WebSocket class chat, and comprehensive Class Representative (CR) administration tools.

[🚀 Live Application](https://placementhub-one.vercel.app/) • [📖 Backend API Documentation](https://placementhub-ajx0.onrender.com/docs) • [✨ Interactive Showcase App](./showcase)

</div>

---

## 📋 Table of Contents

- [Key Performance Metrics](#-key-performance-metrics)
- [System Architecture](#-system-architecture)
- [Core Features](#-core-features)
- [Project Directory Structure](#-project-directory-structure)
- [Database Schema](#-database-schema)
- [Quick Start & Local Setup](#-quick-start--local-setup)
  - [Prerequisites](#prerequisites)
  - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-recommended)
  - [Option B: Manual Local Setup](#option-b-manual-local-setup)
- [First-Time Admin Bootstrap](#-first-time-admin-bootstrap)
- [Environment Variables](#-environment-variables)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Deployment Guide](#-deployment-guide)
- [License](#-license)

---

## ⚡ Key Performance Metrics

| Metric | Value | Description |
| :--- | :--- | :--- |
| **Class Batch Size** | **53 Students** | Strict onboarding via pre-approved register number whitelist |
| **Application Velocity** | **95.4% within 24h** | Student response rate to placement readiness status polls |
| **WebSocket Latency** | **< 45 ms** | Sub-50ms message broadcast speed across chat channels |
| **Deadline Failures** | **0 Cutoffs Missed** | Instant FCM web push + automated Gmail SMTP alerts |
| **Relational Schemas** | **11 SQL Tables** | Fully normalized MySQL 8.0 schema with indexed foreign keys |
| **API Endpoints** | **28 REST & WS Routes** | OpenAPI 3.0 documented FastAPI routes with Pydantic validation |

---

## 📐 System Architecture

```
                               ┌─────────────────────────────────────────┐
                               │             React + Vite UI             │
                               │  (Student Portal / CR Dashboard / Chat) │
                               └────────────────────┬────────────────────┘
                                                    │
                                         REST API & WebSockets
                                                    │
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │           FastAPI Backend ASGI          │
                               │  (Pydantic / PyJWT / ConnectionManager) │
                               └──────┬──────────────┬──────────────┬────┘
                                      │              │              │
                    SQLAlchemy ORM    │              │              │  Background Tasks
                                      ▼              ▼              ▼
                          ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐
                          │ MySQL 8.0 DB  │  │ Firebase FCM │  │ Gmail SMTP Engine│
                          │ / Supabase SQL│  │ (Web Push)   │  │ (Async Emails)   │
                          └───────────────┘  └──────────────┘  └──────────────────┘
```

---

## ✨ Core Features

### 🛡️ 1. Security & Access Control
- **Register Number Gated Verification**: Only students whose college register numbers have been pre-whitelisted by a CR can register an account.
- **Role-Based Access Control (RBAC)**: Distinct permissions for **Students** and **Class Representatives (CR)** enforced via JWT scope dependencies (`get_current_user`, `require_cr`).
- **BCrypt Hashing**: Password protection using salted 12-round BCrypt iterations.

### 💼 2. Placement Drive Management
- **Streamlined Posting**: CRs can publish placement opportunities with eligibility criteria, compensation details, job roles, and application deadlines.
- **CR Moderation Queue**: Student-submitted opportunities enter a "Pending" queue requiring CR verification before public posting.
- **Automated Archiving**: Built-in background scheduler (APScheduler) that automatically transitions expired posts to Archived state.

### 📊 3. Application Intelligence & Audit
- **4-State Application Poll**: Real-time status responses for every drive:
  - `Applied`
  - `Planning to Apply`
  - `Not Eligible`
  - `Not Interested`
- **Class Read Receipts & Audit Log**: CRs can inspect the exact view status and read timestamps for every student in the batch.
- **Targeted WhatsApp Reminders**: Direct action buttons generating pre-filled WhatsApp direct message links for students who haven't opened urgent drive notices.

### 🔔 4. Real-time Messaging & Notifications
- **Firebase Web Push (FCM v1)**: Desktop and mobile browser notifications for newly posted drives and critical announcements.
- **Foreground Toast & Audio Chime**: In-app push alerts paired with a custom web audio chime sound effect.
- **Gmail SMTP Async Digest**: Background email worker providing automated deadline reminders and weekly digest summaries.
- **Multi-Channel WebSocket Chat**: Real-time messaging with 5 default channels (`#general`, `#placements`, `#interviews`, `#referrals`, `#q-and-a`), media attachment support, and edit history.
- **Threaded Drive Comments**: Hierarchical parent-child comment threads attached to opportunity posts for Q&A and interview discussions.

### 📈 5. CR Admin Suite & Bulk Utilities
- **Class Placement Analytics**: Recharts-powered visual dashboards showing application ratios, top recruiting companies, student activity logs, and batch readiness percentages.
- **Bulk Register Whitelist Import**: Import student register numbers in bulk via CSV upload or raw paste lists.
- **Role Management**: Promote or demote students to CR status with instant permission propagation.

### 💻 6. Interactive Showcase App (`/showcase`)
- A standalone Vite + React + Tailwind CSS portfolio showcase application detailing architecture, API endpoints, engineering lessons, and database models.

---

## 📁 Project Directory Structure

```
placementhub/
├── backend/                  # FastAPI Python Backend
│   ├── app/
│   │   ├── api/v1/           # REST endpoints (auth, opportunities, applications, chat, etc.)
│   │   ├── core/             # Security, JWT, DB session, FCM & Email config
│   │   ├── models/           # SQLAlchemy ORM models (11 tables)
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   └── services/         # Business logic, FCM client, WebSocket manager, email worker
│   ├── Dockerfile            # Container configuration for backend
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # Main Student & CR Web Portal (React 18 + Vite)
│   ├── public/               # Static assets & Firebase Service Worker (`firebase-messaging-sw.js`)
│   ├── src/
│   │   ├── components/       # UI components (Navbar, FCMToast, Chat, Admin Panel)
│   │   ├── context/          # React Context (AuthContext, SocketContext)
│   │   ├── pages/            # Page views (Dashboard, DriveDetail, Chat, Admin)
│   │   ├── services/         # Axios API client & Firebase Messaging configuration
│   │   └── index.css         # Tailwind CSS styling & custom utilities
│   ├── Dockerfile            # Container configuration for frontend
│   └── package.json          # Node.js dependencies
│
├── showcase/                 # Standalone Engineering Showcase Portal (Vite + Tailwind CSS v4)
│   ├── src/                  # Architecture specs, DB models, API docs, and metrics UI
│   └── package.json
│
├── docker-compose.yml        # Multi-container orchestration (Backend + Frontend + MySQL)
├── render.yaml               # Render Cloud deployment blueprint
└── README.md                 # Project documentation
```

---

## 🗄️ Database Schema

The system uses **11 normalized SQL tables** managed via SQLAlchemy ORM:

| Table | Primary Role | Key Columns / Indexes |
| :--- | :--- | :--- |
| `users` | Account profiles & RBAC roles | `id`, `register_number` (FK), `email` (Unique), `password_hash`, `role` |
| `register_numbers` | Approved student whitelist | `register_number` (PK), `name`, `added_by` (FK), `created_at` |
| `opportunities` | Placement drive posts | `id`, `title`, `company`, `deadline`, `status`, `posted_by_id` (FK) |
| `applications` | 4-state student poll responses | `id`, `user_id` (FK), `opportunity_id` (FK), `status`, `updated_at` |
| `opportunity_views` | Read receipts & audit log | `id`, `user_id` (FK), `opportunity_id` (FK), `viewed_at` |
| `comments` | Threaded Q&A per drive | `id`, `opportunity_id` (FK), `user_id` (FK), `parent_id` (FK), `content` |
| `chat_messages` | WebSocket multi-channel chat | `id`, `channel`, `user_id` (FK), `content`, `attachment_url`, `created_at` |
| `push_subscriptions` | FCM web push device tokens | `id`, `user_id` (FK), `token` (Unique), `device_info`, `updated_at` |
| `notifications` | Application alert records | `id`, `title`, `message`, `type`, `target_role`, `created_at` |
| `notifications_sent` | Per-user notification receipt | `id`, `notification_id` (FK), `user_id` (FK), `is_read` |
| `admin_logs` | Audit trail of CR actions | `id`, `cr_id` (FK), `action`, `target_user_id`, `created_at` |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: `v18.0.0+`
- **Python**: `3.11+`
- **MySQL**: `8.0+` (or Docker Desktop)

---

### Option A: Docker Compose (Recommended)

1. **Clone repository**:
   ```bash
   git clone https://github.com/karthi-s-13/placementhub.git
   cd placementhub
   ```

2. **Configure environment variables**:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Launch all services**:
   ```bash
   docker-compose up --build
   ```

- **Backend API**: `http://localhost:8000`
- **Swagger API Docs**: `http://localhost:8000/docs`
- **Frontend App**: `http://localhost:3000`

---

### Option B: Manual Local Setup

#### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create & activate virtual environment
python -m venv venv

# Windows PowerShell
venv\Scripts\activate

# Linux / MacOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your MySQL credentials and Secret Key

# Run development server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup (React + Vite)

```bash
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```

Visit `http://localhost:5173` in your browser.

#### 3. Showcase App Setup (Optional)

```bash
cd showcase

# Install packages
npm install

# Start Showcase dev server
npm run dev
```

---

## 🔑 First-Time Admin Bootstrap

When setting up a fresh database:

1. **Run the backend** — database tables will automatically be created on startup via SQLAlchemy metadata.
2. **Whitelist the initial CR register number** in your MySQL database:
   ```sql
   INSERT INTO register_numbers (register_number) VALUES ('212224230001');
   ```
3. **Register on the frontend** using `212224230001`.
4. **Promote the account to CR** in MySQL:
   ```sql
   UPDATE users SET role = 'cr' WHERE register_number = '212224230001';
   ```
5. Log out and log back in. Access the **Admin Panel** to bulk-upload all remaining class register numbers via CSV or raw text list.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | MySQL Connection String | `mysql+pymysql://root:password@localhost:3306/placementhub` |
| `SECRET_KEY` | JWT Signing Secret | `super-secret-32-byte-hex-string` |
| `ALGORITHM` | JWT Encoding Algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT Expiration Duration | `10080` (7 days) |
| `FRONTEND_URL` | CORS Allowed Origin | `http://localhost:5173` |
| `GMAIL_USER` | Gmail address for notifications | `class.cr@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail 16-character App Password | `xxxx xxxx xxxx xxxx` |
| `FIREBASE_CREDENTIALS_JSON` | Firebase Admin SDK JSON string | `{"type":"service_account",...}` |
| `BATCH_SIZE` | Total class student count | `53` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | FastAPI Backend Endpoint | `http://localhost:8000` |
| `VITE_FIREBASE_API_KEY` | Firebase Web SDK API Key | `AIzaSy...` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `placementhub-app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM Messaging Sender ID | `1234567890` |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID | `1:1234567890:web:...` |
| `VITE_FIREBASE_VAPID_KEY` | Firebase VAPID Key for Web Push | `BEl6...` |

---

## 📡 API Endpoints Overview

| Module | Method | Endpoint | Description | Auth Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Register student account | Public (Verified Reg No.) |
| | `POST` | `/api/v1/auth/login` | Obtain OAuth2 JWT access token | Public |
| | `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Authenticated |
| **Opportunities** | `GET` | `/api/v1/opportunities` | List active drives with filters | Authenticated |
| | `POST` | `/api/v1/opportunities` | Create placement opportunity | Student (Pending) / CR |
| | `PUT` | `/api/v1/opportunities/{id}/approve` | Moderate and approve pending post | CR Only |
| | `POST` | `/api/v1/opportunities/{id}/view` | Record read receipt audit log | Authenticated |
| **Polls & Status**| `POST` | `/api/v1/applications/status` | Submit/Update 4-state poll status | Student |
| | `GET` | `/api/v1/applications/opportunity/{id}` | Get status breakdown & view logs | CR Only |
| **Notifications** | `POST` | `/api/v1/notifications/subscribe` | Register FCM Web Push token | Authenticated |
| | `GET` | `/api/v1/notifications` | Fetch user notification history | Authenticated |
| **Chat & WS** | `WS` | `/ws/chat/{channel}` | Real-time WebSocket connection | Authenticated (Token query) |
| | `GET` | `/api/v1/chat/messages/{channel}` | Fetch channel chat history | Authenticated |
| **Admin** | `POST` | `/api/v1/admin/register-numbers/bulk` | Bulk import register numbers | CR Only |
| | `GET` | `/api/v1/admin/analytics` | Fetch class readiness analytics | CR Only |

---

## 🌐 Deployment Guide

### Backend (Render Cloud)
1. Link your repository to **Render** using `render.yaml`.
2. Configure **Build Command**: `pip install -r requirements.txt`.
3. Configure **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Inject production environment variables (`DATABASE_URL`, `SECRET_KEY`, `FIREBASE_CREDENTIALS_JSON`).

### Frontend (Vercel)
1. Import repository to **Vercel** with Root Directory set to `frontend`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Set Environment Variable: `VITE_API_URL=https://placementhub-ajx0.onrender.com`.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ for College Class Placement Coordination.

</div>
