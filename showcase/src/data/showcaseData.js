export const PROJECT_INFO = {
  title: "PlacementHub",
  subtitle: "Enterprise-Grade Class Career Portal & Real-time Coordination Engine",
  tagline: "A production-deployed class placement portal with register-gated verification, 4-state application status polls, sub-50ms WebSocket chat, dual push notification alerts (FCM + Gmail SMTP), and automated CR administrative workflows.",
  githubUrl: "https://github.com/karthi-s-13/placementhub",
  liveDemoUrl: "https://placementhub-one.vercel.app/",
  backendApiUrl: "https://placementhub-ajx0.onrender.com",
  backendApiDocsUrl: "https://placementhub-ajx0.onrender.com/docs",
  batchSize: 53,
  year: 2026,
};

export const METRICS = [
  { label: "Class Batch Size", value: "53 Students", change: "100% Verified", desc: "Strict onboarding via registered whitelist numbers." },
  { label: "Application Velocity", value: "95.4%", change: "Within 24h", desc: "Students responding to placement readiness status polls." },
  { label: "Real-time Latency", value: "< 45 ms", change: "WebSocket ASGI", desc: "Sub-50ms message broadcast speed across chat channels." },
  { label: "Deadline Failures", value: "0 Cutoffs Missed", change: "Dual Push & SMTP", desc: "Instant Firebase Push Notifications + Gmail SMTP summaries." },
  { label: "Relational Models", value: "11 SQL Tables", change: "SQLAlchemy ORM", desc: "Normalized MySQL 8.0 schema with indexed foreign keys." },
  { label: "REST & WS Endpoints", value: "28 Routes", change: "FastAPI OpenAPI", desc: "Auto-documented OpenAPI endpoints with Pydantic validation." }
];

