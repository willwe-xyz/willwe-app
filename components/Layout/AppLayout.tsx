// File: /components/Layout/AppLayout.tsx
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import { Box } from '@chakra-ui/react';
import { useNode } from '../../contexts/NodeContext';
import { useColorManagement } from '../../hooks/useColorManagement';
import { MainLayout } from './MainLayout';
import BalanceList from '../BalanceList';
import { useCovalentBalances } from '../../hooks/useCovalentBalances';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, ready, authenticated, logout, login } = usePrivy();
  const { selectedToken, selectToken, selectedNodeId } = useNode();
  const { colorState, cycleColors } = useColorManagement();

  // Get balances for the balance list
  const { 
    balances, 
    protocolBalances, 
    isLoading: balancesLoading 
  } = useCovalentBalances(
    user?.wallet?.address || '',
    user?.wallet?.chainId || ''
  );

  // Handle token selection
  const handleTokenSelect = useCallback((tokenAddress: string) => {
    selectToken(tokenAddress);
    router.push({
      pathname: '/dashboard',
      query: { token: tokenAddress }
    });
  }, [selectToken, router]);

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    const chainId = user?.wallet?.chainId || '';
    if (chainId) {
      router.push(`/nodes/${chainId}/${nodeId}`);
    }
  }, [router, user?.wallet?.chainId]);

  return (
    <MainLayout
      headerProps={{
        userAddress: user?.wallet?.address,
        chainId: user?.wallet?.chainId || '',
        logout,
        login,
        selectedNodeId,
        onNodeSelect: handleNodeSelect,
        isTransacting: false,
        contrastingColor: colorState.contrastingColor,
        reverseColor: colorState.reverseColor,
        cycleColors,
      }}
    >
      {children}
    </MainLayout>
  );
};

export default AppLayout;