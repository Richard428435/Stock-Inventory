# 🔥 Sacred Steward System
### Chariot of Fire Faith Assembly

A full-stack church management system with two fully independent modules: **Stock Inventory** and **Church Community**.

---

## 📋 Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 18, Tailwind CSS, React Router v6 |
| Backend     | Node.js, Express                  |
| Database    | MongoDB (Mongoose)                |
| Auth        | JWT + bcryptjs                    |
| Barcodes    | JsBarcode + ZXing (camera scan)   |
| UI Fonts    | Cinzel (display) + Inter (body)   |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ ([download](https://nodejs.org))
- **MongoDB** running locally OR a [MongoDB Atlas](https://www.mongodb.com/atlas) URI

---

### Step 1 — Clone / Extract the project

```bash
cd sacred-steward
```

### Step 2 — Configure environment

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sacred-steward
JWT_SECRET=sacred_steward_jwt_secret_2024
NODE_ENV=development
```

For **MongoDB Atlas**, replace `MONGO_URI` with your connection string:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sacred-steward
```

### Step 3 — Install dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### Step 4 — Seed the database

```bash
cd server
npm run seed
```

This creates:
- ✅ Admin user: `admin@church.com` / `admin123`
- ✅ Default ministries: Youth, Choir, Prayer
- ✅ Default wings: Men's Fellowship, Women's Fellowship, Children Ministry

### Step 5 — Start the servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm start
# App running on http://localhost:3000
```

### Step 6 — Open the app

Visit **http://localhost:3000** and log in with:
- Email: `admin@church.com`
- Password: `admin123`

---

## 🗂️ Project Structure

```
sacred-steward/
├── server/
│   ├── index.js                  # Express entry point
│   ├── .env                      # Environment config
│   ├── config/
│   │   └── seed.js               # DB seed script
│   ├── middleware/
│   │   └── auth.js               # JWT + role middleware
│   ├── models/
│   │   ├── User.js               # Admin / User accounts
│   │   ├── Item.js               # Inventory items
│   │   ├── StockLog.js           # Stock adjustment logs
│   │   ├── MaintenanceLog.js     # Equipment maintenance
│   │   ├── Family.js             # Families + embedded members
│   │   └── MinistryWing.js       # Ministries & Wings
│   └── routes/
│       ├── auth.js               # POST /login, GET /me
│       ├── users.js              # Admin: CRUD users
│       ├── inventory/
│       │   ├── items.js          # CRUD + stock adjust + stats
│       │   ├── stockLogs.js      # Paginated log history
│       │   └── maintenance.js    # Maintenance CRUD
│       └── community/
│           ├── families.js       # Family CRUD
│           ├── ministries.js     # Ministry CRUD + members
│           ├── wings.js          # Wing CRUD + members
│           └── reports.js        # Aggregated community stats
│
└── client/src/
    ├── App.js                    # Route definitions
    ├── context/AuthContext.js    # JWT auth state
    ├── utils/api.js              # Axios instance
    ├── index.css                 # Tailwind + design system
    └── pages/
        ├── auth/LoginPage.js
        ├── ModuleSelectPage.js
        ├── admin/UsersPage.js
        ├── inventory/
        │   ├── InventoryLayout.js
        │   ├── InventoryDashboard.js
        │   ├── ItemsPage.js       # CRUD + barcode + stock adjust
        │   ├── StockLogsPage.js
        │   ├── MaintenancePage.js
        │   └── BarcodePage.js    # Generate + camera scan
        └── community/
            ├── CommunityLayout.js
            ├── CommunityDashboard.js
            ├── FamiliesPage.js
            ├── FamilyFormPage.js  # 2-section form w/ dynamic members
            ├── MinistriesPage.js
            ├── WingsPage.js
            └── ReportsPage.js    # Charts + statistics
```

---

## 🔐 Authentication & Roles

| Role  | Permissions |
|-------|-------------|
| Admin | Everything: create users, delete records, manage ministries/wings |
| User  | Data entry: add/edit families, items, adjustments — no user management or delete |

---

## 📦 Module 1: Stock Inventory

### Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory/items/stats` | Dashboard statistics |
| GET | `/api/inventory/items` | List items (filter by category/search) |
| GET | `/api/inventory/items/barcode/:code` | Fetch by barcode |
| POST | `/api/inventory/items` | Create item |
| PUT | `/api/inventory/items/:id` | Update item |
| DELETE | `/api/inventory/items/:id` | Delete item |
| POST | `/api/inventory/items/:id/adjust` | Stock adjustment |
| GET | `/api/inventory/stock-logs` | Paginated logs |
| GET/POST/PUT/DELETE | `/api/inventory/maintenance` | Maintenance records |

### Item Categories
- **Consumable** — Items that get used up (paper, pens, water)
- **Non-Consumable** — Durable items (chairs, projectors)
- **Media** — Equipment for media team (cameras, microphones, mixers)

### Stock Adjustment Reasons
`Purchase` | `Usage` | `Damage` | `Transfer` | `Adjustment`

---

## ⛪ Module 2: Church Community

### Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/community/families` | List families |
| GET | `/api/community/families/:id` | Single family + members |
| POST | `/api/community/families` | Register family |
| PUT | `/api/community/families/:id` | Update family |
| DELETE | `/api/community/families/:id` | Delete family |
| GET/POST/PUT/DELETE | `/api/community/ministries` | Ministry CRUD |
| GET | `/api/community/ministries/:id/members` | Members of a ministry |
| GET/POST/PUT/DELETE | `/api/community/wings` | Wing CRUD |
| GET | `/api/community/wings/:id/members` | Members of a wing |
| GET | `/api/community/reports` | Full community stats |

### Family Form — 2 Sections
**Section 1:** Family ID (auto), Head Name, Address, Area, Zone, Phone, Registration Date

**Section 2:** Dynamic member rows with:
Name | Relationship | Gender | DOB | Age (auto) | Marital Status | Baptism | Occupation | Phone | Remarks

Each member can also be assigned to multiple Ministries and Wings directly from the form.

---

## 📊 Database Collections

| Collection | Purpose |
|------------|---------|
| `users` | System accounts (admin/user) |
| `items` | Inventory items with SKU & barcode |
| `stocklogs` | Immutable adjustment history |
| `maintenancelogs` | Equipment service records |
| `families` | Family master with embedded members array |
| `ministries` | Ministry groups |
| `wings` | Wing groups |

---

## 🎨 UI Design System

The app uses a **dark church aesthetic** with:
- **Colors:** Deep purple (`#0f0a1e`) background, primary purple accents, gold highlights
- **Typography:** Cinzel (display/titles) + Inter (body)
- **CSS classes:** `.card`, `.btn-primary`, `.btn-gold`, `.input`, `.label`, `.badge`, `.table-header`, `.table-cell`, `.modal`, `.sidebar-link`

---

## 🔧 Common Issues

**MongoDB connection error:**
- Make sure MongoDB is running: `mongod` (or use MongoDB Atlas)
- Check `MONGO_URI` in `server/.env`

**Port already in use:**
- Change `PORT` in `server/.env`
- React uses port 3000 by default

**Barcode camera not working:**
- Camera access requires HTTPS in production
- In development on localhost, it works over HTTP
- Make sure to allow camera permissions in your browser

**npm install errors:**
- Make sure Node.js v18+ is installed: `node --version`
- Try deleting `node_modules` and re-running `npm install`

---

## 📝 Default Credentials

```
Email:    admin@church.com
Password: admin123
```

> ⚠️ Change these immediately in production!

---

*Built for Chariot of Fire Faith Assembly — Sacred Steward System v1.0*