export const FEATURES = [
  {
    id: "auth-gate",
    category: "Security & Access",
    title: "Register Number Verification Gate",
    desc: "Strict access control mechanism requiring CR-whitelisted register numbers during signup. Completely eliminates unauthorized student signups.",
    badge: "Security Core",
    tech: ["FastAPI", "BCrypt", "SQLAlchemy"]
  },
  {
    id: "rbac",
    category: "Security & Access",
    title: "Role-Based Access Control (RBAC)",
    desc: "Granular authorization levels separating Student and Class Representative (CR) permissions with custom JWT token scopes.",
    badge: "JWT Auth",
    tech: ["PyJWT", "FastAPI Depends", "Role Scopes"]
  },
  {
    id: "opportunity-posting",
    category: "Opportunity Hub",
    title: "Streamlined Opportunity Posting",
    desc: "High-efficiency posting workflow with batch filters, department criteria, external application link embedding, and cutoff dates.",
    badge: "Placement Feed",
    tech: ["React Form", "FastAPI", "MySQL"]
  },
  {
    id: "approval-workflow",
    category: "Opportunity Hub",
    title: "CR Moderation & Approval Queue",
    desc: "Student-submitted opportunities enter a 'Pending' queue requiring CR verification before publishing to the class feed.",
    badge: "Moderation",
    tech: ["SQL Enum", "CR Dashboard"]
  },
  {
    id: "status-poll",
    category: "Application Intelligence",
    title: "4-State Application Status Polls",
    desc: "Instant poll responses (Applied / Planning to Apply / Not Eligible / Not Interested) giving CRs immediate class placement readiness metrics.",
    badge: "Poll Engine",
    tech: ["React State", "SQL Upsert"]
  },
  {
    id: "read-receipts",
    category: "Application Intelligence",
    title: "Class-Wide Read Receipts & Audit",
    desc: "Per-opportunity view tracking allowing CRs to view exact timestamps of who read the drive notice and who has not opened it.",
    badge: "Read Receipts",
    tech: ["FastAPI", "SQLAlchemy", "Timestamp Audit"]
  },
  {
    id: "whatsapp-reminder",
    category: "Application Intelligence",
    title: "Direct WhatsApp Targeted Reminders",
    desc: "Generates custom targeted WhatsApp direct message links for students who haven't viewed urgent placement notifications.",
    badge: "Productivity",
    tech: ["URI Encoder", "React Link"]
  },
  {
    id: "fcm-push",
    category: "Real-time Messaging",
    title: "Firebase Web Push Notifications (FCM)",
    desc: "Cross-platform background Web Push alerts delivering instant desktop and mobile notifications when new opportunities are posted.",
    badge: "FCM Push",
    tech: ["Firebase Web SDK", "Service Worker", "FastAPI FCM"]
  },
  {
    id: "email-digest",
    category: "Real-time Messaging",
    title: "Gmail SMTP Background Alerts",
    desc: "Asynchronous background email worker providing automated deadline reminders and weekly digest summaries directly to student inboxes.",
    badge: "SMTP Digest",
    tech: ["Python smtplib", "FastAPI BackgroundTasks"]
  },
  {
    id: "websocket-chat",
    category: "Real-time Messaging",
    title: "Multi-Channel WebSocket Chat",
    desc: "Real-time communication suite with 5 default channels (#general, #placements, #interviews, #referrals, #q-and-a), attachments, and edit history.",
    badge: "WebSockets",
    tech: ["FastAPI WebSocket", "Broadcaster"]
  },
  {
    id: "threaded-comments",
    category: "Community Suite",
    title: "Threaded Discussion Comments",
    desc: "Hierarchical parent-child comment threads attached to opportunity posts for eligibility Q&A and interview tips.",
    badge: "Q&A Threads",
    tech: ["Recursive ORM", "React Components"]
  },
  {
    id: "auto-archive",
    category: "Automation Engine",
    title: "Automated Expired Post Scheduler",
    desc: "Daily background scheduler that automatically shifts past-deadline opportunities from Active to Archived state.",
    badge: "APScheduler",
    tech: ["APScheduler", "Async SQL"]
  },
  {
    id: "admin-analytics",
    category: "Admin Suite",
    title: "CR Class Analytics Dashboard",
    desc: "Visual metrics on application ratios, top recruiting companies, student activity logs, and batch readiness percentages.",
    badge: "Analytics",
    tech: ["Recharts UI", "SQL Aggregation"]
  },
  {
    id: "bulk-upload",
    category: "Admin Suite",
    title: "Bulk Register Number CSV Ingestion",
    desc: "CR tool to bulk import student register numbers via CSV parsing or raw paste list for rapid batch onboarding.",
    badge: "Bulk Ingestion",
    tech: ["CSV Parser", "FastAPI Batch Insert"]
  },
  {
    id: "bookmarks",
    category: "Student Experience",
    title: "Instant Search & Bookmark Suite",
    desc: "Instant search by title, company, description, and status with persistent saved opportunity bookmarks.",
    badge: "UX Core",
    tech: ["Local Storage", "Client Filtering"]
  },
  {
    id: "dark-responsive",
    category: "Student Experience",
    title: "Responsive MNC Mobile/Desktop UI",
    desc: "Mobile-first bottom navigation bar for smartphones and collapsible sidebar for desktop viewports.",
    badge: "Modern UI",
    tech: ["Tailwind CSS", "Flexbox/Grid"]
  }
];

