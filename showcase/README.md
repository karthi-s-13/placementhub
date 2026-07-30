# PlacementHub Showcase — Architecture & Engineering Portal

An interactive engineering showcase and documentation web application built with **React 18**, **Vite**, and **Tailwind CSS v4**.

---

## 🛠️ Features

- 📊 **Metrics Dashboard**: Visual key indicators (53 Batch Size, <45ms Latency, 11 SQL schemas).
- 🏗️ **Architecture Section**: Dynamic visualization of client, server, WebSocket, and push notification flows.
- 🗄️ **Database Schema Viewer**: Complete entity-relationship column specs for 11 MySQL tables.
- 📡 **Interactive API Specs**: Detailed REST and WebSocket endpoint documentation with response schemas.
- 🎓 **Engineering Deep Dives**: Breakdown of custom WebSocket connection managers, FCM web push, and status poll algorithms.

---

## 🚀 Standalone Deployment Guide

This app is ready for zero-config static deployment on any modern cloud hosting provider.

---

### 1. Vercel (Recommended)

#### Option A: Vercel CLI
```bash
cd showcase
vercel
```

#### Option B: Vercel Dashboard
1. Import your GitHub repository on [Vercel](https://vercel.com).
2. Set **Root Directory**: `showcase`
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Click **Deploy**. *(Includes automatic SPA rewrites via `vercel.json`)*.

---

### 2. Netlify

#### Option A: Netlify CLI
```bash
cd showcase
npm run build
netlify deploy --prod --dir=dist
```

#### Option B: Netlify Dashboard
1. Link repository to [Netlify](https://netlify.com).
2. Set **Base directory**: `showcase`
3. Set **Build command**: `npm run build`
4. Set **Publish directory**: `showcase/dist`
5. Deploy site. *(Includes automatic SPA redirects via `public/_redirects`)*.

---

### 3. Render (Static Site)

1. Create a new **Static Site** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Set **Root Directory**: `showcase`
4. Build Command: `npm run build`
5. Publish Directory: `dist`
6. Click **Create Static Site**.

---

### 4. Docker Deployment

Build and run containerized Nginx web server:

```bash
cd showcase

# Build image
docker build -t placementhub-showcase .

# Run container on port 8080
docker run -d -p 8080:80 placementhub-showcase
```

Visit `http://localhost:8080` in your browser.

---

### 5. Local Development Setup

```bash
cd showcase

# Install dependencies
npm install

# Start development server
npm run dev

# Production build test
npm run build
```

---

## 📄 License

MIT License. Part of the **PlacementHub** project.
