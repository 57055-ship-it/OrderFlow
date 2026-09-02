# OrderFlow Production Deployment Guide

This guide provides step-by-step instructions for deploying the **OrderFlow** system to production using **MongoDB Atlas** (Database), **Render** (Node.js Express Backend), and **Vercel** (React/Vite Frontend).

---

## Production Architecture Summary

```
Vercel Frontend (React + Vite)
       │  (HTTPS API Requests)
       ▼
Render Backend (Node.js + Express)
       │  (TLS Connection)
       ▼
MongoDB Atlas (Managed Database)
```

---

## Step A: Set Up MongoDB Atlas Database

1. **Create Account & Cluster**:
   - Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Click **Create a Database** and select the **M0 Free Tier**.
   - Choose your preferred cloud provider and region, then click **Create**.

2. **Create Database User**:
   - Go to **Security > Database Access**.
   - Click **Add New Database User**.
   - Select **Password** authentication.
   - Set a strong username (e.g., `orderflow_user`) and secure password.
   - Set privileges to **Read and write to any database**.
   - Click **Add User**.

3. **Configure Network Access**:
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) so that Render servers can connect securely.
   - Click **Confirm**.

4. **Get Connection String**:
   - Go to **Database > Clusters**.
   - Click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string. It will look like:
     ```text
     mongodb+srv://orderflow_user:<password>@cluster0.abcde.mongodb.net/orderflow?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user's actual password.

---

## Step B: Deploy Backend to Render

1. **Create New Web Service**:
   - Log in to [Render](https://render.com/).
   - Click **New +** > **Web Service**.
   - Connect your GitHub repository containing OrderFlow.

2. **Configure Service Settings**:
   - **Name**: `orderflow-server` (or your preferred name)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

3. **Set Environment Variables**:
   Add the following variables in the **Environment** section:
   - `MONGODB_URI`: `mongodb+srv://orderflow_user:<password>@cluster0.abcde.mongodb.net/orderflow?retryWrites=true&w=majority`
   - `JWT_SECRET`: `replace_with_a_long_secure_random_string`
   - `CLIENT_URL`: `http://localhost:5173` (We will update this with the Vercel URL in Step D)
   - `NODE_ENV`: `production`

   *(Note: Render automatically sets and injects `PORT`. Do not manually hardcode `PORT`.)*

4. **Deploy Service**:
   - Click **Create Web Service**.
   - Wait for the build to complete.
   - Once deployed, copy your Render web service URL (e.g., `https://orderflow-server.onrender.com`).

---

## Step C: Deploy Frontend to Vercel

1. **Import Project into Vercel**:
   - Log in to [Vercel](https://vercel.com/).
   - Click **Add New...** > **Project**.
   - Import your GitHub repository.

2. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set Environment Variables**:
   Under **Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://YOUR-RENDER-BACKEND.onrender.com/api` (Use your actual Render URL from Step B with `/api` appended)

4. **Deploy**:
   - Click **Deploy**.
   - Wait for Vercel to build and publish your project.
   - Copy your live Vercel URL (e.g., `https://orderflow-client.vercel.app`).

---

## Step D: Link Backend CORS to Vercel Frontend

1. Return to your [Render Dashboard](https://dashboard.render.com/).
2. Select your `orderflow-server` web service.
3. Go to **Environment**.
4. Update `CLIENT_URL` to your production Vercel URL:
   - `CLIENT_URL` = `https://orderflow-client.vercel.app`
5. Save changes. Render will automatically redeploy your server.

---

## Verification & Testing Checklist

Once both services are deployed, test the live application:

1. **Health Check**: Open `https://YOUR-RENDER-BACKEND.onrender.com/api/health` in your browser. You should receive:
   `{"success": true, "message": "OrderFlow API is running smoothly", ...}`
2. **Access App**: Open `https://YOUR-VERCEL-FRONTEND.vercel.app`.
3. **Authentication**: Log in with your admin or user credentials.
4. **Navigation & SPA Fallback**: Test refreshing browser on deep routes (`/dashboard`, `/orders`, `/customers`, `/products`, `/reports`, `/settings`) to ensure `vercel.json` SPA fallbacks work seamlessly.
5. **Core Operations**: Create an order, view customer details, and verify real-time dashboard stats to confirm database connectivity.
