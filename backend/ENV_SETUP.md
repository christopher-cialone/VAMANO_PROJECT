# Backend Environment Setup

## Required Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

### Solana Configuration
```bash
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your_base58_private_key_here
```

### MoonPay Configuration (Sandbox)
Get your keys from: https://dashboard.moonpay.com/developers

```bash
MOONPAY_API_KEY=pk_test_your_public_key_here
MOONPAY_SECRET=sk_test_your_secret_key_here
```

**Creator KYB Setup:**
1. Go to https://dashboard.moonpay.com/kyb
2. Complete business verification
3. This enables:
   - USD payments to your bank account
   - USDC payments to your Solana wallet
   - Compliance with payment regulations

### Helius Configuration
Get your API key from: https://dev.helius.xyz/dashboard/app

```bash
HELIUS_API_KEY=your_helius_api_key_here
```

### PassKit Configuration
**Apple Developer Account Required ($99/year)**

Instructions: https://developer.apple.com/documentation/walletpasses

```bash
PASSKIT_PASS_TYPE_ID=pass.com.vamano.ticket
PASSKIT_TEAM_ID=YOUR_APPLE_TEAM_ID
PASSKIT_WWDR_PATH=./certs/wwdr.pem
PASSKIT_CERT_PATH=./certs/signerCert.pem
PASSKIT_KEY_PATH=./certs/signerKey.pem
PASSKIT_KEY_PASSWORD=optional_key_password
```

**Certificate Setup:**
1. Create a Pass Type ID in Apple Developer Console
2. Generate a certificate signing request (CSR)
3. Download the certificate and convert to PEM format
4. Place certificates in `backend/certs/` directory

### Light Protocol (Optional - ZK Privacy)
```bash
LIGHT_PROTOCOL_RPC_URL=https://zk-devnet.lightprotocol.com
```

### Server Configuration
```bash
PORT=3001
NODE_ENV=development
```

## Testing with Mock Values

For development, you can use mock values:
- `MOONPAY_SECRET=test_secret_123`
- `HELIUS_API_KEY=mock_helius_key`
- PassKit will use mock pass generation without real certs



