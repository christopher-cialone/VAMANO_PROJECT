import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore } from '@metaplex-foundation/mpl-core';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');

// Initialize UMI for Metaplex
const umi = createUmi(connection.rpcEndpoint)
  .use(mplCore());

// Mock Helius SDK for now (will be replaced with real implementation)
class MockHelius {
  async getAssetProof(mintAddress: string) {
    console.log(`Mock Helius: Verifying asset proof for ${mintAddress}`);
    return {
      ownership: {
        owner: new PublicKey("MockOwnerPublicKey11111111111111111111111111"),
        delegatedBy: null,
        frozen: false,
      },
      compression: {
        compressed: true,
        tree: new PublicKey("MockTreePublicKey11111111111111111111111111"),
        leafId: 1,
      },
    };
  }
}

const helius = new MockHelius();

// Mock PassKit generator (in production, use actual PassKit SDK)
class PassKitGenerator {
  async generatePass(eventData: any, nftMint: string): Promise<Buffer> {
    // Mock PKPass generation
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: 'pass.com.vamano.ticket',
      serialNumber: nftMint,
      teamIdentifier: 'VAMANO',
      organizationName: 'VAMANO',
      description: eventData.name,
      logoText: 'VAMANO',
      foregroundColor: 'rgb(0, 0, 0)',
      backgroundColor: 'rgb(255, 255, 255)',
      eventTicket: {
        primaryFields: [
          {
            key: 'event',
            label: 'EVENT',
            value: eventData.name
          }
        ],
        secondaryFields: [
          {
            key: 'date',
            label: 'DATE',
            value: new Date(eventData.date * 1000).toLocaleDateString()
          },
          {
            key: 'venue',
            label: 'VENUE',
            value: eventData.venue
          }
        ],
        barcode: {
          message: nftMint,
          format: 'PKBarcodeFormatQR',
          messageEncoding: 'iso-8859-1'
        }
      }
    };
    
    // In production, this would generate an actual .pkpass file
    return Buffer.from(JSON.stringify(passData));
  }
}

const passKitGenerator = new PassKitGenerator();

// Routes

// Create event endpoint
app.post('/create-event', async (req, res) => {
  try {
    const { name, date, venue, supply, metadataUri, creatorWallet } = req.body;
    
    // Validate inputs
    if (!name || !date || !venue || !supply || !creatorWallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In production, this would call the Anchor program
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Mock event creation
    const eventData = {
      id: eventId,
      name,
      date: parseInt(date),
      venue,
      supply: parseInt(supply),
      metadataUri,
      creator: creatorWallet,
      createdAt: new Date().toISOString()
    };

    console.log('Event created:', eventData);
    
    res.json({
      success: true,
      eventId,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Mint ticket endpoint (called after payment verification)
app.post('/mint-ticket', async (req, res) => {
  try {
    const { eventId, paymentTxHash, buyerWallet, amount } = req.body;
    
    // Verify payment transaction
    if (paymentTxHash) {
      const tx = await connection.getTransaction(paymentTxHash);
      if (!tx) {
        return res.status(400).json({ error: 'Payment transaction not found' });
      }
    }

    // Mock NFT minting
    const nftMint = `nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate PKPass
    const eventData = {
      name: 'Cypherpunk Concert 2024',
      date: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
      venue: 'Decentralized Arena'
    };
    
    const passBuffer = await passKitGenerator.generatePass(eventData, nftMint);
    
    console.log('Ticket minted:', { nftMint, eventId, buyerWallet });
    
    res.json({
      success: true,
      nftMint,
      passDownloadUrl: `/download-pass/${nftMint}`,
      message: 'Ticket minted successfully'
    });
  } catch (error) {
    console.error('Error minting ticket:', error);
    res.status(500).json({ error: 'Failed to mint ticket' });
  }
});

// Download PKPass endpoint
app.get('/download-pass/:nftMint', async (req, res) => {
  try {
    const { nftMint } = req.params;
    
    // Generate pass for the specific NFT
    const eventData = {
      name: 'Cypherpunk Concert 2024',
      date: Math.floor(Date.now() / 1000) + 86400,
      venue: 'Decentralized Arena'
    };
    
    const passBuffer = await passKitGenerator.generatePass(eventData, nftMint);
    
    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', `attachment; filename="ticket_${nftMint}.pkpass"`);
    res.send(passBuffer);
  } catch (error) {
    console.error('Error generating pass:', error);
    res.status(500).json({ error: 'Failed to generate pass' });
  }
});

// Verify QR code endpoint
app.get('/verify-qr/:qrHash', async (req, res) => {
  try {
    const { qrHash } = req.params;
    
    // In production, this would query Helius for NFT ownership
    // For now, mock verification
    const isValid = qrHash && qrHash.startsWith('nft_');
    
    if (isValid) {
      res.json({
        valid: true,
        nftMint: qrHash,
        owner: 'mock_owner_address',
        event: 'Cypherpunk Concert 2024',
        message: 'Ticket verified successfully'
      });
    } else {
      res.status(400).json({
        valid: false,
        message: 'Invalid ticket QR code'
      });
    }
  } catch (error) {
    console.error('Error verifying QR:', error);
    res.status(500).json({ error: 'Failed to verify ticket' });
  }
});

// MoonPay webhook endpoint
app.post('/moonpay-callback', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (type === 'transaction_updated' && data.status === 'completed') {
      console.log('MoonPay payment completed:', data);
      
      // Trigger ticket minting
      // In production, this would call the mint-ticket endpoint
      res.json({ success: true, message: 'Payment processed' });
    } else {
      res.json({ success: true, message: 'Webhook received' });
    }
  } catch (error) {
    console.error('Error processing MoonPay webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VAMANO Backend server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
});

export default app;
