# How Vercel Knows Beta from Production

## The Key: Two Separate Projects, Same Repo

You create **TWO separate Vercel projects**, both connected to the **SAME GitHub repository**, but each watches a **different branch**.

## Visual Explanation

```
GitHub Repository: kaeldominion/node-performance-app
├── main branch (production code)
└── beta branch (beta/v2 code)

Vercel Dashboard:
├── Project 1: "node-performance-app" (Production)
│   └── Production Branch: main
│   └── Auto-deploys when: push to main branch
│   └── URL: nodeos.app
│
└── Project 2: "node-performance-app-beta" (Beta)
    └── Production Branch: beta
    └── Auto-deploys when: push to beta branch
    └── URL: beta.nodeos.app
```

## How It Works

### Step 1: Create Production Project

1. Go to Vercel → "Add New Project"
2. Connect to: `kaeldominion/node-performance-app`
3. **In Project Settings → Git**:
   - Set **Production Branch**: `main` ← This tells Vercel to watch the `main` branch
4. Save

**Result**: This project will ONLY deploy when you push to the `main` branch.

### Step 2: Create Beta Project (Separate Project!)

1. Go to Vercel → "Add New Project" again (create a NEW project)
2. Connect to: `kaeldominion/node-performance-app` (same repo!)
3. **In Project Settings → Git**:
   - Set **Production Branch**: `beta` ← This tells Vercel to watch the `beta` branch
4. Save

**Result**: This project will ONLY deploy when you push to the `beta` branch.

## The Magic: Production Branch Setting

The **"Production Branch"** setting in each Vercel project is what tells Vercel which branch to watch:

- **Production Project**: Production Branch = `main` → Watches `main` branch
- **Beta Project**: Production Branch = `beta` → Watches `beta` branch

## What Happens When You Push

### Push to `main` branch:
```
git push origin main
```
- ✅ Production Vercel project detects the push
- ✅ Production project auto-deploys
- ❌ Beta project does NOT deploy (it's watching `beta` branch)

### Push to `beta` branch:
```
git push origin beta
```
- ❌ Production project does NOT deploy (it's watching `main` branch)
- ✅ Beta Vercel project detects the push
- ✅ Beta project auto-deploys

## Step-by-Step Setup

### 1. Create Production Project

```
Vercel Dashboard
  → Add New Project
  → Import: kaeldominion/node-performance-app
  → Project Name: "node-performance-app"
  → Settings → Git → Production Branch: main
  → Deploy
```

### 2. Create Beta Project (Separate!)

```
Vercel Dashboard
  → Add New Project (NEW PROJECT!)
  → Import: kaeldominion/node-performance-app (same repo)
  → Project Name: "node-performance-app-beta"
  → Settings → Git → Production Branch: beta ← KEY DIFFERENCE!
  → Deploy
```

## Important Settings Comparison

| Setting | Production Project | Beta Project |
|---------|-------------------|--------------|
| **Project Name** | `node-performance-app` | `node-performance-app-beta` |
| **GitHub Repo** | `kaeldominion/node-performance-app` | `kaeldominion/node-performance-app` (same!) |
| **Root Directory** | `frontend` | `frontend` |
| **Production Branch** | `main` ⚠️ | `beta` ⚠️ |
| **Custom Domain** | `nodeos.app` | `beta.nodeos.app` |

## Verification

### Check Production Project Settings:
1. Go to Vercel Dashboard
2. Click on "node-performance-app" project
3. Go to **Settings** → **Git**
4. Verify: **Production Branch** = `main`

### Check Beta Project Settings:
1. Go to Vercel Dashboard
2. Click on "node-performance-app-beta" project
3. Go to **Settings** → **Git**
4. Verify: **Production Branch** = `beta`

## Common Mistakes

### ❌ Wrong: One Project, Two Branches
- Creating one Vercel project and trying to deploy both branches
- Vercel doesn't work this way - you need separate projects

### ✅ Correct: Two Projects, Different Branch Settings
- Two separate Vercel projects
- Each project watches a different branch via "Production Branch" setting

### ❌ Wrong: Beta Project Watching `main`
- If beta project's Production Branch is set to `main`, it will deploy production code
- Always verify the Production Branch setting!

## Testing

### Test Production Deployment:
```bash
git checkout main
# Make a small change
git add .
git commit -m "test: production deployment"
git push origin main
```
→ Check Vercel Dashboard → Production project should deploy

### Test Beta Deployment:
```bash
git checkout beta
# Make a small change
git add .
git commit -m "test: beta deployment"
git push origin beta
```
→ Check Vercel Dashboard → Beta project should deploy

## Summary

**How Vercel knows beta from production:**
1. You create **TWO separate Vercel projects**
2. Both connect to the **SAME GitHub repository**
3. Each project has a **different "Production Branch" setting**:
   - Production: `main`
   - Beta: `beta`
4. Vercel watches the branch specified in each project's settings
5. When you push to a branch, only the project watching that branch deploys

The "Production Branch" setting is the key - it tells each project which branch to watch and deploy from!

