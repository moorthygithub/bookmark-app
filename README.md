
# 🔖 Smart Bookmark Manager

A professional, secure, and real-time bookmark management application built with **Next.js 15**, **Supabase**, and **Tailwind CSS 4**. This project showcases modern web development practices including optimistic UI, real-time synchronization, and robust security patterns.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS + Realtime)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

## ✨ Key Features

- **Google OAuth**: Secure login flow using Supabase Auth.
- **Real-time Sync**: Instant updates across multiple tabs/devices via Supabase Realtime.
- **Optimistic UI**: Zero-latency experience when adding or removing bookmarks.
- **Data Privacy**: Strict Row Level Security (RLS) policies to ensure data isolation.
- **Duplicate Prevention**: Multi-layer validation to prevent duplicate URL entries.
- **Responsive Design**: Premium "Glassmorphism" UI that works on all screen sizes.

---

## 🛠️ Development Journey: Challenges & Solutions

Building this application involved several architectural decisions and technical hurdles. Below are the key challenges faced and how they were resolved.

### 1. Secure Authentication & Session Persistence

**Challenge**: Ensuring a seamless and secure authentication flow that persists across page refreshes and protects sensitive routes like `/dashboard`.
**Solution**:

- Implemented **Supabase SSR** with a custom `middleware.ts` to manage cookies and session state at the edge.
- Created an auth callback route (`/auth/callback`) to securely exchange the OAuth code for a user session.
- Used Middleware to handle server-side redirects, preventing unauthorized access to the dashboard.

### 2. Real-time Data Consistency

**Challenge**: Keeping the UI in sync when a user adds or deletes bookmarks from different tabs without requiring a manual refresh.
**Solution**:

- Integrated **Supabase Realtime** listeners within a Zustand store (`useBookmarkStore.ts`).
- Any mutation in the database triggers a broadcast to all active clients, which then update their local state instantly using specific `INSERT` and `DELETE` event handlers.

### 3. Preventing Duplicate Bookmarks

**Challenge**: Preventing users from adding the same URL multiple times, which leads to data clutter and UI inconsistencies.
**Solution**:

- **Database Level**: Added a composite unique constraint `(user_id, url)` in PostgreSQL to ensure data integrity at the core.
- **Application Level**: Implemented pre-flight checks in the state store to catch duplicates before the network request is even sent, providing immediate feedback via toast notifications.

### 4. Optimistic UI for Zero Latency

**Challenge**: Network requests for database operations can sometimes be slow, making the app feel sluggish during create/delete actions.
**Solution**:

- Developed an **Optimistic Update** strategy in Zustand. When a user adds a bookmark, it's immediately rendered in the UI with a temporary ID.
- If the server request fails, the store performs an automatic **rollback**, removing the temporary item and alerting the user.

### 5. Multi-tenant Data Privacy (RLS)

**Challenge**: Building a multi-user system where data privacy is paramount, ensuring users can strictly only access their own data.
**Solution**:

- Leveraged **Row Level Security (RLS)** in Supabase. Instead of relying purely on application-side filtering, we enforced security at the database layer.
- Policies like `USING (auth.uid() = user_id)` ensure that even if a malicious user tried to query another user's ID via the API, the database would return empty results.

---

## 🏗️ Getting Started

### Prerequisites

- Node.js 18+
- A Supabase Project

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd bookmark
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file with your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Setup Database:
   Run the provided `supabase_schema.sql` in your Supabase SQL Editor to create the necessary tables, indexes, and RLS policies.

5. Run the development server:
   ```bash
   npm run dev
   ```

---

