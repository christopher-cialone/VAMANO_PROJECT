# Anchor Build Status & Resolution Plan

**Date**: October 15, 2025  
**Status**: 🟡 IN PROGRESS - Rust Toolchain Conflict  
**Issue**: Anchor 0.30.1 Build Failure Due to Rust Version Mismatch

---

## 🚨 Current Blocker

### Problem
The Anchor program cannot build due to a Rust version incompatibility:
- **Required**: Rust 1.76+ (for dependencies like `toml_edit`, `toml_datetime`)
- **Available**: Rust 1.75.0-dev (from Solana BPF toolchain)
- **System Rust**: 1.90.0 stable, 1.91.0 nightly

### Error Message
```
error: package `toml_edit v0.23.7` cannot be built because it requires 
rustc 1.76 or newer, while the currently active rustc version is 1.75.0-dev
```

### Root Cause
Anchor's `cargo-build-sbf` uses an embedded Rust toolchain (1.75.0-dev) that's older than what the dependencies require. This is a known issue with Anchor 0.30.1 and Cargo.lock v4.

---

## 🔧 Attempted Solutions

### 1. ✅ Rust Toolchain Updates
```bash
rustup update stable  # Now at 1.90.0
rustup default nightly  # Now at 1.91.0
```

### 2. ✅ Cargo.lock Version Conversion
```bash
sed -i '' 's/version = 4/version = 3/' Cargo.lock
```
**Result**: Converts Cargo.lock to v3, but doesn't solve Rust version issue.

### 3. ❌ Dependency Downgrades
```bash
cargo update toml_edit@0.23.7 --precise 0.19.15
```
**Result**: Creates dependency conflicts with `proc-macro-crate` which requires toml_edit ^0.23.2.

### 4. ❌ Anchor Toolchain Override
```toml
[toolchain]
channel = "stable"
```
**Result**: Anchor still uses embedded BPF toolchain.

### 5. ❌ Direct cargo-build-sbf
```bash
cargo build-sbf
```
**Result**: Same Rust 1.75 issue, as it's embedded in the BPF SDK.

---

## ✅ Recommended Solutions (Choose One)

### Option 1: Upgrade to Anchor 0.32.0 (RECOMMENDED)
**Reason**: Anchor 0.32.0 includes full Cargo.lock v4 support and updated BPF toolchain.

```bash
cd /Users/christophercialone/Desktop/VAMANO_PROJECT/vamano/programs/vamano-program

# Install Anchor 0.32.0
avm install 0.32.0
avm use 0.32.0

# Update dependencies in Cargo.toml
# Change: anchor-lang = "0.30.1" → anchor-lang = "0.32.0"
# Change: anchor-spl = "0.30.1" → anchor-spl = "0.32.0"

# Clean and rebuild
rm -rf target .anchor Cargo.lock
anchor build
anchor deploy
```

**Pros**:
- Latest features (TS IDL generation improvements)
- Better Cargo.lock v4 support
- Updated BPF toolchain with Rust 1.76+
- Metaplex Core v1.7.0 compatibility

**Cons**:
- May have breaking API changes
- Requires updating IDL in backend/frontend

---

### Option 2: Use Docker Build Environment
**Reason**: Isolates Rust toolchain from system dependencies.

```bash
# Create Dockerfile
cd /Users/christophercialone/Desktop/VAMANO_PROJECT/vamano/programs/vamano-program

cat > Dockerfile <<EOF
FROM projectserum/build:v0.32.0
WORKDIR /workspace
COPY . .
RUN anchor build
CMD ["anchor", "deploy"]
EOF

# Build in Docker
docker build -t vamano-anchor .
docker run --rm -v $(pwd):/workspace vamano-anchor anchor build
```

**Pros**:
- Guaranteed compatible environment
- Reproducible builds
- CI/CD ready

**Cons**:
- Requires Docker installed
- Slower first build (downloads image)

---

### Option 3: Update Solana BPF Platform Tools
**Reason**: Install latest BPF platform with Rust 1.76+.

```bash
# Update Solana CLI to v2.0 beta (Oct 2025)
sh -c "$(curl -sSfL https://release.solana.com/v2.0-beta/install)"
source ~/.profile

# This should include updated BPF platform
solana --version  # v2.0.0-beta

# Rebuild
cd /Users/christophercialone/Desktop/VAMANO_PROJECT/vamano/programs/vamano-program
rm -rf target .anchor Cargo.lock
anchor build
```

