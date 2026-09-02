# OrderFlow — System Documentation Report

> **Project Name**: OrderFlow — Premium Order & Indent Management System  
> **System Architecture**: Enterprise Full-Stack Web Application (Node.js, Express, MongoDB, React, Vite, Tailwind CSS)  
> **Document Type**: Official System Documentation & Visual User Guide  

---

## 1. Executive Summary

OrderFlow is a commercial-grade Enterprise Resource Planning (ERP) and Order/Indent Management Solution built for commercial businesses, logistics providers, industrial suppliers, and manufacturing hubs. 

The application modernizes traditional manual order management, physical paper indents, and fragmented spreadsheets into an integrated, real-time digital workspace. OrderFlow automates order number sequencing, catalog item auto-filling, line-item quantity aggregation, status lifecycle management, audit history tracking, role-based security, professional A4 PDF generation, and executive business reporting.

---

## 2. Technology Stack & Architectural Overview

The system utilizes a decoupled client-server architecture with strict separation of concerns, API REST endpoints, and reactive client state management.

### 2.1 Backend Layer
- **Core Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose Object Data Modeling (ODM)
- **Authentication**: JSON Web Tokens (JWT) with HTTP Bearer Authorization header
- **Password Security**: `bcryptjs` salted password hashing (salt factor 10)
- **Middleware**: CORS, Morgan HTTP request logging, Centralized Error Handling, Role-Based Authorization Guards

### 2.2 Frontend Layer
- **Framework**: React (Vite build engine, JavaScript ES6+)
- **Design System & Styling**: Tailwind CSS with HSL color tokens, dark mode class switching, custom scrollbars, and dedicated `@media print` print CSS
- **Component System & Icons**: Lucide React icons, custom modals, status badges, pagination, and toast notification provider
- **State Management & Caching**: TanStack Query (React Query) and React Context API
- **Data Visualization**: Recharts (Responsive Bar Charts and Pie Charts)
- **Document Exporting**: jsPDF with `jspdf-autotable` plugin (A4 formatted PDFs) and SheetJS (`xlsx`) for Excel spreadsheets

---

## 3. System Modules & Functional Reference

### 3.1 Authentication & Multi-Role Access Control

OrderFlow enforces Role-Based Access Control (RBAC) across both frontend routes and backend REST endpoints. The system defines three standardized user roles:

1. **ADMIN**: Unrestricted system privileges. Full access to Dashboard, Orders, Customers, Products, Reports, Activity Audit Logs, User Credential Management, and System Branding Settings.
2. **MANAGER**: Operational oversight. Access to Dashboard, Orders, Customers, Products, Reports, and System Settings. Cannot delete or manage user accounts or view security audit logs.
3. **EMPLOYEE**: Field order entry. Access to Dashboard, Create New Orders, View Own Orders, and Edit Own Draft Orders. Forbidden from deleting items, altering global settings, or viewing activity logs.

#### Authentication Interface
The authentication portal features email/password inputs, show/hide password toggles, persistent session state, and rapid development account quick-fill options.

