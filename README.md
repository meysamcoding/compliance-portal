# 🧾 Compliance Portal MVP

A full-stack web application for managing regulatory filings, document uploads, and role-based access.

## 🚀 Features

* 🔐 Authentication (Sign up / Login / Logout)
* 👤 User roles (Admin / User)
* 📂 Filing management (Create, Edit, Delete)
* 📎 Multi-document upload per filing (Supabase Storage)
* 🗂 View & Delete uploaded documents
* 👥 Assign filings to users
* 📊 Dashboard with role-based access

## 🛠 Tech Stack

* Frontend: Next.js (App Router) + TypeScript
* Backend: Supabase (Auth, Database, Storage)
* Styling: Tailwind CSS

## 📸 Screenshots

*Add screenshots here later*

## 📦 Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/compliance-portal.git
cd compliance-portal
npm install
npm run dev
```

## 🔑 Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## 🧠 What I Learned

* Designing role-based access systems
* Working with Supabase Storage + RLS policies
* Managing file uploads and database sync
* Building scalable UI with reusable components

## 📌 Future Improvements

* Document preview (PDF/image)
* Filing status workflow (pending → approved)
* Admin dashboard analytics
* Stripe subscription (free/pro plans)

---

👨‍💻 Built by Meysam