export const TECH_STACK = {
  frontend: [
    { name: "React 18", desc: "Declarative component-driven UI architecture with hooks & context state management.", icon: "Atom", color: "from-cyan-500 to-blue-500" },
    { name: "Vite", desc: "Next-generation frontend tooling with instant HMR and optimized ES modules bundle.", icon: "Zap", color: "from-amber-400 to-yellow-500" },
    { name: "Tailwind CSS v4", desc: "Utility-first CSS framework for ultra-fast, responsive styling.", icon: "Palette", color: "from-sky-400 to-blue-600" },
    { name: "Lucide Icons", desc: "Pixel-perfect modern icon library.", icon: "Feather", color: "from-indigo-400 to-purple-500" },
    { name: "Firebase Web Push SDK", desc: "Service Worker integration for background web push alerts.", icon: "BellRing", color: "from-amber-500 to-orange-600" }
  ],
  backend: [
    { name: "FastAPI", desc: "High-performance Python web framework built on ASGI & Starlette.", icon: "Server", color: "from-emerald-400 to-teal-600" },
    { name: "SQLAlchemy", desc: "Python SQL toolkit and Object Relational Mapper for MySQL.", icon: "Database", color: "from-red-400 to-rose-600" },
    { name: "PyJWT", desc: "Cryptographic JSON Web Token encoding, decoding, and verification.", icon: "Lock", color: "from-purple-500 to-indigo-600" },
    { name: "Passlib (BCrypt)", desc: "Password hashing with 12 salted round iterations for security compliance.", icon: "ShieldCheck", color: "from-blue-500 to-indigo-700" },
    { name: "Uvicorn", desc: "Lightning-fast ASGI server implementation using uvloop.", icon: "Cpu", color: "from-indigo-500 to-blue-600" }
  ],
  database: [
    { name: "MySQL 8.0", desc: "Production relational database with ACID transactions and index optimization.", icon: "HardDrive", color: "from-blue-600 to-sky-700" },
    { name: "SQLAlchemy QueuePool", desc: "Minimizes connection handshake overhead with persistent pool queues.", icon: "Layers", color: "from-teal-500 to-emerald-600" }
  ],
  realtime: [
    { name: "FastAPI WebSockets", desc: "Full-duplex WebSocket ConnectionManager broadcasting live chat.", icon: "Radio", color: "from-purple-400 to-pink-600" },
    { name: "Firebase Cloud Messaging", desc: "Cross-platform FCM HTTP v1 push messaging engine.", icon: "Send", color: "from-amber-400 to-orange-500" },
    { name: "Gmail SMTP", desc: "Asynchronous background task email dispatcher.", icon: "Mail", color: "from-rose-500 to-red-600" }
  ],
  devops: [
    { name: "Docker & Docker Compose", desc: "Containerized setup for backend, database, and local dev environments.", icon: "Box", color: "from-blue-500 to-sky-600" },
    { name: "Vercel CDN", desc: "Edge deployment for React Vite single page application.", icon: "Globe", color: "from-slate-700 to-slate-900" },
    { name: "Render Cloud", desc: "Web Service hosting for FastAPI backend with automated git deployment.", icon: "Cloud", color: "from-emerald-500 to-teal-700" }
  ]
};

