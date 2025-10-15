'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@/components/WalletProvider';
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
  const [connected, setConnected] = useState(false);
  const [publicKey] = useState<string | null>('MockWallet123...');
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

  const handleInputChange = (field: keyof EventData, value: string | number) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    setShowAccountModal(true);
  };

  const handleGoLive = async () => {
    if (!eventData.name || !eventData.date || !eventData.venue) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreatingEvent(true);
    try {
      // Create event on backend
      const response = await axios.post(`${BACKEND_URL}/create-event`, {
        name: eventData.name,
        date: new Date(eventData.date).getTime() / 1000,
        venue: eventData.venue,
        supply: eventData.supply,
        metadataUri: `https://arweave.net/${eventData.name.toLowerCase().replace(/\s+/g, '-')}`,
        creatorWallet: publicKey || 'MockWallet'
      });

      if (response.data.success) {
        setEventId(response.data.eventId);
        alert(`Event created successfully! Event ID: ${response.data.eventId}`);
        console.log('Event created:', response.data);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsCreatingEvent(false);
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
              className="px-8 py-3 bg-green-400 text-black font-bold hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingEvent ? 'CREATING...' : 'GO LIVE'}
            </button>
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
                  setIsWalletConnected(true);
                  setShowAccountModal(false);
                }}
                className="px-6 py-2 bg-green-400 text-black font-bold hover:bg-green-300 transition-colors"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


