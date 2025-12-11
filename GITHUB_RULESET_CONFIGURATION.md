# GitHub Branch Protection Ruleset Configuration

## Recommended Settings for Main Branch (Production)

### 1. Ruleset Name
```
Name: "Protect Main Branch (Production)"
```
Or simply: `main-branch-protection`

### 2. Enforcement Status
**Change from "Disabled" to:**
- ✅ **"Active"** - Rules will be enforced

### 3. Bypass List
**Recommendation: Leave Empty** (or add only specific admin roles if needed)

- Empty bypass list = **Everyone** must follow the rules (safest)
- Only add bypasses if you have a specific need (e.g., deployment bots)

### 4. Target Branches
**Click "Add target" and configure:**
- **Branch name pattern**: `main`
- This applies the ruleset only to the `main` branch

### 5. Rules - Recommended Configuration

#### ✅ **MUST ENABLE (Critical for Production):**

1. **✅ Block force pushes** (Already checked - KEEP THIS)
   - Prevents destructive force pushes to production

2. **✅ Restrict deletions** (Already checked - KEEP THIS)
   - Prevents accidental branch deletion

3. **✅ Require a pull request before merging**
   - **Settings when enabled:**
     - ✅ Require approvals: `1` (or more)
     - ✅ Dismiss stale pull request approvals when new commits are pushed
     - ✅ Require review from Code Owners (if you have CODEOWNERS file)

#### ⚠️ **RECOMMENDED (Good Practices):**

4. **✅ Require linear history**
   - Keeps git history clean
   - Prevents messy merge commits
   - Makes debugging easier

5. **✅ Require status checks to pass**
   - **When enabled, configure:**
     - Add status checks (e.g., "build", "test", "lint")
     - Only add if you have CI/CD set up
   - **If you don't have CI/CD yet**: Leave unchecked for now

6. **✅ Restrict updates**
   - Prevents direct pushes to main
   - Forces all changes through PRs
   - Works with "Require pull request" rule

#### ❌ **OPTIONAL (Can Skip for Now):**

7. **Restrict creations** - Not needed (only affects branch creation)

8. **Require deployments to succeed** - Only if using GitHub Environments

9. **Require signed commits** - Advanced security (optional)

10. **Require code scanning results** - Only if using GitHub Code Scanning

---

## Step-by-Step Configuration

### Step 1: Basic Setup
```
Ruleset Name: "Protect Main Branch"
Enforcement: Active (change from Disabled)
```

### Step 2: Target Branches
```
Click "Add target"
Select: "Branch name pattern"
Enter: main
```

### Step 3: Enable Critical Rules
```
✅ Block force pushes (already checked)
✅ Restrict deletions (already checked)
✅ Require a pull request before merging
   → When enabled, set:
      - Require approvals: 1
      - Dismiss stale approvals: Yes
✅ Restrict updates
✅ Require linear history
```

### Step 4: Optional Rules (If You Have CI/CD)
```
✅ Require status checks to pass
   → Add your status checks (build, test, etc.)
```

### Step 5: Bypass List
```
Leave empty (or add specific admin roles if needed)
```

### Step 6: Save
```
Click "Create ruleset" or "Save"
```

---

## What Each Rule Does

### Block Force Pushes ✅
- **What it does**: Prevents `git push --force` to main
- **Why important**: Force pushes can overwrite history and lose commits
- **Impact**: If you need to fix something, you must use PRs

### Restrict Deletions ✅
- **What it does**: Prevents deleting the main branch
- **Why important**: Accidental deletion would be catastrophic
- **Impact**: Main branch cannot be deleted

### Require Pull Request Before Merging ✅
- **What it does**: Forces all changes through PRs
- **Why important**: Enables code review before production
- **Impact**: Cannot directly push to main; must create PR

### Restrict Updates ✅
- **What it does**: Prevents direct pushes to main
- **Why important**: Ensures all changes go through PR process
- **Impact**: Works with PR requirement rule

### Require Linear History ✅
- **What it does**: Prevents merge commits (keeps history linear)
- **Why important**: Cleaner git history, easier to read
- **Impact**: Must use "Rebase and merge" or "Squash and merge" in PRs

### Require Status Checks ✅
- **What it does**: Blocks merge if CI/CD checks fail
- **Why important**: Ensures code quality before production
- **Impact**: PRs cannot merge if tests/builds fail
- **Note**: Only enable if you have CI/CD set up

---

## Recommended Final Configuration

### Ruleset Summary:
```
Name: Protect Main Branch
Enforcement: Active
Target: main branch
Bypass: None (empty)

Rules Enabled:
✅ Block force pushes
✅ Restrict deletions
✅ Require pull request before merging
   - Require 1 approval
   - Dismiss stale approvals
✅ Restrict updates
✅ Require linear history
⚠️ Require status checks (only if you have CI/CD)
```

---

## After Configuration

### What Changes:

**Before Protection:**
```bash
git checkout main
git push origin main  # ✅ Works
```

**After Protection:**
```bash
git checkout main
git push origin main  # ❌ BLOCKED - Must use PR
```

**New Workflow:**
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
git add .
git commit -m "feat: new feature"

# 3. Push to branch
git push origin feature/new-feature

# 4. Create PR on GitHub: feature/new-feature → main

# 5. Get approval

# 6. Merge PR
# → Now changes go to main
```

---

## Testing the Ruleset

After creating the ruleset:

1. **Try to push directly to main:**
   ```bash
   git checkout main
   git commit --allow-empty -m "test"
   git push origin main
   ```
   Should be **BLOCKED** ✅

2. **Try to force push:**
   ```bash
   git push --force origin main
   ```
   Should be **BLOCKED** ✅

3. **Try to delete branch:**
   - Go to GitHub → Settings → Branches
   - Try to delete main
   - Should be **BLOCKED** ✅

---

## Troubleshooting

### "I need to hotfix production urgently!"

**Solution**: Create a hotfix branch and PR:
```bash
git checkout main
git checkout -b hotfix/critical-fix
# Fix the issue
git push origin hotfix/critical-fix
# Create PR, get quick approval, merge
```

### "I accidentally committed to main locally"

**Solution**: Create a branch from your local main, then reset:
```bash
git checkout -b fix/my-changes
git checkout main
git reset --hard origin/main  # Reset to remote
git checkout fix/my-changes
# Continue working on fix branch
```

### "I need to bypass for emergency"

**Solution**: 
- If you have bypass permissions, you can temporarily bypass
- But it's better to use the hotfix workflow above
- Consider if the "emergency" is really that urgent

---

## Summary

### ✅ Enable These:
1. **Block force pushes** ✅
2. **Restrict deletions** ✅
3. **Require pull request before merging** ✅ (with 1 approval)
4. **Restrict updates** ✅
5. **Require linear history** ✅

### ⚠️ Enable If You Have:
- **Require status checks** (only if CI/CD is set up)

### ❌ Skip These (For Now):
- Restrict creations
- Require deployments
- Require signed commits
- Require code scanning

### Configuration:
- **Name**: "Protect Main Branch"
- **Enforcement**: Active
- **Target**: `main` branch
- **Bypass**: Empty (or specific admins only)

---

This configuration will protect your production branch while still allowing flexible development on other branches like `beta`.