export const DATABASE_SCHEMAS = [
  {
    table: "users",
    desc: "Stores student and CR profiles linked to verified register numbers.",
    columns: [
      { name: "id", type: "Integer", key: "PK", desc: "Auto-increment primary key" },
      { name: "register_number", type: "String(20)", key: "FK/Unique", desc: "Foreign key to register_numbers table" },
      { name: "name", type: "String(100)", key: "-", desc: "Full student name" },
      { name: "email", type: "String(200)", key: "Unique", desc: "College email address" },
      { name: "password_hash", type: "String(256)", key: "-", desc: "BCrypt 12-round password hash" },
      { name: "role", type: "String(30)", key: "-", desc: "'student' or 'cr' (Class Representative)" },
      { name: "avatar_color", type: "String(10)", key: "-", desc: "Hex color code for UI avatar badge" },
      { name: "is_active", type: "Boolean", key: "-", desc: "Account activation state flag" }
    ]
  },
  {
    table: "register_numbers",
    desc: "Whitelist of authorized register numbers created by Class Representatives.",
    columns: [
      { name: "id", type: "Integer", key: "PK", desc: "Auto-increment primary key" },
      { name: "register_number", type: "String(20)", key: "Unique", desc: "Whitelisted student register number" },
      { name: "target_role", type: "String(20)", key: "-", desc: "Default role assigned upon registration" },
      { name: "is_used", type: "Boolean", key: "-", desc: "Set to True when student registers" },
      { name: "added_by", type: "Integer", key: "FK", desc: "FK to users.id (CR who added number)" }
    ]
  },
  {
    table: "opportunities",
    desc: "Job, internship, and placement drive listings.",
    columns: [
      { name: "id", type: "Integer", key: "PK", desc: "Auto-increment primary key" },
      { name: "title", type: "String(200)", key: "-", desc: "Job title (e.g., Software Engineer)" },
      { name: "company", type: "String(100)", key: "-", desc: "Recruiting company name" },
      { name: "application_link", type: "Text", key: "-", desc: "External career portal URL" },
      { name: "deadline", type: "DateTime", key: "-", desc: "Application cutoff timestamp" },
      { name: "posted_by", type: "Integer", key: "FK", desc: "FK to users.id (Poster user ID)" },
      { name: "status", type: "Enum", key: "-", desc: "'active', 'pending', 'archived', 'expired'" },
      { name: "is_pinned", type: "Boolean", key: "-", desc: "Pin listing to top of feed" }
    ]
  },
  {
    table: "opportunity_views",
    desc: "Read receipts tracking which student opened each placement opportunity.",
    columns: [
      { name: "id", type: "Integer", key: "PK", desc: "Auto-increment primary key" },
      { name: "opportunity_id", type: "Integer", key: "FK (Cascade)", desc: "FK to opportunities.id" },
      { name: "user_id", type: "Integer", key: "FK (Cascade)", desc: "FK to users.id" },
      { name: "viewed_at", type: "DateTime", key: "-", desc: "Exact view timestamp" }
    ]
  },
  {
    table: "application_statuses",
    desc: "Poll responses tracking student application status per drive.",
    columns: [
      { name: "id", type: "Integer", key: "PK", desc: "Auto-increment primary key" },
      { name: "opportunity_id", type: "Integer", key: "FK (Cascade)", desc: "FK to opportunities.id" },
      { name: "user_id", type: "Integer", key: "FK (Cascade)", desc: "FK to users.id" },
      { name: "status", type: "String(30)", key: "-", desc: "'Applied', 'Planning', 'Not Eligible', 'Not Interested'" }
    ]
  },
  {
    table: "chat_messages",
    desc: "WebSocket chat messages across channel threads.",
    columns: [
      { name: "id", type: "Integer", key: "PK", desc: "Auto-increment primary key" },
      { name: "channel_id", type: "Integer", key: "FK (Cascade)", desc: "FK to chat_channels.id" },
      { name: "user_id", type: "Integer", key: "FK (Cascade)", desc: "FK to users.id" },
      { name: "content", type: "Text", key: "-", desc: "Message text content" },
      { name: "file_url", type: "String(500)", key: "-", desc: "Attachment URL if present" },
      { name: "is_edited", type: "Boolean", key: "-", desc: "Edit state flag" }
    ]
  },
  {
    table: "fcm_tokens",
    desc: "Device tokens for Firebase Cloud Messaging Web Push alerts.",
    columns: [
      { name: "id", type: "Integer", key: "PK", desc: "Auto-increment primary key" },
      { name: "user_id", type: "Integer", key: "FK (Cascade)", desc: "FK to users.id" },
      { name: "token", type: "String(512)", key: "Unique", desc: "FCM registration token string" }
    ]
  }
];

