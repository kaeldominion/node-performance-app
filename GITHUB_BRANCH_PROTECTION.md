# GitHub Branch Protection & PR Strategy

## Current Situation

You have:
- ✅ `main` branch (production)
- ✅ `beta` branch (v2 development) - recently pushed
- ⚠️ Main branch is not protected

## Recommendation 1: Protect Main Branch ✅ **DO THIS**

### Why Protect Main Branch?

**Protecting `main` prevents:**
- Accidental force pushes that could destroy production code
- Direct commits to main (forces code review via PRs)
- Deletion of the main branch
- Merging broken code without checks

**This is CRITICAL for production!**

### How to Protect Main Branch

1. Click **"Protect this branch"** button on the blue banner
2. Configure protection rules:

#### Recommended Settings:

**Basic Settings:**
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1` (or more)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (if you have CODEOWNERS file)

- ✅ **Require status checks to pass before merging**
  - This ensures tests/builds pass before merging

- ✅ **Require conversation resolution before merging**
  - Ensures all PR comments are addressed

- ✅ **Require linear history**
  - Keeps git history clean (no merge commits)

**Advanced Settings:**
- ✅ **Do not allow bypassing the above settings**
  - Even admins must follow rules

- ✅ **Do not allow force pushes**
  - Prevents destructive operations

- ✅ **Do not allow deletions**
  - Prevents accidental branch deletion

- ✅ **Restrict who can push to matching branches**
  - Only allow specific people/teams

### What This Means

After protecting `main`:
- ✅ You **cannot** directly push to `main`
- ✅ You **must** create a Pull Request from another branch
- ✅ PR must be **approved** before merging
- ✅ All **status checks** must pass
- ✅ This keeps production safe!

---

## Recommendation 2: "Compare & Pull Request" from Beta ❌ **DON'T DO THIS YET**

### Why NOT Create PR from Beta to Main Now?

**Beta is for v2 development** - it's not ready for production yet!

Creating a PR now would:
- ❌ Merge incomplete v2 work into production
- ❌ Break production with experimental code
- ❌ Mix beta development with production

### When SHOULD You Create PR from Beta?

**Only when:**
- ✅ Beta/v2 is fully tested and ready
- ✅ You've completed the new architecture
- ✅ You're ready to replace production with v2
- ✅ You've tested everything thoroughly

### The Right Workflow

```
1. Develop on beta branch
   └── Push to beta → Deploys to beta.nodeos.app

2. Test thoroughly on beta

3. When ready, create PR: beta → main
   └── Review, approve, merge

4. Merge triggers production deployment
   └── Deploys to nodeos.app
```

---

## Recommended Branch Strategy

### For Now (Development Phase)

```
main branch (protected)
  └── Production code (stable)
  
beta branch (unprotected, for now)
  └── V2 development (experimental)
  └── Push freely, test on beta.nodeos.app
```

### When Beta is Ready

```
1. Create PR: beta → main
2. Review code
3. Get approval
4. Merge to main
5. Main auto-deploys to production
```

---

## Action Items

### ✅ Do This Now:

1. **Protect Main Branch**
   - Click "Protect this branch"
   - Enable: Require PR, Require approvals, No force push
   - This protects production immediately

2. **Dismiss the "Compare & Pull Request" Banner**
   - Click "Dismiss" on the yellow banner
   - Or just ignore it - you're not ready to merge beta yet

### ⏸️ Do This Later:

1. **When Beta is Ready**
   - Create PR from beta → main
   - Get code review
   - Merge when approved

2. **Optional: Protect Beta Branch Too**
   - Less critical than main
   - But can prevent accidental force pushes
   - Can require PRs for beta → main merges

---

## Branch Protection Settings Summary

### Main Branch (Production) - STRICT

```
✅ Require pull request reviews (1 approval)
✅ Require status checks to pass
✅ Require linear history
✅ Do not allow force pushes
✅ Do not allow deletions
✅ Do not allow bypassing (even for admins)
```

### Beta Branch (Development) - RELAXED

```
⚠️ Optional: Require pull request reviews (for beta → main PRs)
⚠️ Optional: Do not allow force pushes
❌ Don't require status checks (faster iteration)
❌ Allow deletions (you might recreate it)
```

---

## Common Workflows

### Daily Development on Beta

```bash
# Work on beta branch
git checkout beta
# Make changes
git add .
git commit -m "feat: new AI architecture"
git push origin beta
# → Auto-deploys to beta.nodeos.app
```

### Merging Beta to Main (When Ready)

```bash
# 1. Ensure beta is ready
# 2. Create PR on GitHub: beta → main
# 3. Get code review
# 4. Merge PR
# → Auto-deploys to nodeos.app
```

### Hotfix on Production (If Needed)

```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/fix-critical-bug
# 2. Fix the issue
git add .
git commit -m "fix: critical bug"
git push origin hotfix/fix-critical-bug
# 3. Create PR: hotfix → main
# 4. Merge quickly
# → Production fixed
```

---

## Summary

### ✅ Protect Main Branch
- **Click "Protect this branch"** - This is critical for production safety
- Configure strict rules (require PRs, approvals, no force push)

### ❌ Don't Create PR from Beta Yet
- **Dismiss or ignore** the "Compare & pull request" banner
- Beta is for development - not ready for production
- Create PR only when v2 is complete and tested

### 🔄 Workflow
- Develop freely on `beta` branch
- Test on `beta.nodeos.app`
- When ready, create PR: `beta → main`
- Merge after review and approval

---

## Questions?

**Q: Can I still push to main after protecting it?**
A: No, you'll need to create a PR from another branch. This is by design - it protects production.

**Q: What if I need to hotfix production urgently?**
A: Create a hotfix branch from main, fix it, create PR, get quick approval, merge.

**Q: Should I protect beta branch too?**
A: Optional. Main is more critical. Beta can be more relaxed for faster iteration.

**Q: Can I bypass protection if I'm admin?**
A: Only if you didn't enable "Do not allow bypassing" - but you should enable it for safety.

