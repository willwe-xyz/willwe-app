import React, { ReactNode } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { useCovalentBalances } from '../../hooks/useCovalentBalances';
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
  };
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, headerProps }) => {
  const { user } = usePrivy();
  const { selectedToken, selectToken } = useNode();
  const toast = useToast();

  // Fetch balances for sidebar
  const { 
    balances, 
    protocolBalances, 
    isLoading: balancesLoading 
  } = useCovalentBalances(
    user?.wallet?.address || '',
    headerProps?.chainId || ''
  );

  const handleTokenSelect = (tokenAddress: string) => {
    selectToken(tokenAddress);
    // Optionally navigate to dashboard if needed
  };

  return (
    <Box height="100vh" display="flex" flexDirection="column" overflow="hidden">
      {headerProps && <Header {...headerProps} />}
      
      <Box flex={1} display="flex">
        {/* Sidebar - Single Instance */}
        <Box 
          width="240px" 
          borderRight="1px solid" 
          borderColor="gray.200"
          height="100%"
          overflow="hidden"
          display="flex"
          flexDirection="column"
          bg="white"
        >
          <BalanceList
            selectedToken={selectedToken}
            handleTokenSelect={handleTokenSelect}
            contrastingColor={headerProps?.contrastingColor || ''}
            reverseColor={headerProps?.reverseColor || ''}
            hoverColor={`${headerProps?.contrastingColor}20` || ''}
            userAddress={user?.wallet?.address || ''}
            chainId={headerProps?.chainId || ''}
            balances={balances || []}
            protocolBalances={protocolBalances || []}
            isLoading={balancesLoading}
          />
        </Box>

        {/* Main Content */}
        <Box flex={1} overflow="hidden">
          {children}
        </Box>
      </Box>
    </Box>
  );
};