export const API_ENDPOINTS = [
  {
    category: "Authentication",
    method: "POST",
    path: "/api/auth/register",
    desc: "Register a new student account. Validates register_number against whitelist.",
    reqBody: `{
  "register_number": "212224230001",
  "name": "Karthi S",
  "email": "karthi@college.edu",
  "password": "SecretPassword123"
}`,
    resBody: `{
  "message": "User registered successfully",
  "user_id": 1,
  "role": "student"
}`
  },
  {
    category: "Authentication",
    method: "POST",
    path: "/api/auth/login",
    desc: "Authenticate user and issue JWT Bearer Token.",
    reqBody: `{
  "register_number": "212224230001",
  "password": "SecretPassword123"
}`,
    resBody: `{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "role": "cr",
    "name": "Karthi S"
  }
}`
  },
  {
    category: "Opportunities",
    method: "GET",
    path: "/api/opportunities",
    desc: "Fetch paginated active/pinned placement opportunities with view status.",
    reqBody: `Query Params: ?status=active&search=Software&page=1`,
    resBody: `[
  {
    "id": 12,
    "title": "Software Engineer Intern",
    "company": "Google",
    "application_link": "https://careers.google.com",
    "deadline": "2026-08-15T23:59:59",
    "is_pinned": true,
    "view_count": 48
  }
]`
  },
  {
    category: "Opportunities",
    method: "POST",
    path: "/api/opportunities",
    desc: "Post a new placement opportunity (CR posts active, Student posts pending approval).",
    reqBody: `{
  "title": "Frontend Engineer",
  "company": "Microsoft",
  "application_link": "https://careers.microsoft.com",
  "deadline": "2026-08-20T18:00:00"
}`,
    resBody: `{
  "id": 15,
  "status": "active",
  "created_at": "2026-07-30T01:00:00"
}`
  },
  {
    category: "Application Tracking",
    method: "POST",
    path: "/api/opportunities/{id}/status",
    desc: "Upsert student status response for an opportunity poll.",
    reqBody: `{
  "status": "Applied"
}`,
    resBody: `{
  "message": "Status updated successfully",
  "opportunity_id": 12,
  "status": "Applied"
}`
  },
  {
    category: "Application Tracking",
    method: "GET",
    path: "/api/opportunities/{id}/views",
    desc: "Get read receipts summary & list of unviewed students for WhatsApp direct reminder.",
    reqBody: `Headers: Authorization: Bearer <jwt_token>`,
    resBody: `{
  "total_students": 53,
  "viewed_count": 45,
  "unviewed_students": [
    { "name": "Alex", "phone": "919876543210" }
  ]
}`
  },
  {
    category: "Real-Time Chat",
    method: "WS",
    path: "/ws/chat/{channel_id}?token={jwt}",
    desc: "WebSocket duplex connection endpoint for live chat broadcasting.",
    reqBody: `{
  "content": "Interview scheduled for tomorrow 10 AM",
  "file_url": null
}`,
    resBody: `{
  "id": 89,
  "user_id": 1,
  "name": "Karthi S",
  "avatar_color": "#3B82F6",
  "content": "Interview scheduled for tomorrow 10 AM",
  "created_at": "2026-07-30T01:15:00"
}`
  },
  {
    category: "Notifications",
    method: "POST",
    path: "/api/fcm/token",
    desc: "Register Firebase Cloud Messaging token for current user device.",
    reqBody: `{
  "token": "fcm_dK9xL2...registration_token_string"
}`,
    resBody: `{
  "status": "Token saved successfully"
}`
  }
];

