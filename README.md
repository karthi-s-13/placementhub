# PlacementHub — Class Career Portal

A full-stack placement portal for college classes. Students can view opportunities, track applications, chat in real-time, and CRs can manage everything from an admin dashboard.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS → Vercel
- **Backend**: FastAPI (Python) → Render
- **Database**: MySQL
- **Real-time**: WebSocket (FastAPI native)
- **Notifications**: Gmail SMTP

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0 (or use Docker Compose)

---

### Option A: Docker Compose (Recommended)

```bash
# Copy env and fill in your Gmail credentials
cp backend/.env.example backend/.env

# Start everything
docker-compose up --build
```

- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: run separately (see below)

---

### Option B: Manual Setup

#### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database and Gmail credentials

uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173

---

## First-Time Setup

1. Start the backend (it creates tables automatically on startup)
2. The first CR account must be created manually in MySQL:
   - First, add a register number: `INSERT INTO register_numbers (register_number) VALUES ('212224230001');`
   - Register via the frontend with that register number
   - Update role in MySQL: `UPDATE users SET role = 'cr' WHERE register_number = '212224230001';`
3. CR can then add all other register numbers via the Admin → Students panel
4. Students register normally with their register numbers

---

## Environment Variables

### Backend (`.env`)
| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `SECRET_KEY` | JWT secret (use a long random string) |
| `GMAIL_USER` | Gmail address for sending notifications |
| `GMAIL_APP_PASSWORD` | Gmail App Password (not regular password) |
| `FRONTEND_URL` | Frontend URL for CORS and email links |
| `BATCH_SIZE` | Total students in the class (default: 53) |

### Frontend (`.env.local`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (default: http://localhost:8000) |

---

## Deployment

### Backend → Render
1. Connect this repo to Render
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables in Render dashboard
5. Add a MySQL addon or use PlanetScale/Aiven

### Frontend → Vercel
1. Connect this repo to Vercel
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `VITE_API_URL` to Vercel environment variables

---

## Features

- ✅ Register number gated account creation
- ✅ JWT authentication with role-based access (Student / CR)
- ✅ Opportunity posting with 3-field minimal form
- ✅ Student approval workflow (pending → CR approves)
- ✅ Application status poll (Applied / Planning / Not Eligible / Not Interested)
- ✅ Read receipts per opportunity (CR sees who hasn't viewed)
- ✅ WhatsApp quick reminder link for unread students
- ✅ Push notifications (in-app + Gmail email)
- ✅ Real-time chat with WebSocket (5 default channels)
- ✅ Threaded comments per opportunity
- ✅ Save/bookmark opportunities
- ✅ Search by title, company, description
- ✅ Auto-archive expired posts (daily scheduler)
- ✅ Admin analytics dashboard
- ✅ Bulk register number upload (CSV or paste)
- ✅ Role management (promote/demote students to CR)
- ✅ Weekly digest email summary
- ✅ Responsive design (desktop sidebar + mobile bottom nav)
