# 🎓 Enterprise Student Marketplace

> **The premier full-stack platform connecting university developers with leading companies through automated legal contracts, milestone escrow tracking, and real-time collaboration.**

---

## 🌟 Key Highlights & Features

### 🏢 For Enterprise Clients
- **🚀 2-Minute Task Publishing**: Post freelance projects, technical assignments, and contracts with custom budget ranges, technology stacks, and milestone deadlines.
- **📄 Automated PDF Contract Generation**: Instant legal contract synthesis using `@react-pdf/renderer` with multi-party digital signature tracking.
- **📊 Real-Time Applicant Management**: Evaluate candidate university profiles, portfolios, cover letters, and verified skill badges.
- **🎯 Milestone Approval Escrow Flow**: Track deliverable progress through interactive approval checkpoints and milestone release states.

### 🎓 For University Students
- **🔍 Smart Opportunity Discovery**: Search real enterprise contracts with instant multi-filtering by technology stack, budget ranges, and project scopes.
- **💼 Verified Profile Showcase**: Display university credentials, past project portfolios, technology matrices, and downloadable resume PDFs.
- **✍️ Digital Contract Signing**: Securely sign legal assignment agreements directly within the platform.
- **⭐ Mutual 5-Star Review System**: Earn direct payouts and build trusted 5-star reputation badges upon milestone completion.

---

## 🛡️ Security & Architecture Standards

- **🔒 Role-Based Access Control (RBAC)**: Strict server middleware route guards enforcing access boundaries between `student`, `enterprise`, and `admin` roles.
- **🛡️ Server Action Data Validation**: 100% type-safe input parsing using `Zod` schemas preventing payload injection attacks.
- **💾 Parameterized Database Queries**: Type-safe relational query engine powered by `Drizzle ORM` eliminating SQL injection vectors.
- **⚡ Real-Time Socket Messaging**: Secure direct messaging channel powered by `Socket.IO` with instant notification badges.
- **🌗 Adaptive Theme Design System**: Built with `next-themes`, `Tailwind CSS`, and `Framer Motion` micro-animations supporting native Dark & Light modes.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack, Server Actions) |
| **Language** | TypeScript (Strict Mode) |
| **Database & ORM** | PostgreSQL & Drizzle ORM |
| **Authentication & Storage** | Supabase Auth (SSR Cookies) & Supabase Storage |
| **Styling & UI** | Tailwind CSS, Shadcn UI, Lucide Icons, Framer Motion |
| **Document Generation** | `@react-pdf/renderer` |
| **Real-Time Layer** | Socket.IO Server & Client |
| **Theme System** | `next-themes` (Dark/Light System Toggle) |

---

## 📁 Repository Structure

```
student-marketplace/
├── actions/                  # Server Actions (Auth, Tasks, Contracts, Messages)
│   ├── auth.ts
│   ├── tasks.ts
│   └── messages.ts
├── app/                      # Next.js App Router Routes
│   ├── (auth)/login/         # Animated Auth Page (Student & Enterprise Login/Signup)
│   ├── api/                  # API Endpoints (PDF Generation, Socket Webhooks)
│   ├── dashboard/            # Role-Based Client & Student Dashboards
│   │   ├── admin/            # Platform Administration Console
│   │   ├── contracts/        # Contract Execution & PDF Viewing
│   │   ├── messages/         # Real-Time Socket Messaging Hub
│   │   ├── profile/          # Verified Profile Showcase Management
│   │   └── tasks/            # Task Search & Application Roster
│   ├── layout.tsx            # Root Layout with ThemeProvider & Tab Favicon
│   └── page.tsx              # Public Landing Page & Interactive Workflow Stepper
├── components/               # UI Components & Modules
│   ├── auth/                 # Login & Signup Form Components
│   ├── dashboard/            # Enterprise & Student Dashboard Views
│   ├── landing/              # Landing Page Hero, Stepper Flow, & Analytics
│   ├── ui/                   # Reusable UI Primitives (Buttons, Cards, Dialogs)
│   └── theme-toggle.tsx      # Dark/Light Mode Theme Switcher
├── lib/                      # Core Utilities & PDF Engines
│   ├── db.ts                 # Drizzle Database Connection
│   └── pdf/                  # Legal Contract Generator Layouts
├── providers/                # Next.js Providers (ThemeProvider)
├── supabase/                 # Database Schemas & Migration Configurations
│   ├── schema.ts             # Drizzle Schema Definitions
│   └── middleware.ts         # Supabase SSR Auth Middleware Guard
├── proxy.ts                  # Route Protection Proxy
└── public/                   # Public Static Assets & Transparent PNG Icons
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js `v18.x` or higher
- npm or pnpm
- Supabase Project (PostgreSQL Database & Auth credentials)

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/student-marketplace.git
cd student-marketplace
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://postgres:password@db.your-supabase-project.supabase.co:5432/postgres
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migrations
```bash
npm run db:push
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🧪 Production Verification & Build

To compile a production build and verify TypeScript type safety:
```bash
npm run build
```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.
