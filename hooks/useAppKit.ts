"use client";

import { useEffect, useState } from 'react';
import { Eip1193Provider } from 'ethers';
import { useAppKitContext } from '@/components/AppKitProvider';
import { wagmiAdapter } from '@/config/appkit';
import type { AppKit } from '@reown/appkit';
import { useAccount, useChainId } from 'wagmi';

interface EthereumProvider extends Eip1193Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}

declare global {
  interface Window {
    ethereum?: Record<string, unknown>;
  }
}

export function useAppKit() {
  const appKit = useAppKitContext();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await appKit.initialize(wagmiAdapter);
        setIsInitializing(false);
      } catch (err) {
        console.error('Failed to initialize AppKit:', err);
        setIsInitializing(false);
      }
    };
    init();
  }, [appKit]);

  const user = {
    wallet: {
      address: address,
      chainId: chainId ? chainId.toString() : undefined,
    },
    isAuthenticated: !!isConnected && !!address,
  };

  return {
    appKit,
    walletProvider: null,
    user,
    isInitializing,
  };
}

export function useWallets() {
  const { user } = useAppKit();
  
  return {
    wallets: user.wallet.address ? [user.wallet.address] : [],
    isConnected: user.isAuthenticated,
  };
} 