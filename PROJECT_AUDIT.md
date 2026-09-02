# OrderFlow — Comprehensive Project Audit & Vercel Deployment Blueprint

## 1. Executive Summary & Current Architecture

**OrderFlow** is a full-stack Order & Indent Management System designed for enterprise operations. It features a modern, responsive React/Vite frontend and a Node.js/Express REST API backend backed by MongoDB.

### Current System Architecture
- **Frontend Stack**: React 18, Vite 5, Tailwind CSS 3, Lucide React, React Router DOM v6, TanStack React Query v5, React Hook Form + Zod, Axios, jsPDF, XLSX, Recharts.
- **Backend Stack**: Node.js, Express.js 4, Mongoose 8, bcryptjs, jsonwebtoken (JWT), Morgan, CORS, dotenv.
- **Database**: MongoDB (Local instance or MongoDB Atlas cloud cluster).
- **Development Execution**: Managed via root `package.json` utilizing `concurrently` to run `npm run server` (port 5001) and `npm run client` (port 5173) simultaneously.

---

## 2. Recommended Vercel Architecture Options

To deploy OrderFlow seamlessly on Vercel while using MongoDB Atlas, two primary deployment architectures are available:

### Option A: Dual-Platform Architecture (Recommended for Enterprise Stability)
- **Frontend**: Deployed on **Vercel** (`client/` root, framework `Vite`, output `dist`).
- **Backend**: Deployed on **Render** or **Railway** as a persistent Node.js Web Service (`server/` root).
- **Database**: **MongoDB Atlas** M0/M10 Cluster.
- **Communication**: Frontend calls `VITE_API_URL=https://orderflow-server.onrender.com/api` with CORS restricted to `CLIENT_URL=https://orderflow-client.vercel.app`.

### Option B: All-in-One Vercel Architecture (Serverless Monorepo)
- **Frontend**: Static site built from `client/` by Vercel.
- **Backend**: Converted into Vercel Serverless Functions via a root `api/index.js` entrypoint wrapping the Express `app`.
- **Database Connection Caching**: `server/config/db.js` must implement connection pooling check (`mongoose.connection.readyState >= 1`) to reuse database connections across stateless serverless invocations.
- **Routing**: `vercel.json` routes `/api/(.*)` to `api/index.js` and all other routes `/(.*)` to `client/dist/index.html`.

---

## 3. Detailed Component & Feature Analysis

### Implemented Features (100% Functional with Real MongoDB Data)
1. **User Authentication & Authorization**:
   - JWT-based authentication with role-based access control (`ADMIN`, `MANAGER`, `EMPLOYEE`).
   - Secure password hashing using `bcryptjs` pre-save hooks.
   - User session management via `AuthContext` and Axios Bearer interceptor.
2. **Dashboard**:
   - Real-time MongoDB aggregate metrics (Total Orders, Pending Orders, Completed Orders, Total Customers).
   - Recent orders table and order status distribution breakdown charts.
3. **Customers Management (CRUD)**:
   - Full MongoDB backing for Customer records (Name, Company, Contact Person, Phone, Email, Address, Notes).
   - Text indexing for search, server-side pagination, sorting, creation, editing, and deletion.
4. **Products Management (CRUD)**:
   - Full MongoDB backing for Product items (Name, SKU, Category, Default UOM, Description).
   - Server-side search, pagination, creation, editing, and deletion.
5. **Orders Management & Workflow**:
   - Full order lifecycle (`Draft` → `Submitted` → `Processing` → `Completed` / `Cancelled`).
   - Auto-generated sequential order numbers (`ORD-YYYY-XXXX`).
   - Line items with product selection, description, UOM, and quantity.
   - Comprehensive audit trail recording status transitions and field updates (`history` schema array).
   - Order duplication, print view, PDF generation, and Excel export.
6. **Reports & Analytics**:
   - Dynamic report generation for Orders, Customers, and Products filtered by date ranges and status.
7. **Activity Logging & Audit Trail**:
   - Automated audit logs for key operations (`LOGIN`, `ORDER_CREATED`, `ORDER_STATUS_CHANGED`, `USER_CREATED`).
8. **Settings & System Preferences**:
   - System-wide company branding, order prefixes, default UOM, and default status stored in MongoDB.
9. **User Management**:
   - Admin panel for creating users, updating roles, toggling active status, and removing accounts.

### Features Requiring No Further Changes
- Frontend design system, responsive UI layouts, and color scheme.
- REST API schema definitions and validation logic.

