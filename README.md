# Unified Asia Invoice System

A production-ready web application for Managing Quotations, Tax Invoices, Delivery Orders, and Customer Statements for UNIFIED ASIA SOLUTIONS PTE LTD.

## Production Links
- **Frontend App**: [https://unified-asia-invoice-frontend.pages.dev](https://unified-asia-invoice-frontend.pages.dev)
- **Backend API**: [https://unified-asia-invoice-system.vernon-process.workers.dev](https://unified-asia-invoice-system.vernon-process.workers.dev)

## Architecture Overview

*   **Frontend**: React, Vite, TailwindCSS (Cloudflare Pages)
*   **Backend**: Cloudflare Workers (Hono REST API)
*   **Database**: Cloudflare D1 (Serverless SQL DB)
*   **File Storage**: Cloudflare R2 (PDFs, Signatures, Logos)

## Prerequisites

1.  Node.js (v18+)
2.  NPM or Yarn
3.  Cloudflare account (for `wrangler` CLI)

## Local Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Login to Cloudflare using Wrangler (if you haven't already):
```bash
npx wrangler login
```

Set up your local D1 database schema:
```bash
npx wrangler d1 execute unified-asia-db --local --file=../migrations/0001_initial_schema.sql
npx wrangler d1 execute unified-asia-db --local --file=../migrations/0002_sequences.sql
```

Run the backend locally:
```bash
npm run dev
```
The backend API should now be running on `http://localhost:8787`.

### 2. Frontend Setup

Open a new terminal window:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```
The frontend should now be running on `http://localhost:5173`.

---

## Production Deployment to Cloudflare

### 1. Provision Cloudflare Resources

Run the following commands to create your production D1 database and R2 bucket.

**Create D1 Database:**
```bash
npx wrangler d1 create unified-asia-db
```
*(Copy the generated `database_id` and replace the one in `backend/wrangler.toml`)*

**Create R2 Bucket:**
```bash
npx wrangler r2 bucket create unified-asia-files
```

### 2. Apply Migrations to Production D1

```bash
npx wrangler d1 execute unified-asia-db --file=../migrations/0001_initial_schema.sql
npx wrangler d1 execute unified-asia-db --file=../migrations/0002_sequences.sql
```

### 3. Deploy Backend Worker

```bash
cd backend
npm run deploy
```

### 4. Deploy Frontend to Cloudflare Pages

Before deploying, make sure to update `frontend/src/api.ts` so that `API_BASE_URL` points to your newly deployed Worker URL (e.g., `https://unified-asia-backend.YOUR-SUBDOMAIN.workers.dev/api`).

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name unified-asia-invoice-system
```

## Git Initialization

To push this codebase to a new GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit for Unified Asia Invoice System"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```
