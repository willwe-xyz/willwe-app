// File: ./components/Layout/MainLayout.tsx

import React, { ReactNode, useCallback } from 'react';
import { Box } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useBalances } from '../../hooks/useBalances';
import Header from './Header';
import BalanceList from '../BalanceList';
import { useNode } from '../../contexts/NodeContext';

interface MainLayoutProps {
  children: ReactNode;
  headerProps?: {
    userAddress?: string;
    chainId: string;
    logout: () => void;
    login: () => void;
    selectedNodeId?: string;
    isTransacting: boolean;
    contrastingColor: string;
    reverseColor: string;
    cycleColors: () => void;
    onNodeSelect: (nodeId: string) => void;
  };
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, headerProps }) => {
  const { user } = usePrivy();
  const { selectedToken, selectToken } = useNode();
  const router = useRouter();
  
  // Fetch balances for top bar using combined hook
  const { 
    balances, 
    protocolBalances,
    isLoading: balancesLoading 
  } = useBalances(
    user?.wallet?.address,
    headerProps?.chainId
  );

  // Handle token selection with navigation
  const handleTokenSelect = useCallback((tokenAddress: string) => {
    selectToken(tokenAddress);
    // Always navigate to dashboard with the selected token
    router.push({
      pathname: '/dashboard',
      query: { token: tokenAddress }
    });
  }, [selectToken, router]);

  return (
    <Box height="100vh" display="flex" flexDirection="column" overflow="hidden">
      {/* Header */}
      {headerProps && <Header {...headerProps} />}
      
      {/* Token Balance Bar - Always visible */}
      {user?.wallet?.address && (
        <Box width="100%" borderBottom="1px solid" borderColor="gray.200">
          <BalanceList
            selectedToken={selectedToken}
            handleTokenSelect={handleTokenSelect}
            contrastingColor={headerProps?.contrastingColor || ''}
            reverseColor={headerProps?.reverseColor || ''}
            hoverColor={`${headerProps?.contrastingColor}20` || ''}
            balances={balances || []}
            protocolBalances={protocolBalances || []}
            isLoading={balancesLoading} userAddress={headerProps?.userAddress || ''} chainId={headerProps?.chainId || '' 
            }          />
        </Box>
      )}
      
      {/* Main Content */}
      <Box 
        flex={1} 
        overflow="hidden"
        bg="gray.50"
      >
        {children}
      </Box>
    </Box>
  );
};