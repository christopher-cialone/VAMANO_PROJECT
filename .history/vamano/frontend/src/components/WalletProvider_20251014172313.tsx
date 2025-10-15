'use client';

import React, { FC, ReactNode } from 'react';

interface WalletContextProviderProps {
  children: ReactNode;
}

// Simplified wallet provider for testing
export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  return <>{children}</>;
};

// Mock wallet buttons
export const WalletMultiButton = () => {
  return (
    <button className="px-4 py-2 bg-green-400 text-black font-mono hover:bg-green-300">
      Connect Wallet (Mock)
    </button>
  );
};

export const WalletDisconnectButton = () => {
  return (
    <button className="px-4 py-2 border border-green-400 text-green-400 font-mono hover:bg-green-400 hover:text-black">
      Disconnect
    </button>
  );
};
