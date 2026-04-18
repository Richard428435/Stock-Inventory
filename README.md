# 🛠️ Stock Inventory Management System

A sleek, responsive, and highly customizable full-stack inventory management application. Designed with a modern "liquid-glass" UI, this system provides administrators with complete control over their hardware settings, data exporting, and global app branding—all without needing to touch a single line of code.

---

## ✨ Features

- **White-Label App Designer:** Real-time configuration panel for Admins to swap out Global Background Images, update Organization Names, and inject dynamic Bible Verses (or custom quotes) onto the Login Screen.
- **Glassmorphism UI:** Stunning aesthetics utilizing animated `vanta.js` (by default) layered under frosted glass-pane dashboard components (`bg-white/10 backdrop-blur-3xl`).
- **Native Data Exporting:** In-browser reporting engine that generates **CSV, Excel (XML), and PDF** logs for inventory data without heavy third-party plugins.
- **Advanced Barcode Engine:** 
  - Print native QR & Code128 barcodes directly from the browser window.
  - Scan barcodes instantly using mobile device cameras via integrated `@zxing/browser`.
  - Save hardware preferences (default camera: Front vs Rear) natively to the device.
- **Role-Based Security:** Separate permissions for **Admin** (System Configs, User Approvals) and **Staff/Users** (Item Data Entry, Stock Operations).
- **Maintenance Tracking:** Dedicated workflows for tracking item repairs and scheduled equipment service logs.

---

## 📋 Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| **Frontend**    | React 18, Tailwind CSS, Vanta.js |
| **Backend**     | Node.js, Express                  |
| **Database**    | MongoDB (Mongoose)                |
| **Auth**        | JWT + bcryptjs                    |
| **Barcodes**    | JsBarcode + ZXing (camera scan)   |
| **UI Styles**    | Cinzel (display) + Inter (body)  |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ 
- **MongoDB** running locally OR a MongoDB Atlas URI

### Step 1 — Configure Environment

Create and edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/stock-inventory
JWT_SECRET=your_super_secret_jwt_key_2026
NODE_ENV=development
```

### Step 2 — Install Dependencies

Open two terminal windows to install core dependencies.
```bash
# Terminal 1: Server
cd server
npm install

# Terminal 2: Client
cd client
npm install
```

### Step 3 — Start the Application

**Terminal 1 — Backend API:**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 — Frontend UI:**
```bash
cd client
npm start
# App running on http://localhost:3000
```

---

## 🔐 Accounts & Registration

### Creating an Admin
By default, you can register an account from the front-end `/login` workflow. To grant an account **Admin** privileges so you can access the App Designer and Hardware Setting modules, change their role directly in the Database `users` collection to `admin`, OR run a seed file. 

| Role  | Permissions |
|-------|-------------|
| **Admin** | Full system access. Approve newly registered staff, deploy App Designer visual changes, manage system categories, create/delete. |
| **User**  | Perform basic stock adjustments, add consumable/non-consumable items, print barcodes, view maintenance logs. |

---

## 📦 API Map

### Base URL: `/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register a new staff account |
| `/auth/login` | POST | Authenticate and retrieve JWT token |
| `/users` | GET | List system users (Admin only) |
| `/inventory/items` | GET / POST | Fetch or register inventory items |
| `/inventory/items/:id/adjust` | POST | Check-in or Check-out inventory stock |
| `/inventory/stock-logs` | GET | Paginated view of audit records |
| `/inventory/categories` | GET | CRUD system categories |
| `/system/config` | GET / PUT | Fetch or Update App Designer variables |

---

## 🎨 Modifying The App Designer Defaults
By default, the login screen pushes standard Placeholder verses and backgrounds through the `<SystemContext>`. 
If you accidentally lock yourself out of a bad URL configuration inside the settings, you can reset the entire App UI by typing `db.systemconfigs.deleteMany({})` in your MongoDB shell. The application will instantly fall back to its baked-in Vanta aesthetic upon reload.

---

*Built with ♥️ for Modern Asset Tracking.*
