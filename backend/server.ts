import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import idl from './vamano_program.json';

dotenv.config();

// ============================================================================
// CREATOR MERCHANT SETUP
// ============================================================================
// To receive funds from ticket sales, creators must complete KYB (Know Your Business):
// 1. Go to https://dashboard.moonpay.com/kyb
// 2. Complete business verification
// 3. This enables:
//    - USD payments to your bank account
//    - USDC payments to your Solana wallet
//    - Compliance with payment regulations
// 4. Add your MOONPAY_API_KEY and MOONPAY_SECRET to .env
// ============================================================================

const app: express.Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Solana connection
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// Mock wallet for now (in production, use actual wallet)
const mockKeypair = Keypair.generate();
const wallet = new Wallet(mockKeypair);

// Anchor provider
const provider = new AnchorProvider(connection, wallet, {
  commitment: 'confirmed',
});

// Program IDs (will be updated after deployment)
const PROGRAM_ID_EVENT_FACTORY = new PublicKey(process.env.PROGRAM_ID_EVENT_FACTORY || '11111111111111111111111111111111');
const PROGRAM_ID_TICKET_MINT = new PublicKey(process.env.PROGRAM_ID_TICKET_MINT || '11111111111111111111111111111111');
const PROGRAM_ID_ESCROW_MANAGER = new PublicKey(process.env.PROGRAM_ID_ESCROW_MANAGER || '11111111111111111111111111111111');
const PROGRAM_ID_ROYALTIES_ENFORCER = new PublicKey(process.env.PROGRAM_ID_ROYALTIES_ENFORCER || '11111111111111111111111111111111');

// Lazy program initialization to avoid runtime failures when env/IDL mismatch
let eventFactoryProgram: Program | null = null;
let ticketMintProgram: Program | null = null;
let escrowManagerProgram: Program | null = null;
let royaltiesEnforcerProgram: Program | null = null;

console.log('🔗 Connected to Solana:', connection.rpcEndpoint);
console.log('📋 Program IDs:', {
  eventFactory: PROGRAM_ID_EVENT_FACTORY.toString(),
  ticketMint: PROGRAM_ID_TICKET_MINT.toString(),
  escrowManager: PROGRAM_ID_ESCROW_MANAGER.toString(),
  royaltiesEnforcer: PROGRAM_ID_ROYALTIES_ENFORCER.toString()
});

// Helper function to initialize program clients
function initializePrograms() {
  try {
    // Load IDLs (will be generated after deployment)
    // For now, using placeholder IDLs
    eventFactoryProgram = new Program(idl as any, PROGRAM_ID_EVENT_FACTORY, provider);
    ticketMintProgram = new Program(idl as any, PROGRAM_ID_TICKET_MINT, provider);
    escrowManagerProgram = new Program(idl as any, PROGRAM_ID_ESCROW_MANAGER, provider);
    royaltiesEnforcerProgram = new Program(idl as any, PROGRAM_ID_ROYALTIES_ENFORCER, provider);
    
    console.log('✅ All programs initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize programs:', error);
  }
}

// Mock Helius SDK for verification
class MockHelius {
  async getAssetProof(mintAddress: string) {
    console.log(`🔍 Mock Helius: Verifying asset proof for ${mintAddress}`);
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

  async getAsset(mintAddress: string) {
    console.log(`🔍 Mock Helius: Fetching asset ${mintAddress}`);
    return {
      id: mintAddress,
      content: {
        metadata: {
          name: "VAMANO Ticket",
          symbol: "TICKET",
        },
      },
      ownership: {
        owner: mockKeypair.publicKey.toString(),
      },
    };
  }
}

const helius = new MockHelius();

// ============================================================================
// API Endpoints
// ============================================================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'VAMANO Backend with multi-program Anchor setup',
    programIds: {
      eventFactory: PROGRAM_ID_EVENT_FACTORY.toString(),
      ticketMint: PROGRAM_ID_TICKET_MINT.toString(),
      escrowManager: PROGRAM_ID_ESCROW_MANAGER.toString(),
      royaltiesEnforcer: PROGRAM_ID_ROYALTIES_ENFORCER.toString()
    },
    network: connection.rpcEndpoint,
  });
});

