# Contributing to VAMANO

Thank you for your interest in contributing to VAMANO! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include system information and logs
- Check existing issues before creating new ones

### Suggesting Features
- Open a discussion or issue with the "enhancement" label
- Describe the use case and expected behavior
- Consider the cypherpunk ethos and decentralization principles

### Code Contributions
- Fork the repository
- Create a feature branch
- Make your changes
- Add tests
- Submit a pull request

## 🏗️ Development Setup

### Prerequisites
- Node.js 18+
- Yarn 4+ (Berry)
- Solana CLI
- Anchor CLI 0.30.1+
- Git

### Local Development
```bash
# Clone your fork
git clone https://github.com/yourusername/vamano.git
cd vamano

# Install dependencies
yarn install

# Start development servers
yarn dev
```

### Environment Setup
Create the necessary `.env` files as described in the README.

## 📝 Code Style

### TypeScript
- Use TypeScript for all new code
- Follow the existing type patterns
- Use strict type checking
- Prefer interfaces over types for object shapes

### React/Next.js
- Use functional components with hooks
- Follow the App Router patterns
- Use Tailwind CSS for styling
- Maintain the cypherpunk aesthetic

### Rust (Anchor)
- Follow Rust naming conventions
- Use descriptive variable names
- Add comprehensive error handling
- Include documentation comments

### General
- Use meaningful commit messages
- Follow conventional commits format
- Keep functions small and focused
- Add comments for complex logic

## 🧪 Testing

### Test Requirements
- All new features must include tests
- Maintain or improve test coverage
- Test both success and error cases
- Include integration tests for API changes

### Running Tests
```bash
# All tests
yarn test

# Specific test suites
yarn workspace frontend test
yarn workspace backend test
yarn workspace tests test
```

## 📋 Pull Request Process

### Before Submitting
1. Ensure all tests pass
2. Run linting and fix any issues
3. Update documentation if needed
4. Test your changes thoroughly

### PR Description
- Clearly describe what the PR does
- Reference any related issues
- Include screenshots for UI changes
- List any breaking changes

### Review Process
- All PRs require review
- Address feedback promptly
- Keep PRs focused and small
- Be responsive to questions

## 🎭 Cypherpunk Principles

When contributing, keep these principles in mind:

### Privacy
- Default to privacy-preserving solutions
- Avoid collecting unnecessary data
- Use ZK proofs where appropriate
- Respect user anonymity

### Decentralization
- Avoid central points of failure
- Use on-chain solutions when possible
- Minimize reliance on external services
- Promote user sovereignty

### Transparency
- Write clear, readable code
- Document complex logic
- Use open standards
- Avoid proprietary solutions

### Security
- Follow security best practices
- Validate all inputs
- Handle errors gracefully
- Consider attack vectors

## 🐛 Bug Reports

When reporting bugs, please include:

### Environment
- Operating system and version
- Node.js version
- Browser version (for frontend issues)
- Solana CLI version

### Steps to Reproduce
1. Clear, numbered steps
2. Expected behavior
3. Actual behavior
4. Screenshots or logs

### Additional Information
- Error messages
- Console logs
- Network requests
- Any workarounds found

## 🚀 Feature Requests

### Before Requesting
- Check existing issues and discussions
- Consider the project's scope and goals
- Think about the cypherpunk ethos
- Consider implementation complexity

### Request Format
- Clear title and description
- Use case and motivation
- Proposed solution
- Alternatives considered
- Additional context

## 📚 Documentation

### Code Documentation
- Document public APIs
- Include examples in comments
- Update README for new features
- Maintain API documentation

### User Documentation
- Keep README up to date
- Add screenshots for UI changes
- Document configuration options
- Provide troubleshooting guides

## 🔒 Security

### Security Issues
- Report security issues privately
- Use the security advisory feature
- Don't disclose vulnerabilities publicly
- Follow responsible disclosure

### Code Security
- Validate all inputs
- Use parameterized queries
- Avoid hardcoded secrets
- Follow OWASP guidelines

## 🎨 Design Guidelines

### UI/UX
- Maintain the cypherpunk aesthetic
- Use green/black color scheme
- Include terminal-style elements
- Ensure accessibility

### Branding
- Use the VAMANO brand consistently
- Follow the established visual style
- Maintain the rebellious spirit
- Keep it professional yet edgy

## 📞 Communication

### Channels
- GitHub Issues for bugs and features
- GitHub Discussions for questions
- Discord for community chat
- Email for security issues

### Etiquette
- Be respectful and constructive
- Help others when possible
- Stay on topic
- Follow the code of conduct

## 🏆 Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- Project documentation
- Community highlights

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to VAMANO! Together, we're building the future of decentralized ticketing.**


