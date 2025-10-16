'use client';

import "./globals.css";
import { WalletContextProvider } from "@/components/WalletProvider";
import { MoonPayProvider } from "@moonpay/moonpay-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MoonPayProvider
          apiKey={process.env.NEXT_PUBLIC_MOONPAY_API_KEY || "pk_test_key"}
          debug={true}
        >
          <WalletContextProvider>
            {children}
          </WalletContextProvider>
        </MoonPayProvider>
      </body>
    </html>
  );
}
