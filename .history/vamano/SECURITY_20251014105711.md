# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in VAMANO, please report it responsibly:

### How to Report
1. **DO NOT** create a public GitHub issue
2. Email security details to: security@vamano.dev
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline
- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Resolution**: Within 30 days (depending on severity)

## Security Features

### On-Chain Security
- **PDA-based Events**: Program Derived Addresses prevent collision attacks
- **Supply Validation**: On-chain checks prevent overselling
- **Royalty Enforcement**: Automated splits prevent bypassing
- **Ownership Verification**: Cryptographic proof of ticket ownership

### API Security
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: Prevents abuse and DoS attacks
- **CORS Configuration**: Proper cross-origin request handling
- **Error Handling**: Secure error responses without sensitive data

### Privacy Protection
- **Non-Custodial**: Users control their own keys
- **Minimal Data Collection**: Only necessary data is stored
- **ZK Privacy**: Optional Light Protocol integration
- **Anonymous Verification**: No personal data required

### Wallet Security
- **Key Management**: Private keys never leave user's device
- **Transaction Signing**: All transactions require user approval
- **Wallet Integration**: Secure connection to Phantom, Solflare

## Best Practices

### For Developers
- Never commit private keys or sensitive data
- Use environment variables for configuration
- Validate all user inputs
- Keep dependencies updated
- Follow secure coding practices

### For Users
- Use hardware wallets when possible
- Never share private keys or seed phrases
- Verify transaction details before signing
- Keep wallet software updated
- Use strong, unique passwords

## Security Audit

VAMANO is designed with security in mind, but has not yet undergone a formal security audit. We recommend:

1. **Code Review**: All code is open source and available for review
2. **Community Testing**: Report any issues you discover
3. **Professional Audit**: Planned for future releases

## Contact

For security-related questions or concerns:
- Email: security@vamano.dev
- GitHub: Create a private security advisory
- Discord: #security channel (for general questions)

## Acknowledgments

We thank the security researchers and community members who help keep VAMANO secure through responsible disclosure and ongoing security improvements.