### Partially Implemented / Optional Enhancements
- **Multi-tenant / Branch Support**: Currently designed for single enterprise/organization.
- **File Upload Storage**: Company logo and attachments currently use text/URL format instead of S3/Cloudinary storage.

---

## 4. API Endpoints Reference Table

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user and returns JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetches current logged-in user profile |
| `GET` | `/api/dashboard/stats` | Authenticated | Aggregates dashboard KPIs & charts data |
| `GET` | `/api/customers` | Authenticated | Fetches paginated list of customers |
| `POST` | `/api/customers` | Admin, Manager | Creates a new customer record |
| `GET` | `/api/customers/:id` | Authenticated | Fetches single customer details |
| `PUT` | `/api/customers/:id` | Admin, Manager | Updates existing customer record |
| `DELETE` | `/api/customers/:id` | Admin, Manager | Deletes customer record |
| `GET` | `/api/products` | Authenticated | Fetches paginated list of products |
| `POST` | `/api/products` | Admin, Manager | Creates a new product item |
| `GET` | `/api/products/:id` | Authenticated | Fetches single product details |
| `PUT` | `/api/products/:id` | Admin, Manager | Updates existing product item |
| `DELETE` | `/api/products/:id` | Admin, Manager | Deletes product item |
| `GET` | `/api/orders` | Authenticated | Fetches paginated list of orders |
| `POST` | `/api/orders` | Authenticated | Creates a new order |
| `GET` | `/api/orders/:id` | Authenticated | Fetches complete order detail & history |
| `PUT` | `/api/orders/:id` | Authenticated | Updates draft/existing order |
| `DELETE` | `/api/orders/:id` | Authenticated | Deletes order |
| `POST` | `/api/orders/:id/duplicate` | Authenticated | Duplicates an existing order |
| `PATCH` | `/api/orders/:id/status` | Authenticated | Updates order status & appends audit history |
| `GET` | `/api/reports/orders` | Admin, Manager | Generates order performance reports |
| `GET` | `/api/reports/customers` | Admin, Manager | Generates customer activity reports |
| `GET` | `/api/reports/products` | Admin, Manager | Generates product volume reports |
| `GET` | `/api/activity-logs` | Admin | Fetches paginated activity audit logs |
| `GET` | `/api/users` | Admin | Fetches list of system users |
| `POST` | `/api/users` | Admin | Creates a new user account |
| `PUT` | `/api/users/:id` | Admin | Updates user profile / role |
| `PATCH` | `/api/users/:id/status` | Admin | Toggles user active/deactivated status |
| `DELETE` | `/api/users/:id` | Admin | Removes user account |
| `GET` | `/api/settings` | Authenticated | Fetches application settings |
| `PUT` | `/api/settings` | Admin, Manager | Updates application settings |
| `GET` | `/api/health` | Public | System health check endpoint |

---

## 5. Database Schema & Models Reference Table

| Model | Collection | Primary Fields | Key Indexes |
| :--- | :--- | :--- | :--- |
| `User` | `users` | `name`, `email`, `password`, `role`, `isActive` | `email` (unique) |
| `Customer` | `customers` | `name`, `companyName`, `contactPerson`, `phone`, `email`, `address`, `notes` | Text index (`name`, `companyName`, `email`) |
| `Product` | `products` | `name`, `sku`, `description`, `category`, `defaultUOM` | Text index (`name`, `sku`, `category`), `sku` (sparse) |
| `Order` | `orders` | `orderNumber`, `customer`, `date`, `poNumber`, `indentNumber`, `status`, `products`, `history`, `createdBy` | `customer`, `date` (-1), `status` |
| `Settings` | `settings` | `companyName`, `companyLogo`, `address`, `phone`, `email`, `website`, `orderPrefix`, `defaultUOM`, `defaultOrderStatus` | Primary Key |
| `ActivityLog`| `activitylogs`| `user`, `userName`, `userEmail`, `action`, `entityType`, `entityId`, `description`, `changes` | `createdAt` (-1), `user`, `action`, `entityType` |

---

## 6. Frontend Pages & Components Reference Table

