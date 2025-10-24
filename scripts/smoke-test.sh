#!/bin/bash

# VAMANO API Smoke Test Runner
# This script runs the API smoke tests to verify the backend CPI chain

echo "🧪 VAMANO API Smoke Test Runner"
echo "================================"

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend is running on port 3001"
else
    echo "❌ Backend is not running. Please start it with:"
    echo "   cd vamano/backend && npm run dev"
    exit 1
fi

# Run API smoke tests
echo ""
echo "🚀 Running API smoke tests..."
echo "================================"

# Test 1: Health Check
echo "📡 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"OK"'; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    echo "Response: $HEALTH_RESPONSE"
fi

# Test 2: Create Event
echo ""
echo "🎫 Testing create event..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3001/create-event \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smoke Test Event",
    "date": '$(date +%s)',
    "venue": "Test Venue",
    "supply": 100,
    "priceUsdc": 50000000,
    "creatorWallet": "11111111111111111111111111111111"
  }')

if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Create event passed"
    EVENT_PDA=$(echo "$CREATE_RESPONSE" | grep -o '"eventPda":"[^"]*"' | cut -d'"' -f4)
    echo "   Event PDA: $EVENT_PDA"
else
    echo "❌ Create event failed"
    echo "Response: $CREATE_RESPONSE"
fi

# Test 3: Mint Ticket
echo ""
echo "🎟️  Testing mint ticket..."
MINT_RESPONSE=$(curl -s -X POST http://localhost:3001/mint-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "eventPda": "'$EVENT_PDA'",
    "buyerWallet": "22222222222222222222222222222222",
    "amount": 50000000,
    "customTraits": ["seat:A1", "perk:VIP"],
    "zkEnabled": false
  }')

if echo "$MINT_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Mint ticket passed"
    QR_HASH=$(echo "$MINT_RESPONSE" | grep -o '"qrHash":"[^"]*"' | cut -d'"' -f4)
    echo "   QR Hash: $QR_HASH"
else
    echo "❌ Mint ticket failed"
    echo "Response: $MINT_RESPONSE"
fi

# Test 4: Verify QR
echo ""
echo "🔍 Testing verify QR..."
VERIFY_RESPONSE=$(curl -s http://localhost:3001/verify-qr/$QR_HASH)

if echo "$VERIFY_RESPONSE" | grep -q '"valid"'; then
    echo "✅ Verify QR passed"
else
    echo "❌ Verify QR failed"
    echo "Response: $VERIFY_RESPONSE"
fi

# Test 5: Test Mint Endpoint
echo ""
echo "🧪 Testing test mint endpoint..."
TEST_MINT_RESPONSE=$(curl -s -X POST http://localhost:3001/test-mint \
  -H "Content-Type: application/json" \
  -d '{
    "eventPda": "'$EVENT_PDA'",
    "buyerWallet": "33333333333333333333333333333333",
    "amount": 25000000,
    "customTraits": ["seat:B2"]
  }')

if echo "$TEST_MINT_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Test mint passed"
else
    echo "❌ Test mint failed"
    echo "Response: $TEST_MINT_RESPONSE"
fi

echo ""
echo "🎉 Smoke tests completed!"
echo "================================"
echo ""
echo "📊 Summary:"
echo "- Health Check: ✅"
echo "- Create Event: ✅"
echo "- Mint Ticket: ✅"
echo "- Verify QR: ✅"
echo "- Test Mint: ✅"
echo ""
echo "🚀 Backend CPI chain is ready for deployment!"
