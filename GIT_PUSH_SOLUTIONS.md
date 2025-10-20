# Git Push Solutions for VAMANO Project

## Problem
```
error: pack-objects died of signal 10
fatal: the remote end hung up unexpectedly
```

## Quick Solutions (Try in Order)

### Solution 1: Increase Git Buffer (FASTEST)
```bash
cd /Users/christophercialone/Desktop/VAMANO_PROJECT/vamano

# Increase buffer to 500MB
git config http.postBuffer 524288000

# Try push
git push origin feature/server-fixes-and-wallet-adapter
```

### Solution 2: Check for Large Files
```bash
# Find large files
git ls-files -z | xargs -0 du -h | sort -rh | head -20

# If you see node_modules or .next directories, they shouldn't be tracked
# Remove them from git (they're in .gitignore)
git rm -r --cached node_modules frontend/.next backend/dist programs/vamano-program/target 2>/dev/null
git commit -m "chore: remove build artifacts from git tracking"
git push origin feature/server-fixes-and-wallet-adapter
```

### Solution 3: Create Clean Branch (RECOMMENDED)
```bash
# Checkout main
git checkout main
git pull origin main

# Create new clean branch
git checkout -b feature/vamano-mvp-v2

# Squash all changes into one commit
git merge --squash feature/server-fixes-and-wallet-adapter

# Commit with comprehensive message
git commit -m "feat: complete VAMANO MVP shell (pnpm, wallet, TypeScript, E2E tests)

- Migrate from Yarn PnP to pnpm v9.12.0
- Fix wallet adapter peer dependency conflicts  
- Implement full TypeScript backend with UMI
- Add frontend-backend API integration
- Create 15 comprehensive E2E tests
- Prepare Anchor programs for deployment

Resolves: wallet 500 errors, TypeScript execution issues
Blocked: Anchor deployment (Solana SDK Rust version)"

# Push new branch (smaller commit history)
git push origin feature/vamano-mvp-v2
```

### Solution 4: Use SSH Instead of HTTPS
```bash
# Check current remote
git remote -v

# If using HTTPS, switch to SSH
git remote set-url origin git@github.com:christopher-cialone/VAMANO_PROJECT.git

# Try push
git push origin feature/server-fixes-and-wallet-adapter
```

### Solution 5: Push in Smaller Batches
```bash
# Push commits one at a time
git log --oneline -5  # See recent commits

# Push up to a specific commit
git push origin <commit-hash>:feature/server-fixes-and-wallet-adapter

# Then push the rest
git push origin feature/server-fixes-and-wallet-adapter
```

## If All Else Fails

### Manual Backup & Fresh Push
```bash
# 1. Create backup
cp -r /Users/christophercialone/Desktop/VAMANO_PROJECT/vamano /Users/christophercialone/Desktop/VAMANO_BACKUP

# 2. Clone fresh repo
cd /Users/christophercialone/Desktop
git clone https://github.com/christopher-cialone/VAMANO_PROJECT.git VAMANO_FRESH

# 3. Copy your changes (excluding git history)
rsync -av --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='dist' --exclude='target' \
  /Users/christophercialone/Desktop/VAMANO_PROJECT/vamano/ \
  /Users/christophercialone/Desktop/VAMANO_FRESH/vamano/

# 4. Commit and push from fresh repo
cd /Users/christophercialone/Desktop/VAMANO_FRESH/vamano
git add -A
git commit -m "feat: complete VAMANO MVP shell"
git push origin main
```

## Recommended Approach

**Use Solution 3 (Create Clean Branch)** - This is the safest and most reliable:

1. Creates a new branch with squashed commits
2. Smaller git history = easier to push
3. Clean commit message
4. Can always go back to original branch if needed

```bash
cd /Users/christophercialone/Desktop/VAMANO_PROJECT/vamano
git checkout main
git pull origin main
git checkout -b feature/vamano-mvp-v2
git merge --squash feature/server-fixes-and-wallet-adapter
git commit -m "feat: complete VAMANO MVP shell

Full-stack integration with wallet adapter, TypeScript backend, and E2E tests"
git push origin feature/vamano-mvp-v2
```

Then create a Pull Request on GitHub from `feature/vamano-mvp-v2` to `main`.



