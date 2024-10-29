import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Box, Grid, Container, useToast } from '@chakra-ui/react';
import { useColorManagement } from '../../hooks/useColorManagement';
import NodeViewContainer from '../NodeView/NodeViewContainer';
import { usePrivy } from "@privy-io/react-auth";
import { useNode } from '../../contexts/NodeContext';
import { useBalances } from '../../hooks/useCovalentBalances';
import LoadingSkeleton from '../LoadingSkeleton';
import BalanceList from '../BalanceList';
import ActivityLogs from '../ActivityLogs';
import MainLayout from '../Layout/MainLayout';

interface NodeViewLayoutProps {
  chainId?: string;
  nodeId?: string;
}

const NodeViewLayout: React.FC<NodeViewLayoutProps> = ({ 
  chainId: propChainId, 
  nodeId: propNodeId 
}) => {
  const router = useRouter();
  const toast = useToast();
  const { colorState, cycleColors, updateColors } = useColorManagement();
  const { ready, authenticated, user, logout } = usePrivy();
  const { selectNode } = useNode();

  // Get chain and node IDs from URL if available
  const urlChainId = router.query.chainId as string;
  const urlNodeId = router.query.nodeId as string;

  // Use URL params if available, otherwise use props
  const chainId = urlChainId || propChainId || user?.wallet?.chainId?.toString();
  const nodeId = urlNodeId || propNodeId;

  // Fetch balances for sidebar
  const { balances, protocolBalances, isLoading: isBalancesLoading } = useBalances(
    user?.wallet?.address,
    chainId
  );

  // Handle initial loading state
  const isLoading = !router.isReady || !ready;

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [logout, router, toast]);

  // Handle node selection
  const handleNodeSelect = useCallback((selectedNodeId: string) => {
    if (chainId) {
      selectNode(selectedNodeId, chainId);
      router.push(`/nodes/${chainId}/${selectedNodeId}`);
    }
  }, [chainId, router, selectNode]);

  // Display loading skeleton if the page is still loading
  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <LoadingSkeleton />
      </Box>
    );
  }

  const headerProps = {
    userAddress: user?.wallet?.address,
    chainId: chainId || '',
    logout: handleLogout,
    login: async () => { /* implement login */ },
    selectedNodeId: nodeId,
    onNodeSelect: handleNodeSelect,
    isTransacting: false,
    contrastingColor: colorState.contrastingColor,
    reverseColor: colorState.reverseColor,
    cycleColors,
    hideConnect: !authenticated && !!nodeId
  };

  // For root path, show dashboard layout
  if (!nodeId) {
    return (
      <MainLayout headerProps={headerProps}>
        <Container maxW="container.xl" py={4}>
          <Grid
            templateColumns={{ base: '1fr', md: '100px 1fr' }}
            gap={4}
            minH="calc(100vh - 64px)"
          >
            {/* Balance Sidebar */}
            <Box
              display={{ base: 'none', md: 'block' }}
              borderRight="1px solid"
              borderColor="gray.200"
              height="100%"
            >
              <BalanceList
                selectedToken=""
                handleTokenSelect={() => {}}
                contrastingColor={colorState.contrastingColor}
                reverseColor={colorState.reverseColor}
                hoverColor={colorState.hoverColor}
                userAddress={user?.wallet?.address || ''}
                chainId={chainId || ''}
                balances={balances}
                protocolBalances={protocolBalances}
                isLoading={isBalancesLoading}
              />
            </Box>

            {/* Main Content Area with Activity Logs */}
            <Box>
              <ActivityLogs />
            </Box>
          </Grid>
        </Container>
      </MainLayout>
    );
  }

  // For specific node views, show node container
  return (
    <NodeViewContainer
      chainId={chainId}
      nodeId={nodeId}
      colorState={colorState}
      cycleColors={cycleColors}
    />
  );
};

export default NodeViewLayout;