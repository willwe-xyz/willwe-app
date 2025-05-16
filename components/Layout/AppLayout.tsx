// File: /components/Layout/AppLayout.tsx
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAppKit } from '../../hooks/useAppKit';
import { useNode } from '../../contexts/NodeContext';
import { useColorManagement } from '../../hooks/useColorManagement';
import { MainLayout } from './MainLayout';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user: { isAuthenticated, wallet }, login, logout } = useAppKit();
  const { selectToken, selectedNodeId } = useNode();
  const { colorState, cycleColors } = useColorManagement();

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    const chainId = wallet?.chainId || '';
    if (chainId) {
      router.push(`/nodes/${chainId}/${nodeId}`);
    }
  }, [router, wallet?.chainId]);

  return (
    <MainLayout
      headerProps={{
        userAddress: wallet?.address || undefined,
        chainId: wallet?.chainId || '',
        logout,
        login,
        onNodeSelect: handleNodeSelect,
        selectedNodeId: selectedNodeId || undefined,
        isTransacting: false,
        contrastingColor: colorState.contrastingColor,
        reverseColor: colorState.reverseColor,
        cycleColors,
        selectedTokenColor: colorState.contrastingColor,
      }}
    >
      {children}
    </MainLayout>
  );
};

export default AppLayout;