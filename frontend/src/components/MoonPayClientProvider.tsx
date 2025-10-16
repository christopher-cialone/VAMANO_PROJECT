'use client';

import { MoonPayProvider } from '@moonpay/moonpay-react';
import { ReactNode } from 'react';

interface MoonPayClientProviderProps {
  children: ReactNode;
}

export function MoonPayClientProvider({ children }: MoonPayClientProviderProps) {
  return (
    <MoonPayProvider
      apiKey={process.env.NEXT_PUBLIC_MOONPAY_API_KEY || 'pk_test_key'}
      environment="sandbox"
      debug={true}
    >
      {children}
    </MoonPayProvider>
  );
}