![Authentication Portal](file:///Users/Mirza/.gemini/antigravity-ide/brain/47d798c9-0a8e-4f4e-9546-a54756f93df8/login_page_1788206481803.png)

---

### 3.2 Executive Dashboard & Operational Analytics

The Executive Dashboard provides operational visibility across all order activity, customer accounts, and catalog products.

#### Dashboard Capabilities:
- **KPI Summary Cards**: Real-time counters for Total Orders, Draft Orders, Submitted Orders, Processing Orders, Completed Orders, Total Customers, and Total Products.
- **Orders Overview Bar Chart**: Visualizes monthly order volume trends over a rolling 6-month period.
- **Status Distribution Pie Chart**: Interactive breakdown showing the proportion of orders across Draft, Submitted, Processing, Completed, and Cancelled stages.
- **Recent Orders Table**: Real-time table displaying newly created indents with quick navigation links.
- **Quick Action Bar**: One-click shortcuts for creating orders, adding customers, adding products, and viewing reports.

![Executive Dashboard Overview](file:///Users/Mirza/.gemini/antigravity-ide/brain/47d798c9-0a8e-4f4e-9546-a54756f93df8/dashboard_overview_1788206545134.png)

---

### 3.3 Create Order Workspace — Core Feature

The **Create Order** screen modernizes traditional paper indents into a multi-section workspace designed for fast data entry and error prevention.

#### Key Features:
- **Section 1: Order Information**:
  - Customer selection dropdown with search.
  - Order Date picker.
  - PO Number and Indent Number inputs.
  - Backend auto-generated sequential Order Number (e.g. `ORD-000001`).
  - Status selector (Draft, Submitted, Processing).
- **Section 2: Product Row System**:
  - Unlimited dynamic product line items.
  - Selecting an item from the Product Master catalog automatically populates description and default Unit of Measure (UOM).
  - Manual description editing and UOM selection (PCS, Pairs, KG, Grams, Boxes, Cartons, Sets, Dozens, Meters, Custom).
  - Quantity validation (must be greater than 0).
  - Inline row actions: Duplicate line item, Delete line item, Reorder rows.
- **Section 3: Order Summary Sidebar**:
  - Displays selected customer details, total line items count, and aggregate unit quantity in real time.
- **Sticky Action Bar**:
  - Save Draft (saves as editable Draft state).
  - Submit Order (triggers confirmation modal and advances order to Submitted status).

![Create Order Workspace](file:///Users/Mirza/.gemini/antigravity-ide/brain/47d798c9-0a8e-4f4e-9546-a54756f93df8/create_order_page_1788206585822.png)

---

### 3.4 All Orders Management & Lifecycle Filtering

The **All Orders** module serves as the central data hub for monitoring indents across their lifecycle stages.

#### Capabilities:
- **Lifecycle Quick Filter Tabs**: All, Draft, Submitted, Processing, Completed, Cancelled.
- **Multi-Parameter Search & Filter**: Search by Order #, PO #, Indent #, Customer name, Date Range, or Customer filter.
- **Data Table Columns**: Order Number, Customer Name & Company, Date, PO #, Indent #, Line Items count, Status Badge, Created By, and Action toolbar.
- **Row Action Controls**: View Details, Edit Order, Duplicate Order, Download PDF, Delete Order (with modal confirmation).
- **Data Export**: One-click export of current filtered orders table to formatted Excel spreadsheet (`.xlsx`).

![All Orders Management View](file:///Users/Mirza/.gemini/antigravity-ide/brain/47d798c9-0a8e-4f4e-9546-a54756f93df8/all_orders_page_1788206640335.png)

---

### 3.5 Order Details, PDF Generation & Audit History

The **Order Details** page presents complete information regarding a specific order, including customer metadata, line items table, status management, PDF document generation, and modification audit history.

#### Features:
- **Header Actions**: Instant status transition dropdown, Edit button, Duplicate order action, Print view button, Download PDF button.
- **Metadata Cards**: Customer contact & delivery address, reference numbers (PO, Indent, Order Date), total items count, and total aggregate quantity.
- **Product Line Table**: Formatted table displaying item descriptions, quantities, and UOM.
- **Modification Audit History Tab**: Logs every field change (customer change, quantity adjustment, status update) with user stamp, timestamp, previous value, and new value.
- **PDF Generation**: Generates a professional A4 corporate purchase/order document containing company header logo, customer info block, item table, and formal signature blocks (Prepared By, Approved By, Customer Signature).

![Order Details & Status Workflow](file:///Users/Mirza/.gemini/antigravity-ide/brain/47d798c9-0a8e-4f4e-9546-a54756f93df8/order_details_page_1788206708613.png)

---

### 3.6 Customer Directory Management

The **Customers** module manages client accounts, corporate profiles, billing addresses, and order history.

#### Capabilities:
- Customer grid view displaying company names, primary contacts, emails, phones, and addresses.
- Search and pagination controls.
- Add Customer / Edit Customer dialog forms.
- **Customer Detail Screen**: Displays complete client profile, total orders placed, total products ordered aggregate, order history list, and a direct button to "Create Order for Customer".

![Customer Directory](file:///Users/Mirza/.gemini/antigravity-ide/brain/47d798c9-0a8e-4f4e-9546-a54756f93df8/customers_page_1788206774923.png)

---

### 3.7 Product Master Catalog

The **Products** module manages the central catalog of inventory items, raw materials, and manufactured goods.

#### Capabilities:
- Product list displaying Product Name, SKU / Item Code, Category, Default UOM, and Description.
- Unique SKU validation (prevents duplicate catalog codes).
- Add/Edit product modal forms.
- Excel export of product catalog.

![Product Master Catalog](file:///Users/Mirza/.gemini/antigravity-ide/brain/47d798c9-0a8e-4f4e-9546-a54756f93df8/products_page_1788206834090.png)

---

### 3.8 Business Analytics & Filtered Reporting

The **Reports** module provides data analytics for operational decision-making.

#### Report Types:
1. **Orders Breakdown**: Filtered list of indents with total quantity metrics and status distribution.
2. **Customer-Wise Report**: Summary table showing order counts, total units ordered, and last order date per customer.
3. **Product-Wise Report**: Breakdown showing total quantity ordered per product description across all orders.

#### Actions:
- Dynamic Date From / Date To range filtering.
- One-click Excel export (`.xlsx`) and physical document print.

![Business Analytics & Reports](file:///Users/Mirza/.gemini/antigravity-ide/brain/47d798c9-0a8e-4f4e-9546-a54756f93df8/reports_page_1788206894722.png)

---

### 3.9 System Activity & Audit Logs (Admin Only)

The **Activity Logs** screen provides administrators with security and audit compliance tracking.

#### Tracked Events:
- User Logins & Logouts
- Customer Creation, Modifications & Deletions
- Product Catalog Additions, Edits & Deletions
- Order Creation, Status Modifications, Duplications & Deletions
- User Account Changes & Status Toggles
- System Settings & Prefix Updates

![System Activity Audit Logs](file:///Users/Mirza/.gemini/antigravity-ide/brain/47d798c9-0a8e-4f4e-9546-a54756f93df8/activity_logs_1788207136796.png)

---

### 3.10 User & Access Control Management (Admin Only)

The **Users** screen allows administrators to manage user accounts, assign system roles, and control access.

#### Features:
- User list displaying full name, email, assigned role (`ADMIN`, `MANAGER`, `EMPLOYEE`), and active status.
- Add User / Edit User modal form with password assignment.
- One-click Active/Inactive status toggle.
- **Safety Protections**: Backend logic prevents deactivating or deleting the last active Administrator account.

![User Management Interface](file:///Users/Mirza/.gemini/antigravity-ide/brain/47d798c9-0a8e-4f4e-9546-a54756f93df8/users_page_1788207198746.png)

---

### 3.11 System Settings & Dark Mode Appearance

The **Settings** module allows administrators and managers to configure company details and appearance themes.

#### Features:
- **Company Information**: Name, Logo URL, Address, Phone, Email, Website (automatically populated into generated PDF documents).
- **Order Sequencing**: Configurable Order Prefix (e.g. `ORD-`), default UOM, and default order status.
- **Appearance Mode**: Toggle between Light Mode, Dark Mode, and System Preference (persisted in `localStorage`).

![Dark Mode & System Settings](file:///Users/Mirza/.gemini/antigravity-ide/brain/47d798c9-0a8e-4f4e-9546-a54756f93df8/dark_mode_settings_1788207049757.png)

---

## 4. Database Schema Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATABASE SCHEMAS                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  USER SCHEMA                                                            │
│  ├── _id: ObjectId (Primary Key)                                        │
│  ├── name: String (Required)                                            │
│  ├── email: String (Unique, Lowercase, Indexed)                         │
│  ├── password: String (Hashed with bcryptjs)                            │
│  ├── role: Enum ['ADMIN', 'MANAGER', 'EMPLOYEE']                       │
│  └── isActive: Boolean (Default: true)                                  │
│                                                                         │
│  CUSTOMER SCHEMA                                                        │
│  ├── _id: ObjectId (Primary Key)                                        │
│  ├── name: String (Required, Text Indexed)                              │
│  ├── companyName: String (Text Indexed)                                 │
│  ├── contactPerson: String                                              │
│  ├── phone: String                                                      │
│  ├── email: String (Lowercase)                                          │
│  ├── address: String                                                    │
│  └── notes: String                                                      │
│                                                                         │
│  PRODUCT SCHEMA                                                         │
│  ├── _id: ObjectId (Primary Key)                                        │
│  ├── name: String (Required, Text Indexed)                              │
│  ├── sku: String (Unique, Sparse Indexed)                               │
│  ├── description: String                                                │
│  ├── category: String (Default: 'General')                              │
│  └── defaultUOM: String (Default: 'PCS')                                │
│                                                                         │
│  ORDER SCHEMA                                                           │
│  ├── _id: ObjectId (Primary Key)                                        │
│  ├── orderNumber: String (Unique Indexed, e.g. ORD-000001)             │
│  ├── customer: Ref -> Customer (Required, Indexed)                      │
│  ├── date: Date (Required, Indexed)                                     │
│  ├── poNumber: String                                                   │
│  ├── indentNumber: String                                               │
│  ├── status: Enum ['Draft', 'Submitted', 'Processing', 'Completed',     │
│  │                  'Cancelled'] (Indexed)                              │
│  ├── products: Array of OrderItems                                      │
│  │   ├── product: Ref -> Product                                        │
│  │   ├── productName: String                                            │
│  │   ├── description: String                                            │
│  │   ├── quantity: Number (Min: 1)                                      │
│  │   ├── uom: String                                                    │
│  │   └── position: Number                                               │
│  ├── history: Array of AuditRecords                                     │
│  │   ├── user: Ref -> User                                              │
│  │   ├── userName: String                                               │
│  │   ├── action: String                                                 │
│  │   ├── field: String                                                  │
│  │   ├── previousValue: String                                          │
│  │   ├── newValue: String                                               │
│  │   └── timestamp: Date                                                │
│  ├── createdBy: Ref -> User (Required)                                  │
│  └── updatedBy: Ref -> User                                             │
│                                                                         │
│  ACTIVITY LOG SCHEMA                                                    │
│  ├── _id: ObjectId (Primary Key)                                        │
│  ├── user: Ref -> User                                                  │
│  ├── userName: String                                                   │
│  ├── userEmail: String                                                  │
│  ├── action: String (LOGIN, ORDER_CREATED, ORDER_STATUS_CHANGED, etc.) │
│  ├── entityType: String (Order, Customer, Product, User, Settings)      │
│  ├── entityId: String                                                   │
│  ├── entityName: String                                                 │
│  ├── description: String                                                │
│  └── createdAt: Date (Indexed)                                          │
│                                                                         │
│  SETTINGS SCHEMA                                                        │
│  ├── companyName: String                                                │
│  ├── companyLogo: String                                                │
│  ├── address: String                                                    │
│  ├── phone: String                                                      │
│  ├── email: String                                                      │
│  ├── website: String                                                    │
│  ├── orderPrefix: String (Default: 'ORD-')                              │
│  ├── defaultUOM: String (Default: 'PCS')                                │
│  └── defaultOrderStatus: String (Default: 'Draft')                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. System Setup & Installation Guide

### 5.1 Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (Running locally on `mongodb://127.0.0.1:27017/orderflow` or remote connection string)

### 5.2 Step-by-Step Installation

1. **Clone / Open Workspace**:
   Navigate to the root directory containing `package.json`, `client/`, and `server/`.

2. **Install Dependencies & Seed Database**:
   Run the unified installation and seed command:
   ```bash
   npm run install:all
   npm run seed
   ```

3. **Start Application**:
   Run the development launcher to start both servers concurrently:
   ```bash
   npm run dev
   ```

4. **Access Applications**:
   - **Frontend Interface**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5001`

### 5.3 Default Credentials for Testing

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@orderflow.com` | `Admin123!` |
| **Manager** | `manager@orderflow.com` | `Manager123!` |
| **Employee** | `employee@orderflow.com` | `Employee123!` |

---

## 6. Document Verification & Sign-off

This documentation report represents the complete, production-verified system state for **OrderFlow — Premium Order & Indent Management System**. All visual interface components, API services, database indexes, document exporters, and role security modules are verified operational.
