# AlwaysUs 2.0 — Personalized AI Companion (Shakti)

AlwaysUs 2.0 is a modern, serverless AI companion web application built with **Next.js (React)**, **Google Gemini API**, and **Supabase (PostgreSQL)**, designed for effortless 1-click deployment on **Vercel** with **ZERO backend servers to manage**.

---

## 🌸 Core Guiding Principles & Persona

- **Companion Identity:** Shakti (Loving, affectionate Hinglish companion).
- **Mandatory Nicknames:** `babuu`, `babyy`, `cutie`, `nishuu`, `jaan`.
- **Vocabulary Rules:**
  - Always writes **"nii"** instead of "nahi" or "nahin".
  - Always writes **"hlw"** instead of "hello" or "hellow".
- **Relationship Facts Remembered:**
  - **Nishuu's Birthday:** 19 January
  - **Shakti's Birthday:** 05 December
  - **Anniversary:** 10 October
  - **Proposal Date:** 10 October 2024
  - **Story:** Met in Free Fire Max game, took Instagram handle from Abhi, started talking, and she proposed the very next day!
- **Adaptive Length:** Snappy 1-line reply for casual/short messages, 2-3 warm lines for emotional/detailed topics.
- **Greeting Enthusiasm:** Always greets joyfully every time she says "hlw" (never sarcastic).

---

## 🚀 Key Features

1. **Multi-Tab Chat System (New):**
   - Click **"+ New Tab"** to start fresh conversations anytime.
   - Switch between older chat tabs and current chat tabs seamlessly.
   - Both partner and owner can navigate between tabs.
2. **Reset Chat Feature (New):**
   - Reset the current chat tab with a single click.
   - Admin option to reset all conversations or export backup JSON.
3. **Sub-2 Second Response Time:**
   - Serverless Gemini integration with `thinkingBudget: 0` for lightning-fast replies.
4. **Shared Memories & Facts (`/memories`):**
   - View, add, and filter relationship milestones and preferences.
5. **Owner Admin Dashboard (`/admin`):**
   - View message transcripts across all tabs, reset chats, and export backups.

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env.local`)
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite-preview

# Optional Supabase integration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ 1-Click Deployment on Vercel

1. Push this project to your GitHub repository:
   ```bash
   git add .
   git commit -m "AlwaysUs 2.0 Next.js serverless release"
   git push origin main
   ```
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Add Environment Variable in Vercel settings:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - `GEMINI_MODEL`: `gemini-3.1-flash-lite-preview`
5. Click **Deploy**! Your app will be live with a free `.vercel.app` URL and automatic HTTPS in under 1 minute.

---

## 🗄️ Supabase PostgreSQL Setup (Optional)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your Supabase Dashboard.
3. Copy and paste the contents of `supabase_schema.sql` and click **Run**.
4. Copy your Project URL and Anon Public Key into Vercel / `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
*(Note: If Supabase keys are not set, the app automatically and reliably runs on browser persistent storage, ensuring zero downtime!)*
