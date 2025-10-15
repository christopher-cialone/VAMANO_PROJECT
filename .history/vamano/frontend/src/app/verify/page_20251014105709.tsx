'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VerifyPage() {
  const [qrCode, setQrCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!qrCode.trim()) return;
    
    setIsVerifying(true);
    try {
      // Mock verification - in production, this would call the backend
      const response = await fetch(`/api/verify-qr/${qrCode}`);
      const result = await response.json();
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationResult({
        valid: false,
        message: 'Verification failed. Please try again.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <header className="border-b border-green-400/20 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-wider text-green-400">
            VAMANO
          </Link>
          <div className="text-sm text-gray-400">
            TICKET VERIFICATION
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-400 mb-4">
            VERIFY TICKET
          </h1>
          <p className="text-gray-300 text-lg">
            Scan QR code or enter ticket hash to verify authenticity
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Scanner */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-400">QR Scanner</h2>
            
            <div className="border border-green-400/30 bg-green-400/5 rounded p-8 text-center">
              <div className="mb-4">
                <div className="w-64 h-64 mx-auto border border-green-400/30 bg-black rounded flex items-center justify-center">
                  <div className="text-gray-500">
                    <div className="text-sm mb-2">Camera Feed</div>
                    <div className="text-xs">QR Scanner would appear here</div>
                  </div>
                </div>
              </div>
              
              <button className="px-6 py-3 bg-green-400 text-black font-bold hover:bg-green-300 transition-colors">
                START CAMERA
              </button>
            </div>

            <div className="text-sm text-gray-400">
              <div className="mb-2">Supported formats:</div>
              <div>• QR Code from Apple Wallet</div>
              <div>• Direct ticket hash</div>
              <div>• NFT mint address</div>
            </div>
          </div>

          {/* Manual Input */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-400">Manual Input</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">
                  Ticket Hash / QR Data
                </label>
                <textarea
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Paste QR code data or enter ticket hash..."
                  className="w-full h-32 px-4 py-3 bg-black border border-green-400/30 text-green-400 placeholder-gray-500 focus:border-green-400 focus:outline-none resize-none font-mono text-sm"
                />
              </div>

              <button
                onClick={handleVerify}
                disabled={!qrCode.trim() || isVerifying}
                className="w-full px-6 py-3 bg-green-400 text-black font-bold hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'VERIFYING...' : 'VERIFY TICKET'}
              </button>
            </div>

            {/* Verification Result */}
            {verificationResult && (
              <div className={`p-6 rounded border ${
                verificationResult.valid 
                  ? 'border-green-400/30 bg-green-400/5' 
                  : 'border-red-400/30 bg-red-400/5'
              }`}>
                <div className="flex items-center mb-4">
                  <div className={`w-4 h-4 rounded-full mr-3 ${
                    verificationResult.valid ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <div className={`font-bold ${
                    verificationResult.valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {verificationResult.valid ? 'VALID TICKET' : 'INVALID TICKET'}
                  </div>
                </div>
                
                {verificationResult.valid ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Event:</span>
                      <span className="text-green-300">{verificationResult.event}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Owner:</span>
                      <span className="text-green-300 font-mono text-xs">
                        {verificationResult.owner?.slice(0, 8)}...{verificationResult.owner?.slice(-8)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">NFT Mint:</span>
                      <span className="text-green-300 font-mono text-xs">
                        {verificationResult.nftMint?.slice(0, 8)}...{verificationResult.nftMint?.slice(-8)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-green-300">Active</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-300 text-sm">
                    {verificationResult.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 border border-green-400/20 bg-green-400/5 rounded">
          <h3 className="text-lg font-bold text-green-400 mb-4">Verification Details</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-gray-300 mb-2">On-Chain Verification:</div>
              <div className="text-gray-400 space-y-1">
                <div>• NFT ownership checked via Helius RPC</div>
                <div>• Event metadata validated</div>
                <div>• Transfer history verified</div>
              </div>
            </div>
            <div>
              <div className="text-gray-300 mb-2">Privacy Features:</div>
              <div className="text-gray-400 space-y-1">
                <div>• No personal data stored</div>
                <div>• Anonymous verification</div>
                <div>• ZK proofs supported</div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link 
            href="/"
            className="inline-block px-6 py-3 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors"
          >
            BACK TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}