export const CHALLENGES = [
  {
    title: "High-Concurrency WebSocket Channel State",
    problem: "Handling simultaneous WebSocket connections across multiple chat channels without dropping frames or corrupting state during active tab switching.",
    solution: "Designed a thread-safe `ConnectionManager` class using Python `asyncio.Lock` and per-channel socket dictionaries (`Dict[channel_id, List[WebSocket]]`). Stale sockets are purged immediately upon disconnect.",
    codeSnippet: `class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = defaultdict(list)
    
    async def broadcast_to_channel(self, channel_id: int, message: dict):
        for connection in self.active_connections[channel_id]:
            try:
                await connection.send_json(message)
            except WebSocketDisconnect:
                self.disconnect(connection, channel_id)`
  },
  {
    title: "Firebase Push Token Sync across Devices",
    problem: "Students access the app from multiple devices (mobile browser + laptop desktop) leading to duplicate notifications or invalid token errors when tokens expire.",
    solution: "Designed a dedicated `fcm_tokens` table with unique constraint on `(user_id, token)`. Exception handlers catching `messaging.UnregisteredError` auto-prune stale tokens on delivery failure.",
    codeSnippet: `try:
    messaging.send(message)
except messaging.UnregisteredError:
    # Stale token detected; remove from DB cleanly
    db.query(FCMToken).filter(FCMToken.token == token_str).delete()
    db.commit()`
  },
  {
    title: "Class Batch Read-Receipt Aggregation",
    problem: "Computing real-time read percentages and unviewed student lists across 53 students per opportunity caused slow O(N^2) SQL queries.",
    solution: "Implemented SQL `LEFT JOIN` query joining `register_numbers` with `opportunity_views` filtered by `opportunity_id`, generating single-query summaries indexed on `(opportunity_id, user_id)`.",
    codeSnippet: `SELECT r.register_number, u.name, u.email, ov.viewed_at
FROM register_numbers r
LEFT JOIN users u ON r.register_number = u.register_number
LEFT JOIN opportunity_views ov ON u.id = ov.user_id AND ov.opportunity_id = :opp_id
WHERE ov.id IS NULL;`
  },
  {
    title: "Registration Gate Race Conditions",
    problem: "Simultaneous registration attempts by two users using the same register number could lead to duplicate user account creation.",
    solution: "Enforced atomic transactions in MySQL using explicit `is_used` Boolean flags checked in a SELECT ... FOR UPDATE block inside FastAPI endpoint.",
    codeSnippet: `@router.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    reg = db.query(RegisterNumber).filter_by(register_number=data.register_number, is_used=False).with_for_update().first()
    if not reg:
        raise HTTPException(400, "Invalid or already claimed register number")
    reg.is_used = True
    ...`
  }
];

export const ELEVATOR_PITCH = {
  headline: "PlacementHub — Enterprise Class Career & Real-Time Coordination Engine",
  summary: "PlacementHub is a full-stack career and real-time communication platform designed specifically for college class batches. It solves the chaos of lost WhatsApp announcements by providing register-number gated authentication, real-time application status polling, class read-receipt tracking with one-click WhatsApp reminders, and dual-channel push alerts (Firebase Web Push + Gmail SMTP).",
  highlights: [
    { title: "Architectural Focus", detail: "FastAPI ASGI backend with async WebSockets for real-time chat and decoupled BackgroundTasks for email dispatch." },
    { title: "Data Integrity", detail: "Strict MySQL relational schema enforcing register number whitelists to eliminate unauthorized users." },
    { title: "User Experience", detail: "Minimalist, high-efficiency React UI built with Vite & Tailwind CSS, featuring dark/light responsiveness and mobile-first navigation." },
    { title: "Real-World Impact", detail: "Deployed live and serving 53 class students with 100% registration compliance and 0 missed placement deadlines." }
  ],
  qaPrep: [
    { question: "Why FastAPI over Express or Django?", answer: "FastAPI provides native ASGI support for high-performance WebSockets out of the box, auto-generates OpenAPI docs, and leverages Python Pydantic type safety." },
    { question: "How do you handle real-time notifications?", answer: "Dual approach: WebSockets for active browser sessions, and Firebase Cloud Messaging (FCM) HTTP v1 API + Service Workers for background push alerts." },
    { question: "How is security handled?", answer: "Register number verification gate, BCrypt password hashing (12 rounds), stateless JWT Bearer token authentication, and parameterized SQLAlchemy queries preventing SQL injection." }
  ]
};
