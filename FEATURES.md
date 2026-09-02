# OrderFlow Features Matrix & System Specifications

## 1. Authentication & Role Permissions
- **JWT Authentication**: Token stored securely in `localStorage`, attached automatically via Axios request interceptors.
- **bcrypt Password Hashing**: Hashed passwords with salt factor 10.
- **Role Permissions**:
  - **ADMIN**: Access to Dashboard, Orders, Customers, Products, Reports, Activity Logs, Users, Settings.
  - **MANAGER**: Access to Dashboard, Orders, Customers, Products, Reports, Settings.
  - **EMPLOYEE**: Access to Dashboard, Create Orders, View/Edit Own Draft Orders.
- **Safety Protections**: Last administrator account cannot be deleted or deactivated.

## 2. Order & Indent Workflow
- **Auto-Generated Order Numbers**: Format `ORD-000001` controlled by backend sequence and prefix settings.
- **Product Row System**:
  - Unlimited dynamic line items per order.
  - Product selection from Product Master auto-fills Description & UOM.
  - Line items allow manual editing, quantity validation (>0), row duplication, and row deletion.
- **Order Statuses**: Draft, Submitted, Processing, Completed, Cancelled.
- **Order Duplication**: Clones existing indents with current date and new sequence number.
- **Audit Modification History**: Tracks every change (customer, PO #, status, items list) with user stamp and timestamp.

## 3. Documents & Reporting
- **A4 PDF Generation**: Corporate document formatting with jsPDF + autotable. Includes company logo, header details, order breakdown, signature boxes, and multi-page pagination.
- **Physical Print Stylesheet**: Dedicated CSS `@media print` rules hiding navigation and formatting clean printable pages.
- **Excel Exporter**: Instant XLSX file download for Orders, Customers, Products, and Reports.
- **Executive Analytics**: Dynamic Recharts charts for orders trend and status distribution.

## 4. UI/UX Design System
- **Theme Support**: Light mode, Dark mode, and System Preference persistence.
- **Toast Notifications**: Context-driven alert toasts for Success, Error, Warning, Info.
- **Global Search**: Top bar input searching across Orders, Customers, and Products with grouped dropdown results.
- **Responsive Layout**: Collapsible sidebar on desktop, touch-friendly mobile drawer on mobile.
