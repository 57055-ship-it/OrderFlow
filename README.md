# OrderFlow — Premium Order & Indent Management System

OrderFlow is a production-quality enterprise web application designed for order processing, indent management, customer relationship tracking, product catalogs, business reporting, and activity auditing.

## Tech Stack

### Frontend
- **Framework**: React (Vite, JavaScript)
- **Styling**: Tailwind CSS with dark mode support, custom design tokens, and dedicated `@media print` print styles
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **State & Query**: TanStack Query (React Query)
- **Routing**: React Router DOM v6
- **Forms & Validation**: React Hook Form + Zod
- **Document Export**: jsPDF + jspdf-autotable (A4 PDF Generation), XLSX (Excel Export)
- **Utilities**: date-fns, clsx, tailwind-merge

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB & Mongoose
- **Security & Auth**: JWT (JSON Web Tokens), bcryptjs password hashing, Role-Based Access Control (RBAC)
- **Middleware**: CORS, Morgan, Error Handler
- **Concurrency**: `concurrently` for running frontend and backend in parallel

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017/orderflow` or remote URI)

### Quick Start (One Command)

1. Clone or navigate to the repository directory.
2. Install all dependencies and seed the database:
   ```bash
   npm run install:all
   npm run seed
   ```
3. Start both frontend and backend concurrently:
   ```bash
   npm run dev
   ```

- **Frontend URL**: `http://localhost:5173`
- **Backend API URL**: `http://localhost:5000`

---

## Default Accounts (Seed Data)

The seed script creates pre-configured accounts for testing role-based permissions:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@orderflow.com` | `Admin123!` | Full Access (Dashboard, Orders, Customers, Products, Reports, Activity Logs, Users, Settings) |
| **Manager** | `manager@orderflow.com` | `Manager123!` | Operational Access (Dashboard, Orders, Customers, Products, Reports, Settings) |
| **Employee** | `employee@orderflow.com` | `Employee123!` | Order Workspace (Dashboard, Create Orders, View/Edit Own Draft Orders) |

> **Security Note**: Change default passwords before deploying to production environments.

---

## Key Features

1. **Modernized Order Creation Workspace**:
   - Section 1: Customer select, Order Date, PO Number, Auto-generated Order Number (`ORD-000001`), Indent Number, Status selector.
   - Section 2: Unlimited Product Rows. Selecting a item from Product Master auto-populates description and UOM. Line items allow manual editing, quantity validation, row duplication, and deletion.
   - Right Summary Panel: Live line items count and total quantity aggregate.
   - Sticky Action Bar: Save Draft vs Submit Order (with confirmation dialog).

2. **Order Lifecycle & Audit Trail**:
   - Statuses: Draft, Submitted, Processing, Completed, Cancelled.
   - Detailed audit history records field changes (e.g. Quantity 500 &rarr; 1000, Status Draft &rarr; Submitted) with timestamps and user details.
   - Duplication feature creates a copy with current date and new order number.

3. **Document Export & Printing**:
   - **PDF Generation**: Corporate A4 document layout formatted via jsPDF autotable with repeating table headers, signature boxes (Prepared By, Approved By, Customer Signature), and custom company header.
   - **Physical Print View**: Clean CSS `@media print` stylesheet hiding sidebars/buttons.
   - **Excel Export**: SheetJS export for Orders, Customers, and Products.

4. **Executive Dashboard**:
   - 7 Top KPI cards, Orders trend bar chart (Recharts), Status distribution pie chart, Top Customers, Top Products, and Recent Orders data table.

5. **Role-Based Security**:
   - Frontend route guards + Backend middleware enforcement (`ADMIN`, `MANAGER`, `EMPLOYEE`).
   - Admin-only User Management & System Activity Audit Logs.

---

## Folder Structure

```
.
├── client/
│   ├── src/
│   │   ├── components/       # UI, Layout, Dashboard, Orders, Common
│   │   ├── context/          # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/            # Dashboard, Orders, Customers, Products, Reports, Activity, Users, Settings
│   │   ├── services/         # Axios API interceptor
│   │   ├── utils/            # PDF Generator & Excel Exporter
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/               # MongoDB db connection
│   ├── controllers/          # Express API controllers
│   ├── middleware/           # JWT Auth, Role RBAC, Error Handler
│   ├── models/               # Mongoose models (User, Customer, Product, Order, ActivityLog, Settings)
│   ├── routes/               # API routes
│   ├── seed/                 # Database seed script
│   ├── server.js             # Server entrypoint
│   └── package.json
├── package.json              # Root workspace package.json
├── README.md
└── FEATURES.md
```
