# VAMANO Server Status

## 🟢 Backend Server: RUNNING

**URL**: http://localhost:3001  
**Status**: ✅ Active (PID: 63555)  
**Type**: Node.js Express Server (Mock APIs)

### Available Endpoints:

1. **Health Check**
   - URL: `GET http://localhost:3001/health`
   - Test: `curl http://localhost:3001/health`
   - Response: `{"status":"OK","timestamp":"...","message":"VAMANO Backend is running"}`

2. **Create Event**
   - URL: `POST http://localhost:3001/create-event`
   - Body: `{"name":"Test Event","date":1234567890,"venue":"Test Venue","supply":100,"metadataUri":"https://arweave.net/test","creatorWallet":"YourWalletAddress"}`
   - Test: 
   ```bash
   curl -X POST http://localhost:3001/create-event \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Event","date":1234567890,"venue":"Test Venue","supply":100,"metadataUri":"https://arweave.net/test","creatorWallet":"test"}'
   ```

3. **Mint Ticket**
   - URL: `POST http://localhost:3001/mint-ticket`
   - Body: `{"eventId":"event_123","paymentTxHash":"tx_123","buyerWallet":"wallet","amount":50}`
   - Test:
   ```bash
   curl -X POST http://localhost:3001/mint-ticket \
     -H "Content-Type: application/json" \
     -d '{"eventId":"event_123","buyerWallet":"test","amount":50}'
   ```

4. **Verify QR**
   - URL: `GET http://localhost:3001/verify-qr/:qrHash`
   - Test: `curl http://localhost:3001/verify-qr/nft_test_12345`

5. **MoonPay Callback**
   - URL: `POST http://localhost:3001/moonpay-callback`
   - Test: `curl -X POST http://localhost:3001/moonpay-callback -H "Content-Type: application/json" -d '{}'`

---

## 🔴 Frontend Server: NOT RUNNING

**Issue**: pnpm node_modules corruption  
**Error**: `ERR_INVALID_PACKAGE_CONFIG` in multiple package.json files

### Problem:
The pnpm node_modules directory has corrupted package.json files. This is preventing Next.js from starting.

### Solution Options:

**Option 1: Clean Reinstall (Recommended)**
```bash
cd /Users/christophercialone/Desktop/VAMANO_PROJECT/vamano

# Remove all node_modules
rm -rf node_modules frontend/node_modules backend/node_modules

# Remove pnpm lock and cache
rm -rf pnpm-lock.yaml .pnpm-store

# Reinstall with npm instead
cd frontend
npm install
npm run dev

# In another terminal
cd ../backend
npm install
node server-simple.js
```

**Option 2: Use npm Instead of pnpm**
```bash
cd /Users/christophercialone/Desktop/VAMANO_PROJECT/vamano/frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Option 3: Fresh Clone**
If the above don't work, the git repository corruption may have affected the files. Consider:
1. Backup your current work
2. Clone fresh from GitHub
3. Copy over your changes

---

## 🧪 Testing the Backend

### Test 1: Health Check
```bash
curl http://localhost:3001/health
```

Expected Response:
```json
{
  "status": "OK",
  "timestamp": "2025-10-14T...",
  "message": "VAMANO Backend is running"
}
```

### Test 2: Create Event
```bash
curl -X POST http://localhost:3001/create-event \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cypherpunk Concert 2025",
    "date": 1735689600,
    "venue": "Decentralized Arena",
    "supply": 1000,
    "metadataUri": "https://arweave.net/test",
    "creatorWallet": "YourSolanaWalletAddress"
  }'
```

Expected Response:
```json
{
  "success": true,
  "eventId": "event_...",
  "message": "Event created successfully",
  "data": { ... }
}
```

### Test 3: Mint Ticket
```bash
curl -X POST http://localhost:3001/mint-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event_123",
    "buyerWallet": "BuyerSolanaWalletAddress",
    "amount": 50
  }'
```

Expected Response:
```json
{
  "success": true,
  "nftMint": "nft_...",
  "passDownloadUrl": "/download-pass/nft_...",
  "message": "Ticket minted successfully (mock)"
}
```

### Test 4: Verify QR
```bash
curl http://localhost:3001/verify-qr/nft_test_12345
```

Expected Response:
```json
{
  "valid": true,
  "nftMint": "nft_test_12345",
  "owner": "MockOwnerPublicKey...",
  "event": "Mock Event",
  "message": "Ticket verified successfully (mock)"
}
```

---

## 📊 Current Status

| Component | Status | URL | Notes |
|-----------|--------|-----|-------|
| Backend API | 🟢 Running | http://localhost:3001 | Mock APIs functional |
| Frontend UI | 🔴 Not Running | http://localhost:3000 | pnpm corruption |
| Anchor Programs | ⏸️ Not Deployed | Devnet | Blocked by Solana SDK |
| Database | ⚪ Not Configured | - | Optional for MVP |

---

## 🚀 Quick Fix to Get Frontend Running

**Fastest Solution** (5 minutes):

```bash
# 1. Go to frontend directory
cd /Users/christophercialone/Desktop/VAMANO_PROJECT/vamano/frontend

# 2. Remove corrupted node_modules
rm -rf node_modules

# 3. Install with npm (more stable than pnpm)
npm install

# 4. Start development server
npm run dev

# Frontend should now be available at http://localhost:3000
```

---

## 🎯 What You Can Test Right Now

### Backend API Testing (Available Now):

1. **Using curl** (command line):
   ```bash
   # Test health
   curl http://localhost:3001/health
   
   # Create an event
   curl -X POST http://localhost:3001/create-event \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","date":1234567890,"venue":"Test","supply":100,"creatorWallet":"test"}'
   ```

2. **Using Browser**:
   - Open: http://localhost:3001/health
   - Should see: `{"status":"OK",...}`

3. **Using Postman/Insomnia**:
   - Import the endpoints listed above
   - Test all API calls

### Frontend Testing (After Fix):

Once you run the npm install fix above:
1. Open http://localhost:3000
2. You should see the VAMANO landing page
3. Click "CREATE EVENT" to go to the builder
4. Click "VERIFY TICKET" to go to verification

---

## 📝 Logs

Backend logs: `/tmp/vamano-backend.log`  
Frontend logs: `/tmp/vamano-frontend.log`

View logs:
```bash
# Backend logs
tail -f /tmp/vamano-backend.log

# Frontend logs (once running)
tail -f /tmp/vamano-frontend.log
```

---

## 🆘 Need Help?

If the frontend still won't start after npm install:

1. **Check Node version**:
   ```bash
   node --version  # Should be v18+ or v20+
   ```

2. **Try with yarn**:
   ```bash
   cd frontend
   rm -rf node_modules
   yarn install
   yarn dev
   ```

3. **Check for port conflicts**:
   ```bash
   lsof -ti:3000 | xargs kill -9  # Kill any process on port 3000
   ```

4. **View detailed errors**:
   ```bash
   cd frontend
   npm run dev  # Run in foreground to see errors
   ```

---

**Generated**: October 14, 2025  
**Backend Status**: ✅ Running  
**Frontend Status**: 🔴 Needs npm install fix  
**Next Step**: Run `cd frontend && rm -rf node_modules && npm install && npm run dev`

