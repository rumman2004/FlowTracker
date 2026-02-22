<div align="center">

# ⚡ FlowTracker

### *Gamified Habit Tracking — Level Up Your Life*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-8B5CF6?style=for-the-badge)](LICENSE)

<br />

![FlowTracker Banner](https://res.cloudinary.com/dtbytfxzs/image/upload/v1771758735/Screenshot_2026-02-22_163937_xyl9qe.png)

<br />

**FlowTracker** is a full-stack gamified habit tracking app.
Build habits, quit bad ones, earn EXP, level up your profile, and
watch your streaks grow — all wrapped in a sleek glass-morphism UI
with full dark / light theme support.

<br />

[🚀 Live Demo](https://flow-tracker-beta.vercel.app/) · [🐛 Report Bug](https://rumman-portfolio-ryuu.vercel.app/contact) · [✨ Request Feature](https://rumman-portfolio-ryuu.vercel.app/contact)

</div>

---

## 📸 Screenshots

<div align="center">

| Home | Habits | Analysis |
|:----:|:------:|:--------:|
| ![Home](https://res.cloudinary.com/dtbytfxzs/image/upload/v1771758735/Screenshot_2026-02-22_163937_xyl9qe.png?text=Home) | ![Habits](https://res.cloudinary.com/dtbytfxzs/image/upload/v1771758735/Screenshot_2026-02-22_164007_vb0c9b.png) | ![Analysis](https://res.cloudinary.com/dtbytfxzs/image/upload/v1771758735/Screenshot_2026-02-22_164016_zhizie.png) |

| Level Up | Profile | Settings |
|:--------:|:-------:|:--------:|
| ![Level](https://res.cloudinary.com/dtbytfxzs/image/upload/v1771758734/Screenshot_2026-02-22_164024_ii5swe.png) | ![Profile](https://res.cloudinary.com/dtbytfxzs/image/upload/v1771758734/Screenshot_2026-02-22_164036_jmwyjl.png) | ![Settings](https://res.cloudinary.com/dtbytfxzs/image/upload/v1771758735/Screenshot_2026-02-22_164046_qxautg.png) |

</div>

---

## ✨ Features

### 🎮 Gamification
- **EXP System** — earn experience points for every completed habit
- **Level Progression** — level up using the formula `EXP = Level × 100`
- **Streak Tracking** — maintain daily streaks with visual fire indicators
- **Milestone Badges** — unlock titles: Beginner → Apprentice → Expert → Master → Legend
- **EXP History Log** — full audit trail of every EXP event

### 📋 Habit Management
- **Build & Quit modes** — track habits you want to build *and* ones you want to quit
- **Custom icons, colours & categories** — fully personalise each habit
- **Adjustable EXP rewards** — set 5–100 EXP per completion via a slider
- **Daily reset** — habits reset automatically at midnight

### 📊 Analytics
- **Weekly completion rate** bar chart
- **Monthly trend** area chart
- **Cumulative EXP growth** line chart
- **Day-by-day breakdown** with colour-coded progress bars
- **Summary stat cards** — avg rate, best day, EXP events

### 🎨 UI / UX
- **Glass-morphism design** with liquid-glass shimmer effects
- **Dark / Light theme toggle** — every surface responds correctly
- **3-D animated auth page** — combined Login + Register with smooth flip
- **Animated EXP popups** — float-up reward feedback on habit completion
- **Responsive layout** — desktop sidebar + mobile bottom navigation
- **Skeleton loaders & empty states** throughout

### 🔐 Auth & Security
- JWT authentication (access + refresh tokens)
- Password hashing with bcrypt
- Protected routes on both frontend and backend
- Change password, delete account flows

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **Recharts** | Area, Bar & Line charts |
| **React Router v6** | Client-side routing |
| **Lucide React** | Icon library |
| **date-fns** | Date formatting |
| **React Hot Toast** | Notifications |
| **Axios** | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM |
| **JSON Web Tokens** | Authentication |
| **bcryptjs** | Password hashing |
| **Multer** | Profile picture uploads |
| **Cloudinary** | Image storage |
| **dotenv** | Environment config |

---

## 📁 Project Structure
```text
FlowTracker/
├── Frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Layout/
│       │   │   ├── Sidebar.jsx        # Desktop nav
│       │   │   └── MobileNav.jsx      # Bottom mobile nav
│       │   └── UI/
│       │       ├── Modal.jsx
│       │       ├── ProgressBar.jsx
│       │       └── StatCard.jsx
│       ├── Context/
│       │   ├── AuthContext.jsx        # Auth state
│       │   └── ThemeContext.jsx       # Dark/light theme
│       ├── hooks/
│       │   └── useHabits.js
│       ├── Pages/
│       │   ├── Auth/
│       │   │   └── Auth.jsx           # Combined login + register
│       │   └── User/
│       │       ├── Home.jsx
│       │       ├── Habits.jsx
│       │       ├── Analysis.jsx
│       │       ├── LevelUp.jsx
│       │       ├── Profile.jsx
│       │       └── Settings.jsx
│       └── Services/
│           ├── api.js                 # Axios instance
│           ├── authservice.js
│           ├── habitservice.js
│           └── userservice.js
│
└── Backend/
├── Controllers/
│   ├── authController.js
│   ├── habitController.js
│   └── userController.js
├── Models/
│   ├── User.js
│   ├── Habit.js
│   └── ExpHistory.js
├── Routes/
│   ├── authRoutes.js
│   ├── habitRoutes.js
│   └── userRoutes.js
├── Middleware/
│   ├── authMiddleware.js
│   └── uploadMiddleware.js
└── server.js
```
---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local or [Atlas](https://mongodb.com/atlas))
- **Cloudinary** account (for profile picture uploads)

---

### 1. Clone the repository

```bash
git clone https://github.com/rumman2004/flowtracker.git
cd flowtracker
```

---

### 2. Backend setup

```bash
cd Backend
npm install
```

Create a `.env` file in `/Backend`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

---

### 3. Frontend setup

```bash
cd ../Frontend
npm install
```

Create a `.env` file in `/Frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new account |
| `POST` | `/api/auth/login` | Login + receive JWT |
| `POST` | `/api/auth/logout` | Invalidate token |
| `POST` | `/api/auth/refresh` | Refresh access token |

### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/habits` | Get all user habits |
| `POST` | `/api/habits` | Create a habit |
| `PUT` | `/api/habits/:id` | Update a habit |
| `DELETE` | `/api/habits/:id` | Delete a habit |
| `PATCH` | `/api/habits/:id/toggle` | Toggle completion + award EXP |
| `GET` | `/api/habits/today` | Today's habits + completion data |

### User / Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/profile` | Get user profile |
| `PUT` | `/api/users/profile` | Update name / avatar |
| `POST` | `/api/users/change-password` | Change password |
| `DELETE` | `/api/users/account` | Delete account |
| `GET` | `/api/users/weekly-progress` | 7-day completion data |
| `GET` | `/api/users/monthly-progress` | 30-day completion data |
| `GET` | `/api/users/exp-history` | EXP event log |
| `PUT` | `/api/users/settings` | Update theme / notifications |

---

## 🎮 How the EXP System Works


Level 1 → 2  requires   100 EXP
Level 2 → 3  requires   200 EXP
Level n → n+1 requires  n × 100 EXP

EXP is earned by:
- ✅ **Completing a habit** — earns the habit's configured EXP reward (5–100)
- 🔥 **Streak multiplier** — consecutive daily completions increase rewards
- ⭐ **Full day bonus** — completing 100% of daily habits awards bonus EXP

Level titles unlock at:

| Level | Title |
|-------|-------|
| 1 | 🌱 Beginner |
| 5 | ⚡ Apprentice |
| 10 | 🔥 Practitioner |
| 20 | 💎 Expert |
| 30 | 👑 Master |
| 50 | 🌟 Legend |

---

## 🌗 Theme System

FlowTracker implements a fully custom theme toggle — **not** relying on
Tailwind's `dark:` class variants for dynamic switching. Every component
reads `isDark` from `ThemeContext` and applies inline style tokens directly,
ensuring instant, flash-free theme transitions across all surfaces including
charts, modals, dropdowns, and navigation.

```jsx
// Usage in any component
const { isDark, toggleTheme } = useTheme();
```

The theme preference is persisted to `localStorage` and synced to the backend
via `updateSettings()` so it survives sessions and devices.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# 1. Fork the repo
# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m "feat: add amazing feature"

# 4. Push and open a PR
git push origin feature/amazing-feature
```

Please follow [Conventional Commits](https://www.conventionalcommits.org) for commit messages.

---

## 📋 Roadmap

- [ ] Social features — friend leaderboards
- [ ] Habit templates library
- [ ] Weekly email digest
- [ ] PWA / offline support
- [ ] Mobile app (React Native)
- [ ] AI habit suggestions
- [ ] Export data as CSV / PDF
- [ ] Calendar heatmap view

---

## 📄 License

Distributed under the **MIT License**.
See [`LICENSE`](LICENSE) for more information.

---

## 👨‍💻 Author

<div align="center">

Made with ❤️ and ☕

**Rumman Ahmed**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rumman2004)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/rummanahmed04)

<br />

⭐ **Star this repo if you found it helpful!** ⭐

</div>
