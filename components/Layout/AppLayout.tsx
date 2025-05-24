// File: /components/Layout/AppLayout.tsx
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import { useNode } from '../../contexts/NodeContext';
import { useColorManagement } from '../../hooks/useColorManagement';
import { MainLayout } from './MainLayout';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout, login, authenticated } = usePrivy();
  const { selectToken, selectedNodeId } = useNode();
  const { colorState, cycleColors } = useColorManagement();

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    const chainId = user?.wallet?.chainId || '';
    if (chainId) {
      router.push(`/nodes/${chainId}/${nodeId}`);
    }
  }, [router, user?.wallet?.chainId]);

  // Handle logout with authentication check
  const handleLogout = useCallback(async () => {
    if (authenticated) {
      await logout();
      router.push('/');
    }
  }, [authenticated, logout, router]);

  return (
    <MainLayout
      headerProps={{
        userAddress: user?.wallet?.address,
        chainId: user?.wallet?.chainId || '',
        logout: handleLogout,
        login,
        onNodeSelect: handleNodeSelect,
        selectedNodeId: selectedNodeId || '',
        isTransacting: false,
        contrastingColor: colorState.contrastingColor,
        reverseColor: colorState.reverseColor,
        cycleColors,
        selectedTokenColor: colorState.contrastingColor
      }}
    >
      {children}
    </MainLayout>
  );
};

export default AppLayout;