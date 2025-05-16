"use client";

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { cookieToInitialState } from 'wagmi';
import { wagmiAdapter } from "@/config/appkit";
import { appKit } from '@/components/AppKitProvider';

// Initialize query client
const queryClient = new QueryClient();

export function AppKit({ children, cookies }: { children: React.ReactNode; cookies: string }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig, cookies);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
} 