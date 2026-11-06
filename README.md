# BYTE WHAT — Technology-Interest Discovery & Student Collaboration Platform

> **GCECT Engineering Community Platform**  
> Government College of Engineering and Ceramic Technology

BYTE WHAT is an adaptive technology-interest discovery, student collaboration, and project-matching platform built specifically for students of GCECT.

It helps engineering students discover what areas of technology genuinely excite them, understand their strengths, explore complementary domains, see community-wide interest trends, and collaborate on real projects.

---

## 🌟 Key Product Principles & Features

1. **Zero Registration / Login Required**: Anyone can visit all public pages and submit questionnaires without creating an account or providing passwords.
2. **Strictly Anonymous Data**: No names, college roll numbers, email addresses, or phone numbers are collected. Sessions rely on anonymous browser-generated UUIDs.
3. **Curated 200-Question Taxonomy**: Exactly 20 universal questions and 180 domain-specific questions (9 per domain) covering 20 engineering domains.
4. **Adaptive Selection Engine**: Students typically answer approximately 12–20 questions (min 10, max 30). The engine selects questions dynamically based on real-time information entropy.
5. **Deterministic Scoring Engine**: Mathematical scoring is transparent and reproducible. AI never decides or overrides domain scores.
6. **Optional Gemini AI Layer**: Google AI Studio Gemini API (`@google/genai`) interprets free-form student notes and generates project ideas with full deterministic fallback when offline or over quota.
7. **ByteMates Peer Matching**: Opt-in pseudonymous discovery to find classmates with similar or complementary skills without contact leakage.
8. **Public Student Project Showcase**: Browse and post project ideas for hackathons, labs, and capstones.
9. **Live Student Interest Map**: Aggregated, privacy-preserving analytics visualizing collegiate interest trends across departments.

---

## 🏗️ Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript (Strict), Tailwind CSS, Framer Motion, Lucide React, Recharts.
- **Backend & Database**: Next.js Route Handlers, Supabase PostgreSQL with Row Level Security (RLS).
- **AI**: Google Gemini API via official `@google/genai` SDK with Zod schema validation.
- **Testing**: Vitest unit test suite.

---

## 🌐 The 20 Technology Domains

| ID | Domain Name | Category |
|---|---|---|
| `software_web` | Software Engineering & Web Development | Core Software & Systems |
| `mobile_development` | Mobile App Development | Core Software & Systems |
| `artificial_intelligence` | Artificial Intelligence | Data & Intelligence |
| `machine_learning` | Machine Learning & Deep Learning | Data & Intelligence |
| `data_science` | Data Science & Analytics | Data & Intelligence |
| `cybersecurity` | Cybersecurity & Ethical Hacking | Core Software & Systems |
| `cloud_devops` | Cloud Computing & DevOps | Core Software & Systems |
| `networks_systems` | Computer Networks & Systems | Core Software & Systems |
| `blockchain_web3` | Blockchain & Web3 | Core Software & Systems |
| `game_development` | Game Development | Design & Creative |
| `ar_vr_xr` | AR, VR & Extended Reality | Design & Creative |
| `robotics_iot` | Robotics, IoT & Embedded Systems | Hardware & Physical Computing |
| `electronics_vlsi` | Electronics, VLSI & Hardware | Hardware & Physical Computing |
| `competitive_programming` | Competitive Programming & Algorithms | Core Software & Systems |
| `ui_ux_design` | UI/UX & Product Design | Design & Creative |
| `graphic_3d_design` | Graphic Design, Animation & 3D | Design & Creative |
| `entrepreneurship` | Entrepreneurship & Product Innovation | Applied & Interdisciplinary |
| `cs_research` | Computer Science Research | Applied & Interdisciplinary |
| `bioinformatics_healthtech` | Bioinformatics & HealthTech | Applied & Interdisciplinary |
| `fintech_quant` | FinTech & Quantitative Computing | Applied & Interdisciplinary |

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js 18+ (tested on Node v20/v25)
- npm 9+

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials:
```env
# Optional: Google AI Studio Gemini API Key (works with graceful fallback if omitted)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Optional: Supabase configuration (in-memory persistent fallback works out of the box)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Unit Tests
```bash
npm test
```

---

## 🗄️ Database Setup (Supabase)

1. Create a project at [Supabase](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Run `supabase/migrations/20261106_init.sql` to generate all 14 tables, indexes, and Row Level Security policies.
4. (Optional) Run `supabase/seed.sql` to load seed domains and initial community showcases.

---

## ☁️ Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set the environment variables (`GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, etc.).
4. Deploy!
