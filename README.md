# NØDE Performance App

Elite performance training platform with structured workouts, AI-generated sessions, and comprehensive tracking.

## 🎯 Features

- **Structured Workouts**: Follow programs with EMOM, AMRAP, and timed sections
- **Full-Screen Workout Player**: Cinematic, distraction-free training experience
- **Real-Time Timers**: EMOM and countdown timers with voice cues
- **Tier System**: Silver, Gold, and Black tiers for progressive difficulty
- **Session Tracking**: Log workouts with RPE, notes, and performance metrics
- **AI Workout Generation**: Create custom workouts based on your goals and equipment
- **Program Scheduling**: Start programs and track your weekly schedule

## 🛠 Tech Stack

- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend**: Next.js 16 + TypeScript + React 19 + Tailwind CSS v4
- **AI**: OpenAI GPT-4 Turbo
- **Auth**: JWT with Passport
- **Database**: PostgreSQL with Prisma ORM

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)
- OpenAI API key (for AI workout generation)

### Installation

1. **Clone and install root dependencies:**
```bash
npm install
```

2. **Setup backend:**
```bash
cd backend
npm install

# Create .env file (copy from .env.example if it exists)
# Add your DATABASE_URL, JWT_SECRET, and OPENAI_API_KEY

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with Villa Zeno Hybrid program
npm run prisma:seed
```

3. **Setup frontend:**
```bash
cd frontend
npm install

# Create .env.local file
# Add: NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. **Run development servers:**
```bash
# From root directory - runs both backend and frontend
npm run dev
```

This will start:
- **Backend** on http://localhost:3001
- **Frontend** on http://localhost:3000

## 📁 Project Structure

```
NODE/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed data (Villa Zeno Hybrid)
│   ├── src/
│   │   ├── ai/                # AI workout generation
│   │   ├── auth/               # Authentication (JWT)
│   │   ├── users/              # User management
│   │   ├── programs/           # Program CRUD
│   │   ├── workouts/           # Workout CRUD
│   │   └── sessions/           # Session logging & user programs
│   └── package.json
├── frontend/
│   ├── app/                    # Next.js app router pages
│   │   ├── auth/               # Login/Register
│   │   ├── programs/           # Programs list & detail
│   │   ├── workouts/           # Workout player
│   │   └── page.tsx            # Dashboard
│   ├── components/
│   │   ├── workout/            # Section components (Warmup, EMOM, AMRAP, etc.)
│   │   └── timers/             # Timer components
│   ├── hooks/                  # Custom React hooks (useVoice, useEmomTimer)
│   ├── lib/                    # API client
│   └── contexts/               # Auth context
└── README.md
```

## 🎨 Design System

### Color Palette

- **NØDE Volt**: `#ccff00` - Primary accent for key data points
- **Deep Asphalt**: `#121212` - Page background
- **Concrete Grey**: `#1e1e1e` - Card and container backgrounds
- **Tech Grey**: `#252525` - UI elements and stat boxes
- **Text White**: `#ffffff` - Primary headings
- **Muted Text**: `#b0b0b0` - Body copy

### Typography

- **Headlines**: Space Grotesk (Bold 700 / Medium 500)
- **Body**: Manrope (Light 300 / Regular 400)

### Design Principles

- **Dark Mode Only**: Built for dark backgrounds
- **Volt Rule**: Use accent color sparingly (5-10% coverage max)
- **Industrial Borders**: Thin 1px borders in dark grey
- **Generous Whitespace**: Let content breathe

## 📊 Data Model

The app uses a comprehensive Prisma schema with:

- **Users & Profiles**: Training level, goals, equipment, preferences
- **Programs**: Multi-week training programs
- **Workouts**: Structured sessions with sections
- **Workout Sections**: WARMUP, EMOM, AMRAP, FOR_TIME, FINISHER, COOLDOWN
- **Exercise Blocks**: Individual exercises with tier prescriptions
- **Tier Prescriptions**: Silver, Gold, Black difficulty levels
- **Session Logs**: Performance tracking with RPE and metrics
- **User Programs**: Active program enrollment and scheduling

## 🔌 API Endpoints

### Auth
- `POST /auth/register` - Create account
- `POST /auth/login` - Login

### Programs
- `GET /programs` - List all public programs
- `GET /programs/:slug` - Get program details

### Workouts
- `GET /workouts/:id` - Get workout with full structure

### User
- `GET /me` - Get current user
- `PUT /me/profile` - Update user profile
- `POST /me/programs` - Start a program
- `GET /me/programs/active` - Get active program
- `GET /me/programs/schedule` - Get schedule

### Sessions
- `POST /me/sessions` - Start a session
- `PUT /me/sessions/:id/complete` - Complete session
- `GET /me/sessions/recent` - Get recent sessions

### AI
- `POST /ai/generate-workout` - Generate custom workout

## 🎯 Workout Player Features

- **Full-screen experience** with section navigation
- **EMOM Timer**: Work/rest intervals with station highlighting
- **Countdown Timer**: For AMRAP and timed sections
- **Voice Cues**: Audio feedback for phase changes and countdowns
- **Tier Display**: Visual tier badges and load prescriptions
- **Session Completion**: RPE rating and notes

## 🧪 Seed Data

The database is seeded with the **Villa Zeno Hybrid** program:

- **Program**: 8-week hybrid training program
- **Workout VZ-001**: Complete workout with:
  - Warm-up section
  - EMOM section (12 rounds, 4 stations)
  - AMRAP section (12 minutes, 3 exercises)
  - Finisher (Farmer's Walk)
  - Cooldown

## 🚧 Future Enhancements

- [ ] Email/push notifications for scheduled sessions
- [ ] Advanced analytics and progress tracking
- [ ] Social features (share workouts, leaderboards)
- [ ] Mobile app (React Native)
- [ ] Video exercise demonstrations
- [ ] Custom program builder UI

## 📝 License

Private - All rights reserved

