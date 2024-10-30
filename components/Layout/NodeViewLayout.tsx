// components/Layout/NodeViewLayout.tsx
import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Box, useToast } from '@chakra-ui/react';
import { usePrivy } from "@privy-io/react-auth";
import { useNode } from '../../contexts/NodeContext';
import { useNodeData } from '../../hooks/useNodeData';
import LoadingSkeleton from '../LoadingSkeleton';
import NodeDetails from '../NodeDetails';
import { MainLayout } from './MainLayout';
import ContentLayout from './ContentLayout';
import { useBalances } from '../../hooks/useBalances';

interface NodeViewLayoutProps {
  chainId: string;
  nodeId: string;
  colorState: {
    contrastingColor: string;
    reverseColor: string;
    hoverColor: string;
  };
  cycleColors: () => void;
}

const NodeViewLayout: React.FC<NodeViewLayoutProps> = ({
  chainId,
  nodeId,
  colorState,
  cycleColors
}) => {
  const router = useRouter();
  const toast = useToast();
  const { ready, authenticated, user, logout } = usePrivy();
  const { selectNode } = useNode();

  // Fetch node data
  const { data: nodeData, isLoading: isNodeLoading, error: nodeError } = useNodeData(chainId, nodeId);

  // Fetch balances for sidebar
  const { balances, protocolBalances, isLoading: isBalancesLoading } = useBalances(
    user?.wallet?.address,
    chainId
  );

  // Handle node selection
  const handleNodeSelect = useCallback((selectedNodeId: string) => {
    selectNode(selectedNodeId, chainId);
    router.push(`/nodes/${chainId}/${selectedNodeId}`);
  }, [chainId, router, selectNode]);

  // Handle error state
  useEffect(() => {
    if (nodeError) {
      toast({
        title: "Error loading node",
        description: nodeError.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [nodeError, toast]);

  // Handle authentication
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        status: "error",
        duration: 5000,
      });
    }
  }, [logout, router, toast]);

  // Display loading skeleton if the page is still loading
  if (!router.isReady || !ready || isNodeLoading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <LoadingSkeleton />
      </Box>
    );
  }

  const headerProps = {
    userAddress: user?.wallet?.address,
    chainId,
    logout: handleLogout,
    login: async () => {/* implement login */},
    selectedNodeId: nodeId,
    onNodeSelect: handleNodeSelect,
    isTransacting: false,
    contrastingColor: colorState.contrastingColor,
    reverseColor: colorState.reverseColor,
    cycleColors,
    hideConnect: !authenticated
  };

  return (
    <MainLayout headerProps={headerProps}>
      <ContentLayout
        sidebarProps={{
          selectedToken: nodeData?.basicInfo?.[0] || '',
          handleTokenSelect: () => {}, // No token selection in node view
          ...colorState,
          userAddress: user?.wallet?.address || '',
          chainId,
          balances: balances || [],
          protocolBalances: protocolBalances || [],
          isLoading: isBalancesLoading
        }}
      >
        <NodeDetails 
          chainId={chainId}
          nodeId={nodeId}
          onNodeSelect={handleNodeSelect}
          selectedTokenColor={colorState.contrastingColor}
        />
      </ContentLayout>
    </MainLayout>
  );
};

export default NodeViewLayout;