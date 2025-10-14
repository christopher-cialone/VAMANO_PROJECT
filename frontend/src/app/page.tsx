'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isGlitch, setIsGlitch] = useState(false);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,0,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2300ff00%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-green-400/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold tracking-wider">
              <span className="text-green-400">VAMANO</span>
              <span className="text-gray-400 text-sm ml-2">[v0.1.0]</span>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#about" className="hover:text-green-300 transition-colors">ABOUT</a>
            <a href="#features" className="hover:text-green-300 transition-colors">FEATURES</a>
            <a href="#docs" className="hover:text-green-300 transition-colors">DOCS</a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10">
        {/* Hero section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <h1 
                className={`text-6xl md:text-8xl font-bold mb-6 transition-all duration-300 ${
                  isGlitch ? 'animate-pulse text-red-400' : 'text-green-400'
                }`}
                onMouseEnter={() => setIsGlitch(true)}
                onMouseLeave={() => setIsGlitch(false)}
              >
                VAMANO
              </h1>
              <div className="text-xl md:text-2xl text-gray-300 mb-4">
                <span className="text-green-400">&gt;</span> cypherpunk NFT ticketing
              </div>
              <div className="text-lg text-gray-400 mb-8">
                sovereignty • privacy • dual storage
              </div>
            </div>

            <div className="mb-12">
              <div className="inline-block p-4 border border-green-400/30 bg-green-400/5 rounded">
                <div className="text-sm text-green-300">
                  <div>// Decentralized event ticketing</div>
                  <div>// On-chain Metaplex Core NFTs</div>
                  <div>// Apple Wallet integration</div>
                  <div>// ZK privacy optional</div>
                  <div>// Automated royalties</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/builder"
                className="px-8 py-4 bg-green-400 text-black font-bold hover:bg-green-300 transition-colors border-2 border-green-400 hover:border-green-300"
              >
                CREATE EVENT
              </Link>
              <button className="px-8 py-4 border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors">
                VERIFY TICKET
              </button>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="py-20 px-6 border-t border-green-400/20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 text-green-400">
              FEATURES
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 border border-green-400/20 bg-green-400/5 rounded">
                <h3 className="text-xl font-bold mb-4 text-green-300">ON-CHAIN NFTS</h3>
                <p className="text-gray-300 mb-4">
                  Metaplex Core compressed NFTs for ownership and royalties. 
                  Immutable proof of ticket ownership on Solana.
                </p>
                <div className="text-sm text-green-400 font-mono">
                  mpl_core::create_asset()
                </div>
              </div>

              <div className="p-6 border border-green-400/20 bg-green-400/5 rounded">
                <h3 className="text-xl font-bold mb-4 text-green-300">APPLE WALLET</h3>
                <p className="text-gray-300 mb-4">
                  Native iOS integration with PassKit. QR codes for easy scanning.
                  Works offline, syncs with on-chain data.
                </p>
                <div className="text-sm text-green-400 font-mono">
                  passkit-generator v3.1
                </div>
              </div>

              <div className="p-6 border border-green-400/20 bg-green-400/5 rounded">
                <h3 className="text-xl font-bold mb-4 text-green-300">PRIVACY</h3>
                <p className="text-gray-300 mb-4">
                  Optional ZK shielding via Light Protocol. 
                  Shielded transfers for privacy-conscious users.
                </p>
                <div className="text-sm text-green-400 font-mono">
                  light_protocol::shield()
                </div>
              </div>

              <div className="p-6 border border-green-400/20 bg-green-400/5 rounded">
                <h3 className="text-xl font-bold mb-4 text-green-300">PAYMENTS</h3>
                <p className="text-gray-300 mb-4">
                  MoonPay for fiat (credit cards) + Solana Pay for crypto.
                  USDC/SOL accepted with instant settlement.
                </p>
                <div className="text-sm text-green-400 font-mono">
                  moonpay-widget v2.3
                </div>
              </div>

              <div className="p-6 border border-green-400/20 bg-green-400/5 rounded">
                <h3 className="text-xl font-bold mb-4 text-green-300">ROYALTIES</h3>
                <p className="text-gray-300 mb-4">
                  Automated 10% royalty splits on resales:
                  5% artist, 3% organizer, 2% platform.
                </p>
                <div className="text-sm text-green-400 font-mono">
                  enforce_royalties()
                </div>
              </div>

              <div className="p-6 border border-green-400/20 bg-green-400/5 rounded">
                <h3 className="text-xl font-bold mb-4 text-green-300">VERIFICATION</h3>
                <p className="text-gray-300 mb-4">
                  Helius RPC for instant verification. 
                  QR scanning with ownership validation.
                </p>
                <div className="text-sm text-green-400 font-mono">
                  helius-sdk v0.15
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-20 px-6 border-t border-green-400/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 text-green-400">
              READY TO DIVE IN?
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Create your first cypherpunk event ticket in minutes.
              No KYC, no central authority, pure sovereignty.
            </p>
            <Link 
              href="/builder"
              className="inline-block px-12 py-6 bg-green-400 text-black font-bold text-xl hover:bg-green-300 transition-colors border-2 border-green-400 hover:border-green-300"
            >
              START BUILDING
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-green-400/20 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <div className="mb-4">
            <span className="text-green-400">VAMANO</span> - Decentralized Event Ticketing
          </div>
          <div className="text-sm">
            Built on Solana • Powered by Metaplex • Privacy by Design
          </div>
        </div>
      </footer>
    </div>
  );
}
