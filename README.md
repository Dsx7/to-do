# ⚡ FocusOS

**FocusOS** is a next-generation task management application designed for high performers. It moves beyond simple lists by introducing a "Focus Player" concept—treating tasks like active missions with a persistent dock, time tracking, and a futuristic glassmorphism UI.

![FocusOS Dashboard](https://i.ibb.co.com/DPdD2YJV/screencapture-to-do-six-lilac-57-vercel-app-2026-02-13-15-43-08.png)

## 🌟 Key Features

* **🚀 Active Task Dock:** A persistent, floating "Now Playing" bar that keeps your current mission in focus regardless of where you scroll.
* **🎨 Cyberpunk Glass UI:** A fully custom Dark Mode interface featuring glassmorphism, neon accents, and ambient gradients.
* **⏳ Flexible Time Units:** Input time limits in Minutes, Hours, Days, or Weeks. The system auto-converts everything for accurate tracking.
* **🔄 Recursive Subtasks:** Break down complex missions into infinite levels of nested subtasks.
* **📝 Activity Logs:** Chat-style updates for every task to track progress (e.g., "Server down," "Waiting for client").
* **🔐 Google Authentication:** Secure, one-click login via NextAuth.js.
* **🎉 Gamified Completion:** Satisfying confetti explosions upon completing active missions.
* **⚡ Real-time Urgency:** Visual cues for active, overdue, and completed tasks.

## 🛠️ Tech Stack

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
* **Language:** JavaScript (JSX)
* **Database:** [MongoDB](https://www.mongodb.com/) (Mongoose ORM)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives)
* **Authentication:** [NextAuth.js](https://next-auth.js.org/)
* **Utilities:** `date-fns` (Time), `canvas-confetti` (Animations), `lucide-react` (Icons)

## 🚀 Getting Started

Follow these steps to run FocusOS locally on your machine.

### Prerequisites

### Node.js (v18 or higher)
* A MongoDB Atlas Account (Free Tier is fine)
* A Google Cloud Console Project (for OAuth)

## 📂 Project Structure

```text
├── app/
│   ├── api/             # Backend API Routes (Tasks, Auth, Updates)
│   ├── layout.jsx       # Root layout & Global Context Providers
│   └── page.jsx         # Main Dashboard (The "Command Center")
├── components/
│   ├── ui/              # Reusable Shadcn UI primitives
│   ├── ActiveTaskDock.jsx  # Floating persistent bottom bar
│   ├── TaskItem.jsx     # Recursive task card (supports nested sub-tasks)
│   └── TaskUpdates.jsx  # Activity log & event stream component
├── lib/
│   └── db.js            # MongoDB / Mongoose connection helper
└── models/
    └── Task.js          # Mongoose Schema (Task Hierarchy)