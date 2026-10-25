# Skillzy 2.0 — AI-Powered Skill Exchange Ecosystem

[![Test Suite](https://img.shields.io/badge/tests-106%20passed-brightgreen.svg)](#automated-testing)
[![Client Build](https://img.shields.io/badge/build-zero%20warnings-blue.svg)](#frontend)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](#license)

**Skillzy 2.0** is an ambitious, full-stack collaborative skill exchange platform that merges peer-to-peer barter with artificial intelligence, live interactive video classrooms, smart calendar scheduling, gamified reputation, verified portfolios, community guilds, and secure premium memberships.

Members can barter their expertise (1 hour taught = 1 hour learned), generate personalized AI learning roadmaps, connect in real-time virtual classrooms, join skill guilds, participate in workshops, showcase verified project portfolios, and climb the platform reputation leaderboard.

---

## Table of Contents

- [Core Product Pillars](#core-product-pillars)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database Models & Indexes](#database-models--indexes)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running Frontend & Backend](#running-frontend--backend)
- [Automated Testing & QA](#automated-testing--qa)
- [External Services & Fallback Modes](#external-services--fallback-modes)
- [Troubleshooting & Windows Guide](#troubleshooting--windows-guide)
- [License](#license)

---

## Core Product Pillars

### 1. 🤖 AI-Powered Skill Matchmaker 2.0
- **Weighted Compatibility Algorithm (0–100 score)**:
  - Direct mutual skill complementarity (40 pts)
  - Schedule availability overlap across weekdays/weekends/mornings/evenings (20 pts)
  - Learning and teaching style harmony (10 pts)
  - Reputation, star ratings, and completed exchange history (15 pts)
  - Timezone and spoken language harmony (15 pts)
- **Explainable Matching**: Every recommended partner displays transparent bullet points explaining *why* they were matched.
- **Dynamic Filtering**: Filter by minimum compatibility threshold (0% to 70%+), skill keyword, and sort by score, rating, or activity.

### 2. 🎥 Live Video Classrooms & Virtual Spaces
- **Browser-Native & Cloud Media Engines**:
  - Out-of-the-box native WebRTC mesh for peer sessions.
  - LiveKit Cloud token generation (`LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`) with cryptographic JWT grants.
- **In-Classroom Collaboration**:
  - Real-time video/audio toggle with device controls.
  - Screen sharing and responsive multi-participant grid.
  - Interactive shared digital whiteboard with color palette, stroke sizing, and instant clear.
  - In-room collaborative notes pad and live sidecar chat.

### 3. 📅 Smart Session Scheduling & Overlap Prevention
- **Conflict Avoidance Engine**: Rejects bookings if either the organizer or participant has an overlapping confirmed session in that time window (returns HTTP 409 Conflict).
- **Session Lifecycle**: Supports `scheduled` → `in_progress` → `completed` or `cancelled`.
- **Calendar & Quick Launch**: Direct "Launch Classroom" button unlocks seamless video entry with authorized JWT tokens.

### 4. 🧭 AI Learning Copilot
- **Personalized Multi-Week Roadmaps**:
  - Integrated with **Google Gemini (`@google/genai`)** with an automatic **Deterministic Fallback Engine** if external API keys are omitted.
  - Generates milestones, weekly objectives, target completion dates, suggested resources, and practical check-ins.
- **Interactive Milestone Tracking**:
  - One-click progress toggle with automated progress percentage recalculation.
  - Awards 35 XP and milestone badges upon milestone completion.
- **AI Session Preparation**:
  - Generates custom conversation starters, practice challenges, and interview prep questions for scheduled skill swaps.

### 5. 🏆 Gamification & Community Leaderboard
- **Reputation & XP Engine**:
  - Quadratic leveling algorithm (`Level = floor(sqrt(XP / 100)) + 1`).
  - XP awards on swap completions, reviews, portfolio additions, roadmap milestones, and community posts.
- **Daily Learning Streaks**: Tracks consecutive active learning days with last-active timestamps.
- **Badge Catalog**: Unlocks achievements including `first_swap`, `streak_starter`, `streak_master`, `century_club`, `milestone_master`, `pro_member`.
- **Platform Leaderboard**: Global leaderboard highlighting top teachers and learners with real-time tier ranks.

### 6. 💼 Verified Skill Portfolios
- **Showcase Profiles**: Public profiles feature interactive project cards showing GitHub repos, live demos, and tagged skills.
- **Skill Verification Linkage**: Projects link directly to verified platform skills taught and learned.

### 7. 👥 Skill Communities & Discussions
- **Topic-Based Guilds**: Join or found clubs dedicated to software engineering, UI/UX, languages, music, and business.
- **Discussion Threads**: Post technical questions, share resources, and reply to community discussions.
- **Workshops & Group Events**: Capacity-managed community group sessions and workshops.

### 8. 💳 Payments & Pro Memberships
- **Test-Mode & Live Razorpay**:
  - Server-side fixed pricing enforcement (₹499/month for Pro).
  - HMAC-SHA256 signature verification ensuring zero client tampering.
  - Idempotent payment capture and audit ledger recording.
- **Pro Entitlements**: Verified Pro badge on profiles, unlimited AI Copilot generation, priority matchmaker ranking, and extended classroom durations.
- **Free Barter Remains Intact**: The foundational 1-to-1 time-credit barter economy remains 100% free; subscriptions are strictly optional enhancements.

### 9. 🛡️ Trust, Moderation & Admin 2.0
- **Admin KPI Dashboard**: Aggregated platform metrics (total users, active sessions, completed swaps, total communities, captured revenue).
- **Provider Health Checks**: Real-time health status for MongoDB, Gemini AI, LiveKit Video, and Razorpay.
- **Audit Logging**: All privileged actions (user restrictions, bans, status overrides) write immutable records to `AuditLog`.

### 10. 📊 Telemetry & Privacy-Conscious Analytics
- **Usage Insights**: Tracks completed learning hours, teaching ratios, and roadmap progression.
- **180-Day TTL Cleanup**: Platform telemetry stored in `AnalyticsEvent` auto-expires after 180 days via MongoDB TTL indexes.

---

## Technology Stack

```
┌────────────────────────────────────────────────────────┐
│                     FRONTEND                           │
│   React 18  •  Tailwind CSS  •  React Router v6        │
│   Axios Interceptors  •  Lucide React  •  Canvas API   │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON / JWT
┌──────────────────────────▼─────────────────────────────┐
│                     BACKEND                            │
│   Node.js 18+  •  Express.js  •  Mongoose ODM          │
│   Helmet  •  CORS  •  Rate Limiting  •  Crypto HMAC    │
└──────────────────────────┬─────────────────────────────┘
                           │ Native / Cloud Drivers
┌──────────────────────────▼─────────────────────────────┐
│           DATABASE & THIRD-PARTY PROVIDERS             │
│   MongoDB Atlas  •  Google Gemini  •  LiveKit Cloud    │
│   Razorpay Gateway  •  WebRTC Native Mesh              │
└────────────────────────────────────────────────────────┘
```

---

## API Reference

### Skillzy 2.0 Endpoints

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `GET` | `/api/matchmaker/recommendations` | Ranked partner recommendations with scores | Yes |
| `POST` | `/api/sessions/book` | Book scheduled session with overlap prevention | Yes |
| `GET` | `/api/sessions` | List user's scheduled and past sessions | Yes |
| `POST` | `/api/sessions/:id/token` | Issue signed classroom video room token | Yes |
| `PUT` | `/api/sessions/:id/cancel` | Cancel scheduled session | Yes |
| `POST` | `/api/copilot/roadmap` | Generate personalized AI learning roadmap | Yes |
| `GET` | `/api/copilot/roadmaps` | List user's active roadmaps | Yes |
| `PUT` | `/api/copilot/roadmaps/:id/milestone/:milestoneId` | Toggle milestone completion & award XP | Yes |
| `POST` | `/api/copilot/session-prep` | Generate AI session talking points & practice | Yes |
| `GET` | `/api/gamification/me` | Fetch user XP, level, badges, and streaks | Yes |
| `GET` | `/api/gamification/leaderboard` | Platform-wide reputation leaderboard | Public |
| `POST` | `/api/users/portfolio` | Add verified portfolio project | Yes |
| `DELETE` | `/api/users/portfolio/:id` | Remove portfolio item | Yes |
| `GET` | `/api/communities` | Browse skill communities | Public |
| `POST` | `/api/communities` | Create new skill community | Yes |
| `POST` | `/api/communities/:id/join` | Join community club | Yes |
| `POST` | `/api/communities/:id/discussions` | Post community discussion thread | Yes |
| `GET` | `/api/payments/config` | Pricing plans and Razorpay configuration | Public |
| `POST` | `/api/payments/create-order` | Create payment order with server amount validation | Yes |
| `POST` | `/api/payments/verify` | Verify HMAC signature & fulfill entitlement | Yes |
| `GET` | `/api/admin/overview` | Platform KPI overview and provider health | Admin |
| `GET` | `/api/admin/users` | Moderation user directory | Admin |
| `PUT` | `/api/admin/users/:id/ban` | Toggle user restriction with audit log | Admin |
| `POST` | `/api/analytics/event` | Ingest platform telemetry event | Yes |
| `GET` | `/api/analytics/user` | User personalized learning journey telemetry | Yes |

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas** or local MongoDB instance

### Installation

Clone the repository and install dependencies in both folders:

```bash
# 1. Install server dependencies
cd server
npm install

# 2. Install client dependencies
cd ../client
npm install
```

### Environment Configuration

Create a `.env` file in the `server/` directory (you can copy `server/.env.example`):

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/skillswap?retryWrites=true&w=majority
JWT_SECRET=super_secure_random_jwt_secret_key_at_least_32_characters
PORT=5000
NODE_ENV=development

# Optional Admin Credentials
ADMIN_ID=admin@skillzy.com
ADMIN_PASS=AdminPassword123!

# Optional Extensions (Platform operates automatically with fallbacks if left blank)
GEMINI_API_KEY=
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### Running Frontend & Backend

**Option A — Running Separately:**
```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2: React Frontend (runs on http://localhost:3000)
cd client
npm start
```

**Option B — Production Client Build:**
```bash
cd client
npm run build
```
*(Yields an optimized, 100% warning-free production build ready for deployment).*

---

## Automated Testing & QA

Skillzy includes an automated, full-stack integration test suite that tests all 21 core subsystems end-to-end against a live MongoDB Atlas connection:

```bash
cd server
npm test
```

### Test Suite Coverage (106 Automated Tests)
1. **API Health & DB Connectivity**: Verifies 200 health state and resolved Atlas connection.
2. **User Registration & Validation**: Rejects malformed input, creates users, enforces unique email.
3. **Session Authentication**: JWT token generation, invalid credential rejection, route guards.
4. **Skills Management**: Adding offered/wanted skills, proficiency levels, profile updates.
5. **Discovery & Search**: Full-text skill search, location filtering, complementary barter matching.
6. **Swap Lifecycle**: Request creation, duration rules, conflict rejection, acceptance.
7. **Exchange Messaging**: Authorized conversation channels, message persistence, 403 guards.
8. **Time Credit Settlement**: Atomic `$inc` credit transfer (spent/earned), balance assertions.
9. **Reviews & Ratings**: Post-swap rating submissions, average score calculations, duplicate prevention.
10. **Swap Cancellation**: Requester and recipient cancellation lifecycles.
11. **Admin Access Control**: Admin credential verification, protected endpoint access.
12. **AI Matchmaker Engine 2.0**: Compatibility score calculations (0-100), explainable match reasons.
13. **Smart Scheduling & Overlap Conflict**: Session booking, HTTP 409 overlap conflict prevention.
14. **Virtual Classroom Access Tokens**: Signed room JWT generation, room identity, media provider.
15. **AI Learning Copilot**: Multi-week roadmap generation, milestone progression, XP awards.
16. **Gamification & Leaderboard**: Quadratic XP leveling, daily streaks, platform ranking.
17. **Verified Skill Portfolio**: Project showcase additions, repository links, skill tags.
18. **Payments & Memberships**: Server-side order creation, HMAC signature verification, Pro upgrade.
19. **Skill Communities & Discussions**: Guild creation, member joining, discussion threads.
20. **Telemetry & Admin 2.0**: Privacy analytics ingestion, KPI metric calculation, provider health.
21. **Record Cleanup**: Automated tear-down of test accounts and records.

---

## External Services & Fallback Modes

| Feature | Primary Provider | Graceful Fallback Mode |
|:---|:---|:---|
| **AI Copilot** | Google Gemini 2.0 / 1.5 Flash | Deterministic rule-based curriculum engine with structured weekly milestones. |
| **Virtual Classrooms** | LiveKit Cloud WebRTC SFU | In-browser native WebRTC mesh with canvas whiteboard and in-room notes. |
| **Payments** | Razorpay Live Gateway | Built-in test sandbox mode (`isTestMode: true`) with HMAC signature verification. |
| **Database** | MongoDB Atlas Replica Set | Resilient DNS resolver with direct seedlist fallback for Windows Node environments. |

---

## Troubleshooting & Windows Guide

### Windows Node.js c-ares DNS Resolution Note
On some Windows environments, Node.js c-ares DNS queries for `mongodb+srv://` URIs may encounter transient query timeouts (`querySrv ECONNREFUSED`). Skillzy's `server/config/db.js` includes an automatic DNS fallback that queries standard A/AAAA seedlists and connects seamlessly to your MongoDB Atlas replica set.

### Client Port 3000
If port 3000 is occupied, React will prompt to run on port 3001, or you can terminate existing node instances:
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.