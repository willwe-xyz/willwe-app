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
  const { user, logout, login } = usePrivy();
  const {  selectToken, selectedNodeId } = useNode();
  const { colorState, cycleColors } = useColorManagement();



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
        onNodeSelect: handleNodeSelect,
        selectedNodeId: selectedNodeId || '',
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