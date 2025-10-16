'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@/components/WalletProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import { MoonPayBuyWidget } from '@moonpay/moonpay-react';
import axios from 'axios';

interface EventData {
  name: string;
  date: string;
  venue: string;
  supply: number;
  price: number;
  description: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function BuilderPage() {
  // Real wallet connection
  const { publicKey, connected } = useWallet();
  
  const [activeTab, setActiveTab] = useState<'event' | 'logic' | 'design'>('event');
  const [eventData, setEventData] = useState<EventData>({
    name: '',
    date: '',
    venue: '',
    supply: 100,
    price: 50,
    description: ''
  });
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [showMoonPayWidget, setShowMoonPayWidget] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNft, setMintedNft] = useState<string | null>(null);
  const [passDownloadUrl, setPassDownloadUrl] = useState<string | null>(null);

  const handleInputChange = (field: keyof EventData, value: string | number) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    setShowAccountModal(true);
  };

  const handleGoLive = async () => {
    // Wallet guard
    if (!connected || !publicKey) {
      alert('Please connect your wallet first!');
      console.log('Go Live blocked: No wallet connected');
      return;
    }

    if (!eventData.name || !eventData.date || !eventData.venue) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Go Live clicked, wallet:', publicKey.toBase58());
    
    setIsCreatingEvent(true);
    try {
      // Create event on backend
      const response = await axios.post(`${BACKEND_URL}/create-event`, {
        name: eventData.name,
        date: new Date(eventData.date).getTime() / 1000,
        venue: eventData.venue,
        supply: eventData.supply,
        priceUsdc: eventData.price * 100, // Convert to cents
        metadataUri: `https://arweave.net/${eventData.name.toLowerCase().replace(/\s+/g, '-')}`,
        creatorWallet: publicKey.toBase58()
      });

      if (response.data.success) {
        setEventId(response.data.eventPda || response.data.eventId);
        console.log('Event created successfully:', response.data);
        
        // Open MoonPay widget after event creation
        setShowMoonPayWidget(true);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleBuyTicket = () => {
    if (!eventId) {
      alert('Please create an event first');
      return;
    }
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }
    setShowMoonPayWidget(true);
  };

  const handleMoonPaySuccess = async (transactionId: string) => {
    console.log('MoonPay transaction completed:', transactionId);
    setShowMoonPayWidget(false);
    setIsMinting(true);

    try {
      // Call backend to mint ticket after successful payment
      const response = await axios.post(`${BACKEND_URL}/mint-ticket`, {
        eventId,
        paymentTxHash: transactionId,
        buyerWallet: publicKey,
        amount: eventData.price,
        qrHash: `moonpay_qr_${transactionId}`,
        zkEnabled: false
      });

      if (response.data.success) {
        setMintedNft(response.data.nftMint);
        setPassDownloadUrl(response.data.passDownloadUrl);
        alert('Ticket minted successfully! You can now download your Apple Wallet Pass.');
      }
    } catch (error) {
      console.error('Error minting ticket:', error);
      alert('Payment successful but ticket minting failed. Please contact support.');
    } finally {
      setIsMinting(false);
    }
  };

  const handleMoonPayError = (error: any) => {
    console.error('MoonPay error:', error);
    alert(`Payment failed: ${error?.message || 'Unknown error'}`);
    setShowMoonPayWidget(false);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <header className="border-b border-green-400/20 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-wider text-green-400">
            VAMANO
          </Link>
          <div className="flex items-center space-x-4">
            <WalletMultiButton className="!bg-transparent !border !border-green-400 !text-green-400 hover:!bg-green-400 hover:!text-black !transition-colors !font-mono" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className={`text-sm ${activeTab === 'event' ? 'text-green-400' : 'text-gray-500'}`}>
              1. EVENT/INFO
            </div>
            <div className="w-8 h-px bg-gray-600"></div>
            <div className={`text-sm ${activeTab === 'logic' ? 'text-green-400' : 'text-gray-500'}`}>
              2. LOGIC/RULES
            </div>
            <div className="w-8 h-px bg-gray-600"></div>
            <div className={`text-sm ${activeTab === 'design' ? 'text-green-400' : 'text-gray-500'}`}>
              3. DESIGN/ASSETS
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex border border-green-400/20 rounded">
            <button
              onClick={() => setActiveTab('event')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'event'
                  ? 'bg-green-400 text-black'
                  : 'text-green-400 hover:bg-green-400/10'
              }`}
            >
              EVENT/INFO
            </button>
            <button
              onClick={() => setActiveTab('logic')}
              className={`px-6 py-3 text-sm font-medium transition-colors border-l border-green-400/20 ${
                activeTab === 'logic'
                  ? 'bg-green-400 text-black'
                  : 'text-green-400 hover:bg-green-400/10'
              }`}
            >
              LOGIC/RULES
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`px-6 py-3 text-sm font-medium transition-colors border-l border-green-400/20 ${
                activeTab === 'design'
                  ? 'bg-green-400 text-black'
                  : 'text-green-400 hover:bg-green-400/10'
              }`}
            >
              DESIGN/ASSETS
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left panel - Form */}
          <div className="lg:col-span-2">
            {activeTab === 'event' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-green-400 mb-6">Event Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-green-300 mb-2">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      value={eventData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-green-400/30 text-green-400 placeholder-gray-500 focus:border-green-400 focus:outline-none"
                      placeholder="Cypherpunk Concert 2024"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-green-300 mb-2">
                        Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={eventData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="w-full px-4 py-3 bg-black border border-green-400/30 text-green-400 focus:border-green-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-300 mb-2">
                        Venue *
                      </label>
                      <input
                        type="text"
                        value={eventData.venue}
                        onChange={(e) => handleInputChange('venue', e.target.value)}
                        className="w-full px-4 py-3 bg-black border border-green-400/30 text-green-400 placeholder-gray-500 focus:border-green-400 focus:outline-none"
                        placeholder="Decentralized Arena"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-green-300 mb-2">
                        Ticket Supply *
                      </label>
                      <input
                        type="number"
                        value={eventData.supply}
                        onChange={(e) => handleInputChange('supply', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-black border border-green-400/30 text-green-400 focus:border-green-400 focus:outline-none"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-300 mb-2">
                        Price (USDC) *
                      </label>
                      <input
                        type="number"
                        value={eventData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                        className="w-full px-4 py-3 bg-black border border-green-400/30 text-green-400 focus:border-green-400 focus:outline-none"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={eventData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-black border border-green-400/30 text-green-400 placeholder-gray-500 focus:border-green-400 focus:outline-none resize-none"
                      placeholder="Describe your event..."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logic' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-green-400 mb-6">Logic & Rules</h2>
                
                <div className="p-6 border border-gray-600/30 bg-gray-900/20 rounded">
                  <div className="text-center text-gray-400 mb-4">
                    <div className="text-lg font-bold mb-2">PRO FEATURES</div>
                    <div className="text-sm">Advanced programmable rules require Pro upgrade</div>
                  </div>
                  
                  <div className="space-y-4 opacity-50">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Resale Price Cap
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          className="flex-1"
                          disabled
                        />
                        <span className="text-sm text-gray-500">No limit</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Transfer Restrictions
                      </label>
                      <select className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-gray-400" disabled>
                        <option>Allow all transfers</option>
                        <option>Restrict to whitelist</option>
                        <option>Time-locked transfers</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Royalty Structure
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">Artist</label>
                          <input type="number" value="5" disabled className="w-full px-2 py-1 bg-gray-800 border border-gray-600 text-gray-400" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Organizer</label>
                          <input type="number" value="3" disabled className="w-full px-2 py-1 bg-gray-800 border border-gray-600 text-gray-400" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Platform</label>
                          <input type="number" value="2" disabled className="w-full px-2 py-1 bg-gray-800 border border-gray-600 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-6 px-4 py-3 bg-green-400 text-black font-bold hover:bg-green-300 transition-colors">
                    UPGRADE TO PRO
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-green-400 mb-6">Design & Assets</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-green-300 mb-2">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <button className="p-4 border border-green-400/30 bg-green-400/5 rounded hover:border-green-400 transition-colors">
                        <div className="text-sm font-medium text-green-300">Cypherpunk</div>
                        <div className="text-xs text-gray-400">Matrix green</div>
                      </button>
                      <button className="p-4 border border-gray-600/30 bg-gray-800/20 rounded hover:border-gray-500 transition-colors">
                        <div className="text-sm font-medium text-gray-300">Neon</div>
                        <div className="text-xs text-gray-500">Purple/pink</div>
                      </button>
                      <button className="p-4 border border-gray-600/30 bg-gray-800/20 rounded hover:border-gray-500 transition-colors">
                        <div className="text-sm font-medium text-gray-300">Minimal</div>
                        <div className="text-xs text-gray-500">Black/white</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-300 mb-2">
                      Logo Upload
                    </label>
                    <div className="border-2 border-dashed border-green-400/30 rounded p-8 text-center">
                      <div className="text-gray-400 mb-2">Drop your logo here</div>
                      <div className="text-sm text-gray-500">PNG, JPG up to 2MB</div>
                      <input type="file" className="hidden" accept="image/*" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-300 mb-2">
                      QR Code Preview
                    </label>
                    <div className="w-32 h-32 border border-green-400/30 bg-green-400/5 rounded flex items-center justify-center">
                      <div className="text-xs text-gray-500">QR Preview</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel - Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h3 className="text-lg font-bold text-green-400 mb-4">Ticket Preview</h3>
              
              <div className="border border-green-400/30 bg-green-400/5 rounded p-6">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    {eventData.name || 'Event Name'}
                  </div>
                  <div className="text-sm text-gray-300">
                    {eventData.venue || 'Venue'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {eventData.date ? new Date(eventData.date).toLocaleDateString() : 'Date'}
                  </div>
                </div>

                <div className="border-t border-green-400/20 pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-green-400">{eventData.price} USDC</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Supply:</span>
                    <span className="text-green-400">{eventData.supply}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-green-400">NFT + Apple Wallet</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-black/50 rounded text-xs text-gray-400">
                  <div>// On-chain: Metaplex Core NFT</div>
                  <div>// Off-chain: Apple Wallet Pass</div>
                  <div>// Royalties: 10% automated</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-green-400/20">
          <button
            onClick={handleSaveDraft}
            className="px-6 py-3 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors"
          >
            SAVE DRAFT
          </button>
          
          <div className="flex space-x-4">
            <button className="px-6 py-3 border border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors">
              PREVIEW
            </button>
            <button
              onClick={handleGoLive}
              disabled={!connected || !eventData.name || !eventData.date || !eventData.venue || isCreatingEvent}
              className={`px-8 py-3 font-bold transition-colors ${
                connected && eventData.name && eventData.date && eventData.venue && !isCreatingEvent
                  ? 'bg-green-400 text-black hover:bg-green-300'
                  : 'bg-gray-500 text-gray-300 opacity-50 cursor-not-allowed'
              }`}
              title={!connected ? 'Connect wallet first' : !eventData.name || !eventData.date || !eventData.venue ? 'Fill in all required fields' : 'Create event and open payment'}
            >
              {isCreatingEvent ? 'CREATING...' : !connected ? 'CONNECT WALLET FIRST' : 'GO LIVE'}
            </button>
            
            {eventId && (
              <button
                onClick={handleBuyTicket}
                disabled={isMinting}
                className="px-8 py-3 bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMinting ? 'MINTING...' : '💳 BUY TICKET (FIAT)'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-green-400/30 rounded p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-green-400 mb-6">Connect Account</h3>
            
            <div className="space-y-4">
              <button className="w-full p-4 border border-green-400/30 bg-green-400/5 rounded hover:bg-green-400/10 transition-colors">
                <div className="text-green-300 font-medium">Connect Phantom Wallet</div>
                <div className="text-sm text-gray-400">Recommended for creators</div>
              </button>
              
              <button className="w-full p-4 border border-gray-600/30 bg-gray-800/20 rounded hover:bg-gray-700/20 transition-colors">
                <div className="text-gray-300 font-medium">Email Signup</div>
                <div className="text-sm text-gray-500">Custodial wallet</div>
              </button>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowAccountModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Wallet connection handled by WalletMultiButton
                  setShowAccountModal(false);
                }}
                className="px-6 py-2 bg-green-400 text-black font-bold hover:bg-green-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MoonPay Widget Modal */}
      {showMoonPayWidget && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-purple-500 rounded-lg max-w-lg w-full relative">
            <div className="p-4 border-b border-purple-500/30 flex justify-between items-center">
              <h3 className="text-xl font-bold text-purple-400">💳 Buy Ticket with Credit Card</h3>
              <button
                onClick={() => setShowMoonPayWidget(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Event:</span>
                  <span className="text-white font-medium">{eventData.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-green-400 font-bold">${eventData.price} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wallet:</span>
                  <span className="text-purple-400 text-xs font-mono">
                    {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
                  </span>
                </div>
              </div>

              {/* MoonPay Widget with Pre-Fill */}
              <MoonPayBuyWidget
                variant="overlay"
                baseCurrencyCode="usd"
                baseCurrencyAmount={eventData.price.toString()}
                defaultCurrencyCode="usdc_sol"
                walletAddress={publicKey?.toBase58() || ''}
                externalCustomerId={eventId || undefined}
                onUrlSignatureRequested={async (url: string) => {
                  // Sign URL for security (production)
                  try {
                    const response = await axios.post(`${BACKEND_URL}/sign-moonpay-url`, { url });
                    console.log('URL signed:', response.data.signature);
                    return response.data.signature;
                  } catch (error) {
                    console.error('URL signing failed:', error);
                    return '';
                  }
                }}
                onLogin={async () => {
                  console.log('MoonPay login initiated');
                }}
                onTransactionCompleted={async (props: any) => {
                  console.log('✅ Transaction completed:', props);
                  setShowMoonPayWidget(false);
                  handleMoonPaySuccess(props?.externalTransactionId || 'test_tx_' + Date.now());
                }}
                onError={async (error: any) => {
                  console.error('❌ MoonPay error:', error);
                  handleMoonPayError(error);
                }}
              />

              {/* Test Card Instructions */}
              <div className="mt-4 p-4 bg-black/70 border border-green-400/30 rounded">
                <div className="text-xs font-bold text-green-400 mb-2">SANDBOX TEST CARDS</div>
                <div className="text-xs text-gray-300 space-y-1 font-mono">
                  <div>💳 Visa: <span className="text-green-400">4242 4242 4242 4242</span></div>
                  <div>📅 Expiry: <span className="text-green-400">12/30</span></div>
                  <div>🔒 CVV: <span className="text-green-400">123</span></div>
                  <div className="mt-2 text-gray-400 font-sans">After payment: NFT mints → Apple Pass ready</div>
                </div>
              </div>
              
              {/* Processing Indicator */}
              {isMinting && (
                <div className="mt-4 p-3 bg-green-400/10 border border-green-400/30 rounded flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-400 border-t-transparent"></div>
                  <span className="text-green-400 text-sm font-medium">Processing Payment...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal (NFT Minted + Pass Download) */}
      {mintedNft && passDownloadUrl && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-green-400 rounded-lg max-w-md w-full">
            <div className="p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-400 mb-4">Ticket Minted!</h3>
              
              <div className="bg-black/50 p-4 rounded mb-6 text-left">
                <div className="text-sm text-gray-400 mb-2">NFT Mint Address:</div>
                <div className="text-xs text-green-400 font-mono break-all">{mintedNft}</div>
              </div>

              <div className="space-y-3">
                <a
                  href={passDownloadUrl}
                  download="vamano-ticket.pkpass"
                  className="block w-full py-3 bg-green-400 text-black font-bold rounded hover:bg-green-300 transition-colors"
                >
                  📲 Add to Apple Wallet
                </a>
                
                <button
                  onClick={() => {
                    setMintedNft(null);
                    setPassDownloadUrl(null);
                  }}
                  className="w-full py-3 border border-green-400 text-green-400 rounded hover:bg-green-400 hover:text-black transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 p-3 bg-black/50 rounded text-xs text-gray-400 space-y-1">
                <div>// NFT stored on Solana Devnet</div>
                <div>// Apple Wallet Pass ready for iOS scanning</div>
                <div>// 10% royalties auto-enforced on resale</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


