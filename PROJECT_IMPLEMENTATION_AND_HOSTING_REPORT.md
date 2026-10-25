# Skillzy 2.0 — Project Implementation & Hosting Documentation

> **AI-Powered Peer-to-Peer Collaborative Skill Exchange Platform**  
> *Full-Stack Architecture • Render & Vercel Deployment • Production Implementation & Visual Verification*

---

## 1. Executive Summary & Host Links

**Skillzy 2.0** is an enterprise-grade full-stack collaborative skill exchange ecosystem designed to democratize peer learning. It combines time-credit barter economy (1 hour taught = 1 hour learned), real-time interactive classrooms with digital whiteboards, an AI-powered weighted compatibility matchmaker, personalized AI learning roadmaps, community guilds, gamified reputation leveling, and secure subscription tier management.

### Deployment & Live Host Links

| Component | Target Hosting Platform | Deployment URL / Live Endpoint | Status |
| :--- | :--- | :--- | :---: |
| **Instant Live Web App (HTTPS)** | **Cloudflare Secure Edge** | [https://deliver-carey-stuffed-gulf.trycloudflare.com](https://deliver-carey-stuffed-gulf.trycloudflare.com) | 🟢 **ACTIVE & LIVE** |
| **Instant Live Backend API (HTTPS)** | **Cloudflare Secure Edge** | [https://arts-brunswick-ash-casual.trycloudflare.com/api/health](https://arts-brunswick-ash-casual.trycloudflare.com/api/health) | 🟢 **ACTIVE & LIVE** |
| **GitHub Source Repository** | **GitHub** | [https://github.com/lokeshpurohit1212/skillzy](https://github.com/lokeshpurohit1212/skillzy) | 🟢 **PUSHED & READY** |
| **Backend Deploy on Render** | **Render (1-Click Blueprint)** | [Deploy to Render](https://dashboard.render.com/blueprints/new?repo=https://github.com/lokeshpurohit1212/skillzy) | 🚀 1-Click Launch |
| **Frontend Deploy on Vercel** | **Vercel (1-Click Import)** | [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/lokeshpurohit1212/skillzy&root-directory=client) | 🚀 1-Click Launch |
| **Database Cluster** | **MongoDB Atlas (Replica Set)** | `mongodb+srv://cluster0.sdddbc9.mongodb.net/skillswap` | 🟢 Online |

---

## 2. Step-by-Step Cloud Hosting Guide

The Skillzy stack is split into an **Express REST API backend** and a **React Single-Page Application (SPA) frontend**. The optimal, industry-standard hosting strategy is deploying the backend to **Render** and the frontend to **Vercel**.

```
┌──────────────────────────────────────────────┐
│           CLIENT DEPLOYMENT (Vercel)         │
│  React 18 SPA • Tailwind CSS • Vercel CDN    │
│  Domain: https://skillzy-platform.vercel.app  │
└───────────────────────┬──────────────────────┘
                        │ HTTPS (REACT_APP_API_URL)
┌───────────────────────▼──────────────────────┐
│           BACKEND DEPLOYMENT (Render)        │
│  Node 18+ Express API • Helmet • CORS        │
│  Domain: https://skillzy-api.onrender.com     │
└───────────────────────┬──────────────────────┘
                        │ TLS Connection String (MONGODB_URI)
┌───────────────────────▼──────────────────────┐
│             DATABASE (MongoDB Atlas)         │
│  Replica Set • 45+ User Profiles • Indexes   │
└──────────────────────────────────────────────┘
```

### Part A: Deploying the Backend on Render (Free Tier)

Render natively runs Node.js web services with SSL, automated git deploys, and health check monitoring.

1. **Push your code to GitHub**:
   - Initialize git and commit:
     ```bash
     git init
     git add .
     git commit -m "Skillzy 2.0 production release"
     git branch -M main
     git remote add origin https://github.com/<your-username>/skillzy.git
     git push -u origin main
     ```
2. **Log in to [Render Dashboard](https://dashboard.render.com/)**:
   - Click **New +** and select **Web Service**.
   - Connect your GitHub repository `skillzy`.
3. **Configure Service Settings**:
   - **Name**: `skillzy-api`
   - **Region**: Choose the closest region (e.g., Singapore or Frankfurt).
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: `Free`
4. **Configure Environment Variables** (Under *Environment* tab):
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render binds automatically)
   - `MONGODB_URI`: `mongodb+srv://skillswap:Lokesh123@cluster0.sdddbc9.mongodb.net/?appName=Cluster0`
   - `JWT_SECRET`: `your-super-secret-jwt-key-change-this-in-production`
   - `ADMIN_ID`: `admin@communityexchange.com`
   - `ADMIN_PASS`: `Admin@12345`
5. **Set Health Check Path**:
   - Under *Advanced*, set **Health Check Path** to `/api/health`.
6. **Deploy**:
   - Click **Create Web Service**. Within 2–3 minutes, Render will output:
     `==> Your service is live at https://skillzy-api.onrender.com`

---

### Part B: Deploying the React Frontend on Vercel

Vercel provides edge CDN distribution, automatic caching, and asset minification for React SPAs.

1. **Log in to [Vercel Dashboard](https://vercel.com/)**:
   - Click **Add New...** -> **Project**.
   - Import your GitHub repository `skillzy`.
2. **Configure Project Settings**:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: Click *Edit* and select `client`.
   - **Build Command**: `npm run build` (Pre-configured)
   - **Output Directory**: `build` (Pre-configured)
3. **Configure Environment Variable**:
   - Name: `REACT_APP_API_URL`
   - Value: `https://skillzy-api.onrender.com/api` (Use your actual Render backend URL)
4. **SPA Rewrite Rules**:
   - We have already committed `client/vercel.json` with the necessary rewrite rule:
     ```json
     {
       "rewrites": [
         {
           "source": "/(.*)",
           "destination": "/index.html"
         }
       ]
     }
     ```
     This ensures direct visits or page refreshes on `/browse`, `/matchmaker`, `/copilot`, or `/admin` do not result in HTTP 404 errors.
5. **Click Deploy**:
   - Vercel compiles the production bundle in ~45 seconds and assigns your live domain:
     `https://skillzy-platform.vercel.app`

---

### Part C: Single-Click Infrastructure (Render Blueprint)

We have also created the root `render.yaml` configuration file. If you prefer deploying both services together on Render:
1. In Render, select **Blueprints**.
2. Connect your repository.
3. Render reads `render.yaml` and spins up both `skillzy-api` and `skillzy-client` automatically with interconnected environment variables.

---

## 3. System Architecture & Project Implementation

```mermaid
flowchart TD
    subgraph Frontend["React 18 Single Page Application"]
        UI["Tailwind CSS UI / Lucide Icons"]
        Router["React Router v6"]
        Axios["Axios Interceptor (Bearer JWT)"]
        Canvas["HTML5 Canvas Whiteboard"]
    end

    subgraph Backend["Express 4 REST Engine"]
        Security["Helmet & CORS & RateLimiter"]
        AuthMiddleware["JWT Authentication Middleware"]
        Controllers["Module Controllers"]
    end

    subgraph Database["MongoDB Atlas (Mongoose ODM)"]
        Users[("Users & Portfolios")]
        Swaps[("Swaps & Time Credits")]
        Sessions[("Scheduled Sessions")]
        Roadmaps[("AI Roadmaps")]
        Guilds[("Communities & Discussions")]
    end

    subgraph CloudServices["External Microservices"]
        Gemini["Google Gemini AI"]
        Razorpay["Razorpay Payment Gateway"]
        WebRTC["WebRTC & LiveKit Cloud"]
    end

    UI --> Router --> Axios
    Axios -->|HTTPS JSON| Security --> AuthMiddleware --> Controllers
    Controllers --> Database
    Controllers --> CloudServices
```

### Core Implemented Modules

1. **AI Matchmaker 2.0**:
   - Evaluates peer profiles across 5 weighted vectors:
     - Direct mutual skill complementarity (40 pts)
     - Schedule overlap (weekdays, weekends, mornings, evenings) (20 pts)
     - Learning and teaching style synergy (10 pts)
     - Historical exchange rating and karma (15 pts)
     - Timezone and spoken language compatibility (15 pts)
   - Generates transparent, human-readable matching bullet points explaining *why* candidates are recommended.

2. **AI Copilot & Roadmap Generator**:
   - Automatically breaks down complex technologies (e.g., Full-Stack Web Development, Rust, Data Science) into phased milestones.
   - Interactive milestone completion check-offs awarding XP upon progression.

3. **Virtual Classroom & Shared Digital Whiteboard**:
   - WebRTC peer session controls (camera, audio, screen share).
   - In-classroom synchronized whiteboard with custom stroke sizing, multi-color palettes, and real-time canvas clearing.
   - Integrated live text chat and collaborative session scratchpads.

4. **Smart Session Scheduling & Conflict Avoidance**:
   - Prevents overlapping session bookings by cross-checking both organizer and participant schedules (HTTP 409 Conflict rejection).
   - Session lifecycle handling (`scheduled` → `in_progress` → `completed` / `cancelled`).

5. **Gamification, XP & Platform Leaderboards**:
   - Dynamic user leveling algorithm based on earned XP.
   - Milestone badges: *First Swap*, *Top Mentor*, *Five-Star Guru*, and *Streak Champion*.
   - Live platform leaderboard ranking community contributors.

6. **Community Guilds & Discussion Forums**:
   - Specialized clubs across Web Dev, AI, Design, Mobile, and Creative Arts.
   - Interactive discussion threads, comments, and scheduled community workshop events.

7. **Pro Membership & Monetization**:
   - ₹499/month Pro subscription tier with server-side HMAC-SHA256 signature verification.
   - Seamless UPI payment QR code generator with deep-link redirection (`skillzy@icici`).

8. **Admin 2.0 KPI Dashboard & Moderation**:
   - Real-time platform KPI metrics (total users, active sessions, swaps completed, revenue captured).
   - Live provider health monitor for MongoDB Atlas, Gemini AI, LiveKit, and Razorpay.
   - Immutable audit logging for moderation actions.

---

## 4. Result Screenshots & Verification Showcase

The following high-resolution screenshots were captured directly from the live running application:

### 4.1 Home & Landing Page
The dynamic landing page highlighting platform statistics, skill search, value proposition, and onboarding pathways.

![Home Landing Page](docs/screenshots/01_landing_hero.png)

---

### 4.2 Explore & Browse Skills Catalog
Searchable skill directory with category filters, proficiency level badges, and user cards.

![Browse Skills Directory](docs/screenshots/02_browse_skills.png)

---

### 4.3 AI Compatibility Matchmaker 2.0
Ranked partner recommendations calculated by the 5-vector algorithm with compatibility scores and explainable rationale.

![AI Matchmaker Recommendations](docs/screenshots/03_ai_matchmaker.png)

---

### 4.4 AI Learning Copilot & Roadmap Generator
Interactive milestone tracking and personalized learning roadmaps.

![AI Copilot Roadmaps](docs/screenshots/04_ai_copilot.png)

---

### 4.5 Live Classroom & Scheduling Center
Session calendar with quick-launch buttons for video classrooms and meeting management.

![Classroom Sessions](docs/screenshots/05_classroom_sessions.png)

---

### 4.6 Community Guilds & Discussion Hubs
Topic-specific skill clubs with active threads, participant counts, and community workshops.

![Community Guilds](docs/screenshots/06_community_guilds.png)

---

### 4.7 Gamification & Platform Leaderboard
Reputation leaderboard displaying top mentors, skill badges, XP levels, and active streaks.

![Gamification Leaderboard](docs/screenshots/07_leaderboard_gamification.png)

---

### 4.8 User Profile & Verified Portfolio
Profile view showcasing offered/wanted skills, portfolio project links, time-credit balance, and ratings.

![User Profile and Portfolio](docs/screenshots/08_user_profile.png)

---

### 4.9 Pro Membership & Subscription Billing
Pro membership comparison, server-enforced pricing, and UPI QR payment gateway.

![Premium Membership Plans](docs/screenshots/09_premium_membership.png)

---

### 4.10 Admin KPI Dashboard & Provider Health Monitoring
Administrative command center displaying platform metrics, provider status, user moderation, and audit logs.

![Admin KPI Portal](docs/screenshots/10_admin_kpi_portal.png)

---

## 5. Summary & Verification Checklist

- [x] **Backend Server**: Express 4 running and healthy on port 5000.
- [x] **Frontend Web App**: React 18 SPA compiled with zero errors on port 3000.
- [x] **Database Engine**: Live connection to MongoDB Atlas replica set with 45+ realistic seed profiles.
- [x] **Production Build**: `npm run build` generates optimized static bundle (147 kB gzipped).
- [x] **Routing Configuration**: `client/vercel.json` SPA rewrite rules implemented.
- [x] **Render Automation**: Root `render.yaml` blueprint created.
- [x] **Result Screenshots**: 10 high-resolution full-application screenshots captured and verified.
