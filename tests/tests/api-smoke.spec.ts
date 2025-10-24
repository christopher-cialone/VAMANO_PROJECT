import { test, expect } from '@playwright/test';

test.describe('VAMANO API Smoke Tests', () => {
  const BASE_URL = 'http://localhost:3001';
  
  test.beforeEach(async ({ request }) => {
    // Ensure backend is running
    const healthResponse = await request.get(`${BASE_URL}/health`);
    expect(healthResponse.ok()).toBeTruthy();
  });

  test('should return health status with program IDs', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/health`);
    const data = await response.json();
    
    expect(data.status).toBe('OK');
    expect(data.message).toContain('multi-program Anchor setup');
    expect(data.programIds).toBeDefined();
    expect(data.programIds.eventFactory).toBeDefined();
    expect(data.programIds.ticketMint).toBeDefined();
    expect(data.programIds.escrowManager).toBeDefined();
    expect(data.programIds.royaltiesEnforcer).toBeDefined();
    expect(data.network).toContain('devnet');
  });

  test('should create event via API', async ({ request }) => {
    const eventData = {
      name: 'Smoke Test Event 2024',
      date: Date.now(),
      venue: 'Test Venue',
      supply: 100,
      priceUsdc: 50000000, // 50 USDC
      creatorWallet: '11111111111111111111111111111111' // Mock wallet
    };

    const response = await request.post(`${BASE_URL}/create-event`, {
      data: eventData
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.eventId).toBeDefined();
    expect(result.eventPda).toBeDefined();
    expect(result.txSignature).toBeDefined();
    expect(result.message).toContain('Event created');
  });

  test('should mint ticket via API', async ({ request }) => {
    const mintData = {
      eventPda: '11111111111111111111111111111111', // Mock event PDA
      buyerWallet: '22222222222222222222222222222222', // Mock buyer wallet
      amount: 50000000, // 50 USDC
      customTraits: ['seat:A1', 'perk:VIP'],
      zkEnabled: false
    };

    const response = await request.post(`${BASE_URL}/mint-ticket`, {
      data: mintData
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.nftMint).toBeDefined();
    expect(result.txSignatures).toBeDefined();
    expect(result.customTraits).toEqual(mintData.customTraits);
    expect(result.qrHash).toBeDefined();
    expect(result.passDownloadUrl).toBeDefined();
    expect(result.message).toContain('CPI chain');
  });

  test('should verify QR via API', async ({ request }) => {
    const mockQrHash = 'mock_qr_hash_123456789012345678901234567890';
    
    const response = await request.get(`${BASE_URL}/verify-qr/${mockQrHash}`);

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.valid).toBeDefined();
    expect(result.nftMint).toBe(mockQrHash);
    expect(result.message).toBeDefined();
    expect(result.verifiedAt).toBeDefined();
    expect(result.heliusVerified).toBeDefined();
  });

  test('should handle test mint endpoint', async ({ request }) => {
    const testMintData = {
      eventPda: '11111111111111111111111111111111',
      buyerWallet: '33333333333333333333333333333333',
      amount: 25000000, // 25 USDC
      customTraits: ['seat:B2', 'perk:standard']
    };

    const response = await request.post(`${BASE_URL}/test-mint`, {
      data: testMintData
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.message).toContain('Test mint completed');
    expect(result.webhookResult).toBeDefined();
  });

  test('should handle MoonPay webhook simulation', async ({ request }) => {
    const webhookData = {
      type: 'transaction_updated',
      data: {
        status: 'completed',
        externalTransactionId: `test_${Date.now()}`,
        quoteCurrencyAmount: 50,
        quoteCurrency: 'USD',
        walletAddress: '44444444444444444444444444444444',
        widgetCustomization: {
          eventPda: '11111111111111111111111111111111',
          customTraits: ['seat:C3']
        }
      }
    };

    const response = await request.post(`${BASE_URL}/moonpay-callback`, {
      data: webhookData,
      headers: {
        'moonpay-signature': 'test_signature'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.message).toContain('CPI chain');
    expect(result.nftMint).toBeDefined();
    expect(result.txSignatures).toBeDefined();
  });

  test('should sign MoonPay URL', async ({ request }) => {
    const urlData = {
      url: 'https://buy.moonpay.com/test-url'
    };

    const response = await request.post(`${BASE_URL}/sign-moonpay-url`, {
      data: urlData
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.signedUrl).toBeDefined();
    expect(result.signature).toBeDefined();
  });

  test('should download pass stub', async ({ request }) => {
    const mockMint = 'mock_mint_123456789012345678901234567890';
    
    const response = await request.get(`${BASE_URL}/download-pass/${mockMint}`);

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.formatVersion).toBe(1);
    expect(result.passTypeIdentifier).toBe('pass.com.vamano.ticket');
    expect(result.serialNumber).toBe(mockMint);
    expect(result.eventTicket).toBeDefined();
  });

  test('should handle invalid QR verification', async ({ request }) => {
    const invalidQrHash = 'invalid';
    
    const response = await request.get(`${BASE_URL}/verify-qr/${invalidQrHash}`);

    expect(response.status()).toBe(400);
    
    const result = await response.json();
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Invalid QR code format');
  });

  test('should handle missing fields in create event', async ({ request }) => {
    const incompleteData = {
      name: 'Incomplete Event'
      // Missing required fields
    };

    const response = await request.post(`${BASE_URL}/create-event`, {
      data: incompleteData
    });

    expect(response.status()).toBe(400);
    
    const result = await response.json();
    expect(result.error).toContain('Missing required fields');
  });

  test('should handle missing fields in mint ticket', async ({ request }) => {
    const incompleteData = {
      amount: 50000000
      // Missing eventPda and buyerWallet
    };

    const response = await request.post(`${BASE_URL}/mint-ticket`, {
      data: incompleteData
    });

    expect(response.status()).toBe(400);
    
    const result = await response.json();
    expect(result.error).toContain('Missing required fields');
  });

  test('should handle test mint with missing fields', async ({ request }) => {
    const incompleteData = {
      eventPda: '11111111111111111111111111111111'
      // Missing buyerWallet
    };

    const response = await request.post(`${BASE_URL}/test-mint`, {
      data: incompleteData
    });

    expect(response.status()).toBe(400);
    
    const result = await response.json();
    expect(result.error).toContain('Missing eventPda or buyerWallet');
  });
});

test.describe('VAMANO Full Flow Integration Tests', () => {
  const BASE_URL = 'http://localhost:3001';
  
  test('should complete full create → mint → verify flow', async ({ request }) => {
    // Step 1: Create Event
    const eventData = {
      name: 'Integration Test Event',
      date: Date.now(),
      venue: 'Integration Test Venue',
      supply: 50,
      priceUsdc: 30000000, // 30 USDC
      creatorWallet: '55555555555555555555555555555555'
    };

    const createResponse = await request.post(`${BASE_URL}/create-event`, {
      data: eventData
    });
    expect(createResponse.ok()).toBeTruthy();
    
    const createResult = await createResponse.json();
    expect(createResult.success).toBe(true);
    const eventPda = createResult.eventPda;

    // Step 2: Mint Ticket
    const mintData = {
      eventPda: eventPda,
      buyerWallet: '66666666666666666666666666666666',
      amount: eventData.priceUsdc,
      customTraits: ['seat:D4', 'perk:premium'],
      zkEnabled: false
    };

    const mintResponse = await request.post(`${BASE_URL}/mint-ticket`, {
      data: mintData
    });
    expect(mintResponse.ok()).toBeTruthy();
    
    const mintResult = await mintResponse.json();
    expect(mintResult.success).toBe(true);
    const qrHash = mintResult.qrHash;

    // Step 3: Verify Ticket
    const verifyResponse = await request.get(`${BASE_URL}/verify-qr/${qrHash}`);
    expect(verifyResponse.ok()).toBeTruthy();
    
    const verifyResult = await verifyResponse.json();
    expect(verifyResult.valid).toBeDefined();
    expect(verifyResult.nftMint).toBeDefined();

    // Verify the flow completed successfully
    console.log('✅ Full flow completed:', {
      eventCreated: createResult.success,
      ticketMinted: mintResult.success,
      ticketVerified: verifyResult.valid !== undefined,
      eventPda,
      qrHash
    });
  });

  test('should handle MoonPay webhook → mint flow', async ({ request }) => {
    // Step 1: Create Event (prerequisite)
    const eventData = {
      name: 'MoonPay Test Event',
      date: Date.now(),
      venue: 'MoonPay Test Venue',
      supply: 25,
      priceUsdc: 40000000, // 40 USDC
      creatorWallet: '77777777777777777777777777777777'
    };

    const createResponse = await request.post(`${BASE_URL}/create-event`, {
      data: eventData
    });
    expect(createResponse.ok()).toBeTruthy();
    
    const createResult = await createResponse.json();
    const eventPda = createResult.eventPda;

    // Step 2: Simulate MoonPay Webhook
    const webhookData = {
      type: 'transaction_updated',
      data: {
        status: 'completed',
        externalTransactionId: `integration_test_${Date.now()}`,
        quoteCurrencyAmount: 40,
        quoteCurrency: 'USD',
        walletAddress: '88888888888888888888888888888888',
        widgetCustomization: {
          eventPda: eventPda,
          customTraits: ['seat:E5', 'perk:exclusive']
        }
      }
    };

    const webhookResponse = await request.post(`${BASE_URL}/moonpay-callback`, {
      data: webhookData,
      headers: {
        'moonpay-signature': 'integration_test_signature'
      }
    });
    expect(webhookResponse.ok()).toBeTruthy();
    
    const webhookResult = await webhookResponse.json();
    expect(webhookResult.success).toBe(true);
    expect(webhookResult.nftMint).toBeDefined();
    expect(webhookResult.txSignatures).toBeDefined();

    console.log('✅ MoonPay webhook flow completed:', {
      eventCreated: createResult.success,
      webhookProcessed: webhookResult.success,
      nftMinted: webhookResult.nftMint,
      eventPda
    });
  });
});