**Pros**:
- Latest Solana features
- Keeps Anchor 0.30.1
- Minimal code changes

**Cons**:
- Beta software
- May have other incompatibilities

---

### Option 4: Pin Dependencies to Older Versions (NOT RECOMMENDED)
**Reason**: Force older dependency versions that work with Rust 1.75.

```bash
# In Cargo.toml, add exact versions
[dependencies]
anchor-lang = "=0.29.0"  # Older version
anchor-spl = "=0.29.0"
```

**Pros**:
- Quick fix

**Cons**:
- Missing new features
- Security vulnerabilities in older deps
- Not compatible with mpl-core v1.7.0

---

## 📊 Current State

### Project Structure
```
/vamano/programs/vamano-program/
├── Anchor.toml           # ✅ Configured for devnet
├── Cargo.toml            # ✅ anchor-lang 0.30.1, mpl-core 0.7.2
├── Cargo.lock            # ⚠️  v3 (manually converted from v4)
├── programs/
│   └── vamano-program/
│       └── src/
│           └── lib.rs    # ✅ 4 instructions ready
└── tests/
    └── vamano-program.ts # ✅ 3 tests written
```

### Anchor Program Features
- ✅ `init_event`: PDA-based event creation
- ✅ `mint_ticket`: NFT minting with royalties
- ✅ `verify_ticket`: Ownership verification
- ✅ `enforce_royalties`: 10% split (5% artist, 3% organizer, 2% platform)

### Dependencies Ready
- `anchor-lang`: 0.30.1
- `anchor-spl`: 0.30.1
- `mpl-core`: 0.7.2 (for Metaplex Core NFTs)

---

## 🎯 Next Steps (After Rust Fix)

### 1. Build & Deploy
```bash
anchor build
anchor deploy  # Will output program ID
```

### 2. Update Program IDs
- `Anchor.toml`: Update `[programs.devnet]`
- `backend/server.ts`: Update `new Program(idl, new PublicKey('NEW_ID'))`
- `frontend/builder/page.tsx`: Update program ID for wallet transactions

### 3. Run Tests
```bash
anchor test  # Should pass all 3 tests
```

### 4. Verify Deployment
```bash
solana program show <PROGRAM_ID> --url devnet
```

---

## 🔍 Debugging Commands

### Check Rust Versions
```bash
rustc --version          # System Rust
rustup show              # Active toolchains
cargo --version          # Cargo version
anchor --version         # Anchor CLI version
solana --version         # Solana CLI version
```

### Check BPF SDK
```bash
ls ~/.cache/solana/*/bpf-tools/
# Should show Rust version used by BPF
```

### Force Rebuild
```bash
rm -rf target/ .anchor/ Cargo.lock
cargo clean
anchor clean
anchor build
```

---

## 📝 Workaround for Immediate Progress

If building locally continues to fail, we can:

1. **Use Pre-built IDL**: Deploy using `solana program deploy` with a pre-compiled `.so` file
2. **Mock Program ID**: Use the existing `CtGfpDV9qphEv6BKuBpoPRK3nKUSLMYnKYwRegTTBiHA` in development
3. **Skip Anchor**: Write raw Solana program in Rust without Anchor framework

However, **Option 1 (Upgrade to Anchor 0.32.0)** is strongly recommended as it's the cleanest long-term solution.

---

## 📚 References

- Anchor 0.32.0 Release Notes: https://github.com/coral-xyz/anchor/releases/tag/v0.32.0
- Cargo.lock v4 Issue: https://github.com/rust-lang/cargo/issues/12558
- Solana BPF Docs: https://docs.solanalabs.com/cli/examples/deploy-a-program
- Metaplex Core v1.7.0: https://developers.metaplex.com/core

---

**Status**: 🟡 **BLOCKED** - Waiting for Rust toolchain resolution  
**Recommended Action**: Upgrade to Anchor 0.32.0  
**Alternative**: Use Solana v2.0 beta with updated BPF tools  
**Timeline**: 15-30 minutes once solution is chosen

---

Generated: October 15, 2025, 1:15 AM PST  
Last Updated: Attempting Option 1 (Anchor 0.32.0 upgrade)

