# Changelog

All notable changes to VAMANO will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Mobile app support
- Advanced programmable rules
- ZK privacy implementation
- Multi-chain support

## [0.1.0] - 2024-10-09

### Added
- Initial release of VAMANO cypherpunk NFT ticketing platform
- Complete monorepo structure with Yarn workspaces
- Frontend: Next.js 15 with cypherpunk UI and wallet integration
- Backend: Node.js Express API with PassKit and MoonPay support
- Anchor Program: Rust smart contracts for NFT minting and royalties
- Testing: Playwright E2E tests and comprehensive test coverage
- DevOps: Docker, CI/CD, and deployment scripts
- Documentation: Comprehensive README, contributing guidelines, and API docs
- Security: Enhanced .gitignore with sensitive data protection

### Features
- **Dual Storage**: On-chain Metaplex Core NFTs + Apple Wallet passes
- **Payment Integration**: MoonPay (fiat) + Solana Pay (crypto)
- **Privacy Features**: ZK stubs and non-custodial design
- **Royalty System**: Automated 10% splits on resales (5% artist, 3% organizer, 2% platform)
- **QR Verification**: Helius RPC validation
- **Cypherpunk Aesthetic**: Terminal-inspired design with glitch effects
- **Creator Flow**: Three-section ticket builder (Event/Info, Logic/Rules, Design/Assets)
- **Wallet Integration**: Solana Wallet Adapter with Phantom support
- **Responsive Design**: Mobile-first with Tailwind CSS

### Technical Details
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Blockchain**: Solana, Anchor 0.30.1, Metaplex Core 1.7.0
- **Testing**: Playwright, Jest
- **DevOps**: Docker, GitHub Actions, Vercel deployment ready

### Security
- Comprehensive .gitignore with sensitive data protection
- Non-custodial wallet integration
- Input validation and sanitization
- Rate limiting and CORS configuration
- Secure error handling

### Documentation
- Detailed README with setup instructions
- API documentation with examples
- Contributing guidelines
- Security policy
- MIT license

## [0.0.1] - 2024-10-09

### Added
- Project initialization
- Basic project structure
- Initial commit with core files
