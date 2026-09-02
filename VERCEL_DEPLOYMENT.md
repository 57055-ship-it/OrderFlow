# OrderFlow — Unified Vercel Single-Project Deployment Guide

This guide describes how to deploy the entire **OrderFlow** application (React/Vite Frontend + Express Node.js Backend as Vercel Serverless Functions + MongoDB Atlas) to **Vercel** under **ONE single Vercel project**.

---

## 1. Production Architecture Overview

OrderFlow is configured as a unified monorepo for Vercel. Vercel automatically serves the static Vite frontend from `client/dist` and executes backend API requests as Serverless Functions via `api/index.js`.

```
                    ┌─────────────────────────────────────────┐
                    │            Vercel Project               │
                    │                                         │
  User Browser ────►│   Static Assets (React + Vite SPA)      │
                    │   Route: /* ──► client/dist/index.html  │
                    │                                         │
                    │   Serverless API Functions              │
                    │   Route: /api/* ──► api/index.js        │
                    └────────────────────┬────────────────────┘
                                         │
                                         │ Mongoose TLS Pool
                                         ▼
                            ┌─────────────────────────┐
                            │      MongoDB Atlas      │
                            │   Managed DB Cluster    │
                            └─────────────────────────┘
```

### Key Technical Advantages
- **Single Domain**: Eliminates cross-origin CORS complexity entirely because both the React UI and API run on the same domain (`https://your-project.vercel.app`).
- **Unified Deployment**: Deploy frontend and backend together with a single git push.
- **Connection Caching**: `server/config/db.js` reuses Mongoose connection pools across serverless invocations.

---

## 2. Vercel Project Configuration Settings

When importing your repository into Vercel, use the following configuration:

| Setting | Configuration Value |
| :--- | :--- |
| **Framework Preset** | `Vite` |
| **Root Directory** | `./` (Leave as Project Root) |
| **Build Command** | `npm run build` |
| **Output Directory** | `client/dist` |
| **Install Command** | `npm run install:all` *(or default `npm install`)* |

---

## 3. Required Environment Variables

Set these environment variables in your Vercel Dashboard under **Project Settings > Environment Variables**:

| Variable | Target Environment | Description / Value Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | Production, Preview | `mongodb+srv://admin_user:<password>@cluster0.abcde.mongodb.net/orderflow?retryWrites=true&w=majority` |
| `JWT_SECRET` | Production, Preview | Cryptographically secure random secret key (e.g., `a7f9b8c3d2e1f4a5...`) |
| `NODE_ENV` | Production, Preview | `production` |
| `VITE_API_URL` | Production, Preview | `/api` *(Uses same-origin relative endpoint)* |

> [!IMPORTANT]
> - **Never** expose `MONGODB_URI` or `JWT_SECRET` with the `VITE_` prefix. Only `VITE_API_URL` should be exposed to the browser.
> - Ensure your database password in `MONGODB_URI` does not contain unencoded special characters (`@`, `:`, `/`, `?`, `#`).

---

## 4. MongoDB Atlas Network & Security Setup

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Navigate to **Network Access** under **Security**.
3. Click **Add IP Address** and add `0.0.0.0/0` (Allow access from anywhere). This allows Vercel's dynamic serverless IP range to connect securely to your database cluster.
4. Navigate to **Database Access** and verify your database user has `Read and write to any database` permissions.

---

## 5. Step-by-Step Vercel Deployment Instructions

1. **Push Changes to GitHub**:
   Ensure all changes are committed and pushed to your repository:
   ```bash
   git add .
   git commit -m "Configure OrderFlow for unified Vercel Serverless deployment"
   git push origin main
   ```

2. **Import Repository into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... > Project**.
   - Select your GitHub repository.

3. **Configure Project & Environment Variables**:
   - Set **Build Command** to `npm run build`.
   - Set **Output Directory** to `client/dist`.
   - Expand **Environment Variables** and add `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, and `VITE_API_URL=/api`.

4. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend assets, bundle `api/index.js` as a serverless function, and assign a production URL (e.g., `https://orderflow.vercel.app`).

---

## 6. Local Development Workflow

To continue developing locally:

```bash
# Start both client (Vite on port 5173) and backend (Express on port 5001)
npm run dev
```

- **Frontend Dev Server**: `http://localhost:5173`
- **Backend Dev Server**: `http://localhost:5001`
- **Vite Proxy**: `client/vite.config.js` automatically proxies local `/api` calls from port `5173` to `http://localhost:5001`.

---

## 7. Troubleshooting Guide

### 1. Direct Page Refresh Returns 404
- **Cause**: React Router SPA client-side routing routes (`/orders`, `/dashboard`, `/customers`) hit the server directly on refresh.
- **Solution**: Handled automatically by `vercel.json` rewrites (`"source": "/(.*)", "destination": "/index.html"`).

### 2. MongoDB Connection Timeout in Serverless Function
- **Cause**: Database user password incorrect, network whitelist missing `0.0.0.0/0`, or connection pooling missing.
- **Solution**: Verify connection caching in `server/config/db.js` and ensure Atlas Network Access allows `0.0.0.0/0`.

### 3. `/api/health` Returns HTML instead of JSON
- **Cause**: Rewrite order in `vercel.json` placing fallback rewrite before API rewrites.
- **Solution**: Ensure `/api/(.*)` rewrite appears **before** `/(.*)` in `vercel.json`.
