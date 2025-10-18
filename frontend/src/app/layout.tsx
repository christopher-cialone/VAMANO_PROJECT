import type { Metadata } from "next";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletProvider";
import MoonPayBoundary from "@/components/MoonPayBoundary";

export const metadata: Metadata = {
  title: "VAMANO - Cypherpunk NFT Ticketing",
  description: "Decentralized event ticketing with on-chain NFTs and Apple Wallet integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
          <MoonPayBoundary>
            {children}
          </MoonPayBoundary>
        </WalletContextProvider>
      </body>
    </html>
  );
}
