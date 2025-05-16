// File: ./components/Layout/MainLayout.tsx

import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { useAppKit } from '../../hooks/useAppKit';
import { useRouter } from 'next/router';
import { useBalances } from '../../hooks/useBalances';
import Header from './Header';
import BalanceList from '../BalanceList';
import { useNode } from '../../contexts/NodeContext';
import { useColorManagement } from '../../hooks/useColorManagement';

interface MainLayoutProps {
  children: ReactNode;
  headerProps?: {
    userAddress?: string;
    chainId: string;
    logout?: () => void;
    login?: () => void;
    selectedNodeId?: string;
    isTransacting: boolean;
    contrastingColor: string;
    reverseColor: string;
    cycleColors: () => void;
    onNodeSelect: (nodeId: string) => void;
    selectedTokenColor: string;
  };
  rootToken?: string;
  onTokenSelect?: (tokenAddress: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  headerProps, 
  rootToken,
  onTokenSelect 
}) => {
  const { user } = useAppKit();
  const { selectedToken, selectToken } = useNode();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Only fetch balances if user is connected
  const shouldFetchBalances = Boolean(user?.wallet?.address);
  const chainId = headerProps?.chainId || user?.wallet?.chainId || '8453'; // Default to Base if not set
  const supportedChainIds = ['8453', '84532', '10', '420']; // Add your supported chain IDs here
  const isValidChain = supportedChainIds.includes(chainId);

  // Fetch balances for top bar using combined hook
  const { 
    balances, 
    protocolBalances,
    isLoading: balancesLoading 
  } = useBalances(
    shouldFetchBalances ? user?.wallet?.address : undefined,
    shouldFetchBalances ? chainId : undefined
  );

  // Handle token selection with navigation
  const handleTokenSelect = useCallback((tokenAddress: string) => {
    selectToken(tokenAddress);
    if (onTokenSelect) {
      onTokenSelect(tokenAddress);
    }
    // Always navigate to dashboard with the selected token
    router.push({
      pathname: '/dashboard',
      query: { token: tokenAddress }
    });
  }, [selectToken, router, onTokenSelect]);

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      {/* Header */}
      {headerProps && (
        <Header 
          {...headerProps} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}
      
      {/* Token Balance Bar - Always show when user is connected */}
      {shouldFetchBalances && (
        <Box width="100%" borderBottom="1px solid" borderColor="gray.200">
          {!isValidChain && (
            <Box bg="yellow.100" color="yellow.800" p={2} textAlign="center">
              Your wallet is connected to an unsupported network. Please switch to Base or a supported network.
            </Box>
          )}
          <BalanceList
            selectedToken={selectedToken}
            rootToken={rootToken}
            handleTokenSelect={handleTokenSelect}
            contrastingColor={headerProps?.contrastingColor || ''}
            reverseColor={headerProps?.reverseColor || ''}
            hoverColor={`${headerProps?.contrastingColor}20` || ''}
            balances={balances || []}
            protocolBalances={protocolBalances || []}
            isLoading={balancesLoading} 
            userAddress={user?.wallet?.address || ''} 
            chainId={chainId}
            searchQuery={searchQuery}
          />
        </Box>
      )}
      
      {/* Main Content */}
      <Box 
        flex={1} 
        overflow="auto"
        bg="gray.50"
      >
        {children}
      </Box>
    </Box>
  );
};