# VAMANO 🎫

> **Cypherpunk NFT Ticketing Platform**  
> *Sovereignty • Privacy • Dual Storage*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Devnet-purple.svg)](https://solana.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)
[![Anchor](https://img.shields.io/badge/Anchor-0.30.1-blue.svg)](https://anchor-lang.com)

A decentralized event ticketing platform built on Solana, featuring on-chain Metaplex Core NFTs, Apple Wallet integration, and optional ZK privacy features. Built for the cypherpunk ethos of sovereignty, privacy, and decentralization.

## 🌟 Features

### Core Features
- **🎫 On-Chain NFTs**: Metaplex Core compressed NFTs for immutable ownership
- **📱 Apple Wallet**: Native iOS integration with PassKit for easy scanning
- **💾 Dual Storage**: On-chain ownership + off-chain convenience
- **🔒 Privacy**: Optional ZK shielding via Light Protocol
- **💳 Payments**: MoonPay (fiat) + Solana Pay (crypto)
- **💰 Royalties**: Automated 10% splits on resales (5% artist, 3% organizer, 2% platform)
- **✅ Verification**: Helius RPC for instant ticket validation

### Creator Experience
- **🎨 Visual Builder**: Three-section ticket builder with live preview
- **🎭 Cypherpunk UI**: Terminal-inspired design with glitch effects
- **📊 Pro Features**: Advanced programmable rules and customization
- **🔐 Non-Custodial**: Users control their own keys and data

## 🏗️ Architecture

```
vamano/
├── frontend/          # Next.js React app with cypherpunk UI
│   ├── src/app/       # App router pages
│   ├── src/components/# React components
│   └── public/        # Static assets
├── backend/           # Node.js Express API
│   ├── server.ts      # Main API server
│   ├── routes/        # API endpoints
│   └── services/      # Business logic
├── programs/          # Anchor Solana programs
│   └── vamano-program/# Rust program source
├── tests/             # E2E tests with Playwright
│   ├── tests/         # Test specifications
│   └── playwright.config.ts
└── scripts/           # Deployment and utility scripts
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Yarn** 4+ (Berry)
- **Solana CLI** (latest)
- **Anchor CLI** 0.30.1+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vamano.git
cd vamano

# Install dependencies
yarn install

# Start development servers
yarn dev
```

### Environment Setup

Create environment files:

**`backend/.env`**
```env
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your_private_key_here

# Helius API Key for RPC and verification
HELIUS_API_KEY=your_helius_api_key_here

# MoonPay Configuration
MOONPAY_API_KEY=your_moonpay_api_key_here
MOONPAY_SECRET_KEY=your_moonpay_secret_key_here

# PassKit Configuration
PASSKIT_TEAM_ID=your_apple_team_id
PASSKIT_PASS_TYPE_ID=pass.com.vamano.ticket
PASSKIT_CERTIFICATE_PATH=./certs/certificate.pem
PASSKIT_PRIVATE_KEY_PATH=./certs/private_key.pem

# Server Configuration
PORT=3001
NODE_ENV=development
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_WALLET_ADAPTER_NETWORK=devnet
```

## 🎨 Creator Flow

### 1. Event/Info
- Event name, date, venue
- Ticket supply and pricing
- Event description and metadata

### 2. Logic/Rules (Pro Feature)
- Resale price caps
- Transfer restrictions
- Custom royalty structures
- Time-locked transfers

### 3. Design/Assets
- Theme selection (Cypherpunk, Neon, Minimal)
- Logo upload and branding
- QR code preview
- Apple Wallet pass customization

### 4. Go Live
- Wallet connection (Phantom, Solflare)
- Payment processing (MoonPay/Solana Pay)
- NFT minting and pass generation
- Event activation

## 🔧 Development

### Frontend (Next.js 15)
```bash
cd frontend
yarn dev          # Start dev server (http://localhost:3000)
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
```

### Backend (Node.js + Express)
```bash
cd backend
yarn dev          # Start with ts-node (http://localhost:3001)
yarn build        # Compile TypeScript
yarn start        # Start production server
yarn lint         # Run ESLint
```

### Anchor Program (Rust)
```bash
cd programs/vamano-program
anchor build      # Build program
anchor test       # Run tests
anchor deploy     # Deploy to devnet
anchor keys list  # List program keys
```

### E2E Tests (Playwright)
```bash
cd tests
yarn test         # Run all tests
yarn test:ui      # Run with UI
yarn test:headed  # Run in headed mode
yarn test:debug   # Debug mode
```

## 📱 API Reference

### Backend API (Port 3001)

#### Events
- `POST /create-event` - Create new event
  ```json
  {
    "name": "Cypherpunk Concert 2024",
    "date": 1704067200,
    "venue": "Decentralized Arena",
    "supply": 1000,
    "price": 50,
    "description": "The ultimate cypherpunk experience"
  }
  ```

#### Tickets
- `POST /mint-ticket` - Mint ticket after payment
- `GET /download-pass/:nftMint` - Download Apple Wallet pass
- `GET /verify-qr/:qrHash` - Verify ticket QR code

#### Webhooks
- `POST /moonpay-callback` - MoonPay payment webhook
- `POST /solana-pay-callback` - Solana Pay webhook

#### Health
- `GET /health` - Health check endpoint

## 🔐 Security Features

### On-Chain Security
- **PDA-based Events**: Program Derived Addresses for unique event identification
- **Royalty Enforcement**: Automated on-chain splits on resales
- **Supply Validation**: Prevents overselling with on-chain checks
- **Ownership Verification**: Cryptographic proof of ticket ownership

### Privacy Features
- **ZK Shielding**: Optional Light Protocol integration
- **Non-Custodial**: Users control their own keys
- **Anonymous Verification**: No personal data required
- **Shielded Transfers**: Privacy-preserving ticket transfers

### API Security
- **Rate Limiting**: Prevents abuse and spam
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses
- **CORS Configuration**: Proper cross-origin setup

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Render/Heroku)
```bash
cd backend
# Deploy to your preferred platform
# Ensure environment variables are set
```

### Anchor Program (Devnet/Mainnet)
```bash
cd programs/vamano-program
anchor deploy --provider.cluster devnet
# or
anchor deploy --provider.cluster mainnet-beta
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user flow testing
- **Smart Contract Tests**: Anchor program testing

### Running Tests
```bash
# All tests
yarn test

# Frontend tests
yarn workspace frontend test

# Backend tests
yarn workspace backend test

# E2E tests
yarn workspace tests test

# Smart contract tests
cd programs/vamano-program && anchor test
```

## 📚 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Wallet**: Solana Wallet Adapter
- **UI Components**: Custom cypherpunk components

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: In-memory (production: PostgreSQL)
- **Blockchain**: Solana Web3.js

### Blockchain
- **Network**: Solana Devnet/Mainnet
- **Framework**: Anchor 0.30.1
- **NFTs**: Metaplex Core 1.7.0
- **Tokens**: SPL Token
- **RPC**: Helius SDK 0.15

### Payments
- **Fiat**: MoonPay Widget 2.3
- **Crypto**: Solana Pay
- **Tokens**: USDC, SOL

### Privacy
- **ZK**: Light Protocol 0.4 (stubs)
- **Shielding**: Optional privacy features

### Testing
- **E2E**: Playwright
- **Unit**: Jest
- **Smart Contracts**: Anchor Test

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`yarn test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style
- TypeScript for all new code
- ESLint + Prettier for formatting
- Conventional commits for commit messages
- Comprehensive test coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎭 Cypherpunk Ethos

VAMANO embodies the core cypherpunk principles:

- **🔒 Privacy by Design**: Optional ZK features and anonymous verification
- **🌐 Decentralization**: No central authority, pure on-chain logic
- **👑 Sovereignty**: Users control their data and keys
- **🔍 Transparency**: Open source, auditable code
- **⚡ Innovation**: Cutting-edge blockchain technology

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Basic NFT minting
- [x] Apple Wallet integration
- [x] Payment processing
- [x] QR verification
- [x] Creator UI

### Phase 2 (Next)
- [ ] Full Anchor program deployment
- [ ] Real PassKit integration
- [ ] MoonPay production setup
- [ ] ZK privacy implementation
- [ ] Mobile app

### Phase 3 (Future)
- [ ] Multi-chain support
- [ ] Advanced programmable rules
- [ ] DAO governance
- [ ] Marketplace integration
- [ ] Analytics dashboard

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/yourusername/vamano/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/vamano/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/vamano/discussions)
- **Discord**: [Join our community](https://discord.gg/vamano)

## 🙏 Acknowledgments

- **Solana Foundation** for the amazing blockchain platform
- **Metaplex** for the NFT standards and tooling
- **Anchor** for the developer framework
- **Cypherpunk Community** for the inspiration and ethos

---

**Built with ❤️ for the decentralized future**

*"Privacy is necessary for an open society in the electronic age. Privacy is not secrecy."* - Eric Hughes, A Cypherpunk's Manifesto