'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const MoonPayClientProviderDynamic = dynamic(
  () => import('./MoonPayClientProvider').then(m => m.MoonPayClientProvider),
  { ssr: false }
);

interface MoonPayBoundaryProps {
  children: ReactNode;
}

export default function MoonPayBoundary({ children }: MoonPayBoundaryProps) {
  return (
    <MoonPayClientProviderDynamic>
      {children}
    </MoonPayClientProviderDynamic>
  );
}



