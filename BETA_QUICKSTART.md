# Beta Quick Start

Get started with beta development in 3 steps:

## 1. Set Up Environment Files

```bash
# Backend
cd backend
cp .env.beta.example .env.beta
# Edit .env.beta with your API keys

# Frontend  
cd ../frontend
cp .env.local.beta.example .env.local.beta
# Edit .env.local.beta with your API keys
```

## 2. Start Beta Database

```bash
# From project root
npm run beta:db:up
```

## 3. Initialize Database Schema

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Optional
```

## 4. Start Development Servers

```bash
# From project root
npm run beta:start
```

**That's it!** Beta will be running at:
- Frontend: http://localhost:3001
- Backend: http://localhost:4001

## Quick Commands

```bash
# Start beta environment
npm run beta:start

# Start/stop beta database
npm run beta:db:up
npm run beta:db:down

# View beta database logs
npm run beta:db:logs

# Run backend only (beta)
npm run beta:backend

# Run frontend only (beta)
npm run beta:frontend
```

## Switching Between Production and Beta

**Production (ports 3000, 4000):**
```bash
git checkout main
npm run dev:start
```

**Beta (ports 3001, 4001):**
```bash
git checkout beta
npm run beta:start
```

See [BETA_SETUP.md](./BETA_SETUP.md) for complete documentation.