| File Path | Type | Purpose & Description |
| :--- | :--- | :--- |
| `client/src/pages/LoginPage.jsx` | Page | User login form with JWT authentication |
| `client/src/pages/DashboardPage.jsx` | Page | KPI metric cards, status charts, and recent activity |
| `client/src/pages/OrdersListPage.jsx` | Page | Paginated order list with search, status filtering, and bulk actions |
| `client/src/pages/CreateOrderPage.jsx` | Page | Order creation form with dynamic line item addition & validation |
| `client/src/pages/EditOrderPage.jsx` | Page | Order modification form |
| `client/src/pages/OrderDetailPage.jsx` | Page | Comprehensive order view, printable invoice/indent, PDF export, audit log |
| `client/src/pages/CustomersListPage.jsx` | Page | Customer directory with create/edit modal and search |
| `client/src/pages/CustomerDetailPage.jsx` | Page | Single customer overview and order history |
| `client/src/pages/ProductsListPage.jsx` | Page | Product catalog management with search & filter |
| `client/src/pages/ReportsPage.jsx` | Page | Analytical reporting suite with Excel/PDF export |
| `client/src/pages/ActivityLogsPage.jsx` | Page | System-wide security and audit log viewer |
| `client/src/pages/UsersPage.jsx` | Page | Admin user management console |
| `client/src/pages/SettingsPage.jsx` | Page | Enterprise organization and system settings form |
| `client/src/components/layout/Header.jsx` | Component | Top navbar with search bar, notifications, and profile menu |
| `client/src/components/layout/Sidebar.jsx` | Component | Desktop navigation sidebar with role-filtered links |
| `client/src/components/layout/MobileNav.jsx` | Component | Responsive drawer navigation for mobile devices |
| `client/src/components/common/ConfirmDialog.jsx` | Component | Accessible modal for destructive action confirmations |
| `client/src/components/orders/OrderPrintView.jsx` | Component | Print-optimized purchase order / indent document template |

---

## 7. Environment Variables Matrix

### Frontend Environment Variables (`client/.env`)
| Variable | Value for Local Dev | Value for Vercel Production |
| :--- | :--- | :--- |
| `VITE_API_URL` | `/api` | `https://YOUR-RENDER-BACKEND.onrender.com/api` (or `/api` if using Vercel Serverless) |

### Backend Environment Variables (`server/.env`)
| Variable | Required | Description / Example |
| :--- | :--- | :--- |
| `PORT` | Optional (Auto on Render) | Default `5001` locally. Dynamically set by host in production. |
| `MONGODB_URI` | **Required** | `mongodb+srv://user:password@cluster.mongodb.net/orderflow` |
| `JWT_SECRET` | **Required** | Cryptographically secure random secret string |
| `CLIENT_URL` | **Required** | `https://your-app.vercel.app` (Commas allowed for multiple origins) |
| `NODE_ENV` | **Required** | `production` |

---

## 8. Vercel Deployment & Compatibility Checklist

### 1. Monorepo Adaptation
- Current local execution relies on `concurrently` running `npm run server` and `npm run client`.
- For Vercel, `client` is set as the Vercel Root Directory with Framework `Vite` and Build Command `npm run build`.

### 2. SPA Navigation Rewrites
- Solved via `client/vercel.json`:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
- Ensures client-side routes return `index.html` on direct browser refresh.

### 3. Serverless Database Connection Optimization (If using Vercel Serverless Functions)
- In traditional Express apps (`server.js`), `mongoose.connect()` is called once on startup.
- In serverless environments, connection reuse must be checked:
  ```javascript
  let cached = global.mongoose;
  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
  }
  async function connectDB() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.MONGODB_URI).then((m) => m);
    }
    cached.conn = await cached.promise;
    return cached.conn;
  }
  ```

---

## 9. Security Audit Findings

1. **Secrets Isolation**: No database passwords or JWT secrets are hardcoded in source code. `.env` files are strictly excluded via `.gitignore`.
2. **CORS Enforcement**: Backend origin whitelist dynamically checks `CLIENT_URL` and blocks unapproved external domains while supporting local development.
3. **Password Security**: Uses `bcryptjs` with 10 salt rounds. Passwords are automatically stripped from default queries via `select: false`.
4. **JWT Verification**: Token signature and expiration are verified on every protected API route. Deactivated users are immediately barred from access.

---

## 10. Recommended Next Implementation Steps

1. **Provision MongoDB Atlas Cluster**: Set up free M0 cluster, configure database user, and whitelist IP range `0.0.0.0/0`.
2. **Deploy Backend Web Service**: Deploy `server/` to Render with environment variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`).
3. **Deploy Frontend Web Site**: Deploy `client/` to Vercel with `VITE_API_URL` pointing to the live backend URL.
4. **Synchronize CORS Settings**: Update `CLIENT_URL` on Render with the generated Vercel production domain.