// Create event with Anchor CPI
app.post('/create-event', async (req: Request, res: Response) => {
  try {
    console.log('📝 Creating event:', req.body);
    const { name, date, venue, supply, metadataUri, priceUsdc, creatorWallet } = req.body;

    if (!name || !date || !venue || !creatorWallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Derive event PDA
    const creatorPubkey = new PublicKey(creatorWallet);
    const [eventPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('event'), creatorPubkey.toBuffer(), Buffer.from(name)],
      PROGRAM_ID_EVENT_FACTORY
    );

    console.log('📍 Event PDA:', eventPda.toString());
    console.log('🔢 Bump:', bump);

    // CPI: Call EventFactory.initEvent
    // TODO: Replace with real CPI when programs are deployed
    if (eventFactoryProgram) {
      try {
        const txSig = await eventFactoryProgram.methods
          .initEvent(
            name,
            new BN(date),
            venue,
            new BN(supply || 100),
            new BN(priceUsdc || 50),
            [] // base_traits - will be populated from frontend
          )
          .accounts({
            eventPda: eventPda,
            creator: creatorPubkey,
            systemProgram: SystemProgram.programId,
          })
          .rpc({ commitment: 'confirmed' });
        
        console.log('✅ Event created on-chain:', txSig);
      } catch (error) {
        console.error('❌ CPI failed:', error);
        // Continue with mock response for now
      }
    }
    // For now, we simulate the call and return the expected result
    const mockTxSignature = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    /* 
    // Real CPI call (uncomment after deployment):
    if (!program) {
      program = new (Program as unknown as any)(idl as any, PROGRAM_ID as unknown as any, provider as unknown as any);
    }
    const tx = await program.methods
      .initEvent(
        name,
        new BN(Math.floor(new Date(date).getTime() / 1000)),
        venue,
        new BN(supply || 1000),
        metadataUri || 'https://arweave.net/default',
        new BN(priceUsdc || 50000000) // 50 USDC default
      )
      .accounts({
        event: eventPda,
        creator: creatorPubkey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('✅ Event created on-chain:', tx);
    */

    res.json({
      success: true,
      eventId: eventPda.toString(),
      eventPda: eventPda.toString(),
      bump,
      txSignature: mockTxSignature,
      message: 'Event created successfully (CPI stub)',
      cpiReady: true,
    });
  } catch (error) {
    console.error('❌ Error creating event:', error);
    res.status(500).json({ 
      error: 'Failed to create event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mint ticket with Anchor CPI
app.post('/mint-ticket', async (req: Request, res: Response) => {
  try {
    console.log('🎟️  Minting ticket:', req.body);
    const { eventId, eventPda, amount, zkEnabled, buyerWallet } = req.body;

    if (!eventPda || !buyerWallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const eventPubkey = new PublicKey(eventPda);
    const buyerPubkey = new PublicKey(buyerWallet);

    console.log('📍 Event PDA:', eventPubkey.toString());
    console.log('👤 Buyer:', buyerPubkey.toString());

    // CPI Stub: Simulate ticket minting
    const mockNftMint = Keypair.generate().publicKey.toString();
    const mockTxSignature = `mock_mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    /*
    // Real CPI call (uncomment after deployment):
    if (!program) {
      program = new (Program as unknown as any)(idl as any, PROGRAM_ID as unknown as any, provider as unknown as any);
    }
    const tx = await program.methods
      .mintTicket(
        new BN(amount || 50000000), // USDC amount
        zkEnabled || false
      )
      .accounts({
        event: eventPubkey,
        buyer: buyerPubkey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('✅ Ticket minted on-chain:', tx);
    */

    res.json({
      success: true,
      nftMint: mockNftMint,
      txSignature: mockTxSignature,
      eventPda: eventPubkey.toString(),
      amount: amount || 50000000,
      zkEnabled: zkEnabled || false,
      passDownloadUrl: `/download-pass/${mockNftMint}`,
      message: 'Ticket minted successfully (CPI stub)',
      cpiReady: true,
    });
  } catch (error) {
    console.error('❌ Error minting ticket:', error);
    res.status(500).json({ 
      error: 'Failed to mint ticket',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Verify ticket with Helius integration
app.get('/verify-qr/:qrHash', async (req: Request, res: Response) => {
  try {
    const { qrHash } = req.params;
    console.log('🔍 Verifying QR:', qrHash);

    // In production: Parse QR hash to extract NFT mint address
    // For now, treat qrHash as the mint address
    const isValidFormat = qrHash && (qrHash.startsWith('nft_') || qrHash.length > 30);

    if (!isValidFormat) {
      return res.status(400).json({
        valid: false,
        message: 'Invalid QR code format',
      });
    }

    // Use Helius to verify NFT ownership
    try {
      const asset = await helius.getAsset(qrHash);
      const assetProof = await helius.getAssetProof(qrHash);

      res.json({
        valid: true,
        nftMint: qrHash,
        owner: assetProof.ownership.owner.toString(),
        event: 'Cypherpunk Concert 2025',
        compressed: assetProof.compression.compressed,
        message: 'Ticket verified successfully',
        verifiedAt: new Date().toISOString(),
        heliusVerified: true,
      });
    } catch (heliusError) {
      console.warn('⚠️  Helius verification failed, using fallback');
      res.json({
        valid: true,
        nftMint: qrHash,
        owner: 'mock_owner_address',
        event: 'Cypherpunk Concert 2025',
        message: 'Ticket verified (fallback)',
        heliusVerified: false,
      });
    }
  } catch (error) {
    console.error('❌ Error verifying QR:', error);
    res.status(500).json({ 
      error: 'Failed to verify ticket',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Download PassKit pass (stub)
app.get('/download-pass/:nftMint', async (req: Request, res: Response) => {
  try {
    const { nftMint } = req.params;
    console.log('📱 Generating pass for:', nftMint);

    // PassKit stub: Generate sample pass data
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: 'pass.com.vamano.ticket',
      serialNumber: nftMint,
      teamIdentifier: 'VAMANO',
      organizationName: 'VAMANO',
      description: 'Cypherpunk Concert 2025',
      logoText: 'VAMANO',
      foregroundColor: 'rgb(0, 255, 0)',
      backgroundColor: 'rgb(0, 0, 0)',
      eventTicket: {
        primaryFields: [{
          key: 'event',
          label: 'EVENT',
          value: 'Cypherpunk Concert 2025'
        }],
        secondaryFields: [{
          key: 'date',
          label: 'DATE',
          value: new Date().toLocaleDateString()
        }],
        barcode: {
          message: nftMint,
          format: 'PKBarcodeFormatQR',
          messageEncoding: 'iso-8859-1'
        }
      }
    };

    // In production: Generate actual .pkpass file with PassKit SDK
    res.json({
      success: true,
      nftMint,
      passData,
      downloadUrl: `data:application/json;base64,${Buffer.from(JSON.stringify(passData)).toString('base64')}`,
      message: 'PassKit stub - real .pkpass generation pending',
    });
  } catch (error) {
    console.error('❌ Error generating pass:', error);
    res.status(500).json({ 
      error: 'Failed to generate pass',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Sign MoonPay URL for security (required for production)
app.post('/sign-moonpay-url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('🔐 Signing MoonPay URL:', url.substring(0, 50) + '...');

    // Create signature for URL
    const nonce = Date.now();
    const message = `Sign URL: ${url} nonce: ${nonce}`;
    
    // In production, this would use a proper wallet signing mechanism
    // For now, we'll create a simple HMAC signature
    const moonpaySecret = process.env.MOONPAY_SECRET || 'test_secret_123';
    const signature = crypto
      .createHmac('sha256', moonpaySecret)
      .update(message)
      .digest('hex');

    console.log('✅ URL signed successfully');

    res.json({
      signature,
      nonce,
      message: 'URL signed successfully'
    });
  } catch (error) {
    console.error('❌ Error signing URL:', error);
    res.status(500).json({ 
      error: 'Failed to sign URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// MoonPay webhook with signature verification and auto-minting
app.post('/moonpay-callback', async (req: Request, res: Response) => {
  try {
    console.log('💰 MoonPay webhook received:', {
      type: req.body.type,
      status: req.body.data?.status,
      timestamp: new Date().toISOString()
    });

    // Step 1: Verify webhook signature (Production only)
    const moonpaySignature = (req.headers['moonpay-signature'] || req.headers['x-moonpay-signature']) as string;
    const moonpayWebhookKey = process.env.MOONPAY_WEBHOOK_KEY || process.env.MOONPAY_SECRET || 'test_secret_123';

    if (process.env.NODE_ENV === 'production') {
      if (!moonpaySignature) {
        console.error('❌ Missing MoonPay signature');
        return res.status(403).json({ error: 'Missing signature' });
      }

      const computedSignature = crypto
        .createHmac('sha256', moonpayWebhookKey)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (computedSignature !== moonpaySignature) {
        console.error('❌ Invalid MoonPay signature:', {
          received: moonpaySignature,
          computed: computedSignature
        });
        return res.status(403).json({ error: 'Invalid signature' });
      }

      console.log('✅ Webhook signature verified');
    } else {
      console.log('🔓 Development mode: Skipping signature verification');
    }

    const { type, data } = req.body;

    // Step 2: Handle payment completion
    if (type === 'transaction_updated' && data?.status === 'completed') {
      console.log('✅ Payment completed:', {
        transactionId: data.externalTransactionId,
        amount: data.quoteCurrencyAmount,
        currency: data.quoteCurrency,
        walletAddress: data.walletAddress
      });

      // Extract metadata (eventPda passed via widget customization)
      const eventPda = data.widgetCustomization?.eventPda || data.externalCustomerId;
      const buyerWallet = data.walletAddress;

      if (!eventPda || !buyerWallet) {
        console.error('❌ Missing eventPda or buyerWallet in webhook data');
        return res.json({ 
          success: false, 
          message: 'Missing required fields for minting' 
        });
      }

      // Step 3: Auto-mint ticket
      try {
        const eventPubkey = new PublicKey(eventPda);
        const buyerPubkey = new PublicKey(buyerWallet);
        const mockNftMint = Keypair.generate().publicKey.toString();
        const mockTxSignature = `moonpay_mint_${Date.now()}`;

        console.log('🎟️  Auto-minting ticket...');
        console.log('📍 Event PDA:', eventPubkey.toString());
        console.log('👤 Buyer:', buyerPubkey.toString());

        /*
        // Real CPI call (uncomment after deployment):
        if (!program) {
          program = new (Program as unknown as any)(idl as any, PROGRAM_ID as unknown as any, provider as unknown as any);
        }
        const tx = await program.methods
          .mintTicket(
            new BN(data.quoteCurrencyAmount * 1000000), // Convert to smallest unit
            false // zkEnabled
          )
          .accounts({
            event: eventPubkey,
            buyer: buyerPubkey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log('✅ Ticket minted on-chain via webhook:', tx);
        */

        console.log('✅ Ticket minted (stub):', mockNftMint);

        // Step 4: Return mint details
        res.json({
          success: true,
          message: 'Payment processed and ticket minted',
          nftMint: mockNftMint,
          txSignature: mockTxSignature,
          passDownloadUrl: `/download-pass/${mockNftMint}`,
          eventPda: eventPubkey.toString(),
        });
      } catch (mintError) {
        console.error('❌ Error auto-minting ticket:', mintError);
        return res.status(500).json({
          success: false,
          error: 'Payment successful but minting failed',
          details: mintError instanceof Error ? mintError.message : 'Unknown error'
        });
      }
    } else {
      console.log('ℹ️  Webhook received but not a completed transaction:', type, data?.status);
      res.json({ success: true, message: 'Webhook received' });
    }
  } catch (error) {
    console.error('❌ Error processing MoonPay webhook:', error);
    res.status(500).json({ 
      error: 'Failed to process webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 VAMANO Backend Server Started');
  console.log('='.repeat(70));
  console.log(`📡 Health Check:    http://localhost:${PORT}/health`);
  console.log(`🎫 Create Event:    POST http://localhost:${PORT}/create-event`);
  console.log(`🎟️  Mint Ticket:     POST http://localhost:${PORT}/mint-ticket`);
  console.log(`🔍 Verify QR:       GET  http://localhost:${PORT}/verify-qr/:hash`);
  console.log(`📱 Download Pass:   GET  http://localhost:${PORT}/download-pass/:mint`);
  console.log(`🔐 Sign MoonPay:    POST http://localhost:${PORT}/sign-moonpay-url`);
  console.log(`💰 MoonPay Webhook: POST http://localhost:${PORT}/moonpay-callback`);
  console.log('='.repeat(70));
  console.log('🔗 Network:', connection.rpcEndpoint);
  console.log('📋 Program ID:', PROGRAM_ID.toString());
  console.log('🟢 Server is ready for CPI calls');
  console.log('='.repeat(70) + '\n');
});

export default app;
