# 🌿 FoodSave — Waste Food Management & Donation Platform

A full-stack web application connecting food donors with NGOs and communities in need.

## 📁 Project Structure

```
foodsave/
├── backend/
│   ├── config/
│   │   └── database.js       # In-memory database with seed data
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js           # Login, register, profile
│   │   ├── donations.js      # CRUD + claim/complete
│   │   └── users.js          # User data + notifications
│   ├── server.js             # Express app entry point
│   └── package.json
│
└── frontend/
    ├── index.html            # Landing page (homepage)
    ├── css/
    │   └── main.css          # Full design system
    ├── js/
    │   ├── api.js            # API client + utilities
    │   └── main.js           # Homepage JS
    └── pages/
        ├── auth.html         # Login & Registration
        ├── browse.html       # Browse donations with filters
        ├── donate.html       # Post a food donation
        ├── dashboard.html    # User dashboard (donor/recipient/admin)
        ├── impact.html       # Impact statistics dashboard
        └── about.html        # About page + API docs
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
node server.js
# Server starts at http://localhost:5000
```

### Frontend

Open `frontend/index.html` directly in browser, or use a local server:

```bash
# Option 1: Python
cd frontend
python3 -m http.server 3000

# Option 2: VS Code Live Server
# Right-click index.html → Open with Live Server

# Option 3: npx
npx serve frontend
```

Then visit `http://localhost:3000`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Donor | donor@foodsave.com | password |
| Recipient (NGO) | ngo@foodsave.com | password |
| Admin | admin@foodsave.com | password |

---

## 🔌 REST API Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Login (returns JWT) |
| POST | /auth/register | Register new user |
| GET | /auth/me | Get current user |
| PUT | /auth/profile | Update profile |

### Donations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /donations | No | List donations (filterable) |
| GET | /donations/stats | No | Platform statistics |
| GET | /donations/:id | No | Get single donation |
| POST | /donations | Donor | Create donation |
| PUT | /donations/:id | Donor | Update donation |
| DELETE | /donations/:id | Donor | Delete donation |
| POST | /donations/:id/claim | Recipient | Claim donation |
| POST | /donations/:id/complete | Auth | Mark complete |

### Query Filters (GET /donations)
- `?status=available|claimed|completed|expired`
- `?category=cooked|grocery|bakery|fruits|sweets|beverages`
- `?dietType=vegetarian|vegan|non-vegetarian`
- `?city=Jaipur`

### Users
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /users/:id/donations | Auth |
| GET | /users/:id/claimed | Auth |
| GET | /users/notifications/mine | Auth |

---

## ✨ Features

- **Role-based access**: Donors, Recipients (NGOs), Admins
- **Food listing**: Post surplus food with category, quantity, expiry, allergens
- **Real-time browsing**: Filter by status, category, diet type, city
- **Claim system**: First-come-first-served claiming
- **Dashboard**: Manage donations/claims, view history
- **Impact stats**: Live environmental and social impact metrics
- **Notifications**: In-app alerts for donors when food is claimed
- **JWT auth**: Secure token-based authentication
- **Responsive**: Works on mobile, tablet, desktop

---

## 🌱 Tech Stack

**Frontend**: HTML5, CSS3 (CSS Variables, Flexbox, Grid), Vanilla JS
**Backend**: Node.js, Express.js
**Auth**: JWT + bcrypt
**Database**: In-memory (ready for MongoDB/PostgreSQL integration)
**Fonts**: Syne (headings) + DM Sans (body)

---

## 🔄 Upgrade to Production

1. Replace in-memory DB (`config/database.js`) with MongoDB/PostgreSQL
2. Add image upload via Multer + Cloudinary/S3
3. Add WebSocket for real-time notifications
4. Integrate Google Maps API for location services
5. Add email notifications via Nodemailer/SendGrid
6. Deploy backend on Railway/Render, frontend on Vercel/Netlify

---

*Made with 💚 in Jaipur, Rajasthan*
