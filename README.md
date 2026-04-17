# BGYCC Admin Dashboard

![BGYCC Admin](public/bgycc_logo.svg)

The **BGYCC Admin Dashboard** is the management and analytics interface for the BGYCC School of Leadership. It empowers administrators to oversee member progress, manage educational pathways, and coordinate club activities within the BGYCC ecosystem.

---

## 🚀 Key Features

- **Engagement Analytics**: Real-time tracking of active users, daily progress reports (text & audio), and historical trends.
- **Member Monitoring**: Automated identification of "At-Risk" members based on activity patterns and streak tracking.
- **Onboarding Editor**: Full control over the onboarding experience, including the management of customized welcome videos for different pathways (Leadership, Public Speaking).
- **Club Management**: Centralized hub for organizing and overseeing regional BGYCC clubs.
- **Pathway Checklists**: Tools for designing and managing structured growth pathways and educational checklists for members.
- **Resource Center**: Digital asset management for educational materials and leadership resources.

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: Radix UI + Custom Glassmorphism System
- **Forms**: React Hook Form + Zod
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Project Structure

```bash
├── app/                  # Next.js App Router (Dashboard & Auth routes)
├── components/           # Reusable UI components (shared, charts, UI primitives)
├── hooks/                # Custom React hooks (Auth, API queries, utility hooks)
├── lib/                  # Service layers, API clients, and type definitions
├── public/               # Static assets, SVG logos, and icons
├── types/                # Project-wide TypeScript interfaces
└── tasks/                # Development logs and TODOs
```

## 🏁 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm` (integrated with `package-lock.json`)

### 2. Installation
```bash
git clone <repository-url>
cd bgycc-admin
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL="your-api-endpoint-url"
```

### 4. Development
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 📄 License
Internal use only for BGYCC School of Leadership.
