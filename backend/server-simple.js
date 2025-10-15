const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Helius for verification
class MockHelius {
  async getAssetProof(mintAddress) {
    console.log(`Mock Helius: Verifying asset proof for ${mintAddress}`);
    return {
      ownership: {
        owner: "MockOwnerPublicKey11111111111111111111111111",
        delegatedBy: null,
        frozen: false,
      },
      compression: {
        compressed: true,
        tree: "MockTreePublicKey11111111111111111111111111",
        leafId: 1,
      },
    };
  }
}
const helius = new MockHelius();

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'VAMANO Backend is running'
  });
});

// Create event
app.post('/create-event', async (req, res) => {
  try {
    console.log('📝 Creating event:', req.body);
    const { name, date, venue, supply, metadataUri, creatorWallet } = req.body;
    
    if (!name || !date || !venue || !creatorWallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const eventData = {
      id: eventId,
      name,
      date: parseInt(date),
      venue,
      supply: parseInt(supply) || 100,
      metadataUri,
      creator: creatorWallet,
      createdAt: new Date().toISOString()
    };

    console.log('✅ Event created:', eventData);
    
    res.json({
      success: true,
      eventId,
      message: 'Event created successfully',
      data: eventData
    });
  } catch (error) {
    console.error('❌ Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Mint ticket
app.post('/mint-ticket', async (req, res) => {
  try {
    console.log('🎫 Minting ticket:', req.body);
    const { eventId, paymentTxHash, buyerWallet, amount } = req.body;
    
    const nftMint = `nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('✅ Ticket minted:', { nftMint, eventId, buyerWallet });
    
    res.json({
      success: true,
      nftMint,
      passDownloadUrl: `/download-pass/${nftMint}`,
      message: 'Ticket minted successfully (mock)',
      data: {
        eventId,
        amount,
        nftMint,
        mintedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error minting ticket:', error);
    res.status(500).json({ error: 'Failed to mint ticket' });
  }
});

// Verify QR
app.get('/verify-qr/:qrHash', async (req, res) => {
  try {
    console.log('🔍 Verifying QR:', req.params.qrHash);
    const { qrHash } = req.params;
    
    const assetProof = await helius.getAssetProof(qrHash);
    const isValid = qrHash && qrHash.length > 10;
    
    if (isValid) {
      console.log('✅ Ticket verified:', qrHash);
      res.json({
        valid: true,
        nftMint: qrHash,
        owner: assetProof.ownership.owner,
        event: 'Mock Event',
        message: 'Ticket verified successfully (mock)'
      });
    } else {
      console.log('❌ Invalid ticket:', qrHash);
      res.status(400).json({
        valid: false,
        message: 'Invalid ticket QR code'
      });
    }
  } catch (error) {
    console.error('❌ Error verifying QR:', error);
    res.status(500).json({ error: 'Failed to verify ticket' });
  }
});

// MoonPay callback
app.post('/moonpay-callback', async (req, res) => {
  console.log('💰 MoonPay callback:', req.body);
  res.json({ success: true, message: 'Webhook received' });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ═══════════════════════════════════════════════════════');
  console.log('🚀 VAMANO Backend Server Started');
  console.log('🚀 ═══════════════════════════════════════════════════════');
  console.log('');
  console.log(`📡 Health Check:    http://localhost:${PORT}/health`);
  console.log(`🎫 Create Event:    POST http://localhost:${PORT}/create-event`);
  console.log(`🎟️  Mint Ticket:     POST http://localhost:${PORT}/mint-ticket`);
  console.log(`🔍 Verify QR:       GET  http://localhost:${PORT}/verify-qr/:hash`);
  console.log('');
  console.log('🟢 Server is ready to accept requests');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});

