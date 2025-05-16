"use client";

import React, { createContext, useContext } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { appKit } from '@/config/appkit';

// Create AppKit context
const AppKitContext = createContext<any>(null);

export function useAppKitContext() {
  const context = useContext(AppKitContext);
  if (!context) {
    throw new Error('useAppKitContext must be used within an AppKitProvider');
  }
  return context;
}

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppKitContext.Provider value={appKit}>
      <ChakraProvider>
        {children}
      </ChakraProvider>
    </AppKitContext.Provider>
  );
} 