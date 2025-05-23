// File: ./components/Layout/MainLayout.tsx

import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
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
    logout: () => void;
    login: () => void;
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
  const { user } = usePrivy();
  const { selectedToken, selectToken } = useNode();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Only fetch balances if user is connected and chainId is available
  const shouldFetchBalances = useMemo(() => 
    Boolean(user?.wallet?.address && headerProps?.chainId),
    [user?.wallet?.address, headerProps?.chainId]
  );
  
  // Fetch balances for top bar using combined hook
  const { 
    balances, 
    protocolBalances,
    isLoading: balancesLoading 
  } = useBalances(
    shouldFetchBalances ? user?.wallet?.address : undefined,
    shouldFetchBalances ? headerProps?.chainId : undefined
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
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}
      
      {/* Token Balance Bar - Only show when user is connected */}
      {shouldFetchBalances && (
        <Box width="100%" borderBottom="1px solid" borderColor="gray.200">
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
            userAddress={headerProps?.userAddress || ''} 
            chainId={headerProps?.chainId || ''}
            searchTerm={searchTerm}
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