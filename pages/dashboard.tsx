// File: ./pages/dashboard.tsx

import { useRouter } from 'next/router';
import { usePrivy } from "@privy-io/react-auth";
import { 
  Box, 
  Text, 
  Spinner, 
  Alert, 
  AlertIcon, 
  useToast 
} from '@chakra-ui/react';
import { MainLayout } from '../components/Layout/MainLayout';
import { RootNodeDetails } from '../components/RootNodeDetails';
import ActivityFeed from '../components/ActivityFeed/ActivityFeed';
import { useNode } from '../contexts/NodeContext';
import { useColorManagement } from '../hooks/useColorManagement';
import { useRootNodes } from '../hooks/useRootNodes';
import { useChainId } from '../hooks/useChainId';
import { useActivityFeed } from '../hooks/useActivityFeed';

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  
  // Hooks
  const { colorState, cycleColors } = useColorManagement();
  const { user, ready, authenticated, logout, login } = usePrivy();
  const { selectedToken, selectToken } = useNode();
  const { chainId } = useChainId();
  const { activities, isLoading: activitiesLoading } = useActivityFeed(chainId);

  // Get token from URL or context
  const tokenAddress = router.query.token as string || selectedToken;

  // Fetch nodes data
  const { 
    data: nodes, 
    isLoading: nodesLoading, 
    error: nodesError, 
    refetch: refreshNodes 
  } = useRootNodes(
    chainId,
    tokenAddress,
    user?.wallet?.address || ''
  );

  // Handle token selection
  const handleTokenSelect = (tokenAddress: string) => {
    selectToken(tokenAddress);
    router.push({
      pathname: '/dashboard',
      query: { token: tokenAddress }
    }, undefined, { shallow: true });
  };

  // Handle node selection
  const handleNodeSelect = (nodeId: string) => {
    router.push(`/nodes/${chainId}/${nodeId}`);
  };

  // Prepare header props
  const headerProps = {
    userAddress: user?.wallet?.address,
    chainId: chainId,
    logout,
    login,
    isTransacting: false,
    contrastingColor: colorState.contrastingColor,
    reverseColor: colorState.reverseColor,
    cycleColors,
    onNodeSelect: (nodeId: string) => {
      handleNodeSelect(nodeId);
    },
  };

  // Empty dashboard state
  const renderEmptyDashboard = () => (
    <Box className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto w-full p-8">
      <Box className="w-full bg-white rounded-lg shadow-sm p-8 border border-gray-100">
        <Text className="text-2xl font-semibold mb-6 text-center">
          Welcome to WillWe
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Select a token from above to explore its value network
        </Text>
        
        <ActivityFeed
          activities={activities}
          isLoading={activitiesLoading}
          onRefresh={refreshNodes}
        />
      </Box>
    </Box>
  );

  // Loading state
  if (!ready || nodesLoading) {
    return (
      <MainLayout headerProps={headerProps}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Spinner size="xl" color={colorState.contrastingColor} />
        </Box>
      </MainLayout>
    );
  }

  // Authentication check
  if (!authenticated) {
    return (
      <MainLayout headerProps={headerProps}>
        <Alert status="warning" variant="subtle">
          <AlertIcon />
          Please connect your wallet to continue
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout headerProps={headerProps}>
      <Box flex={1} overflow="auto" bg="gray.50" p={6}>
        {!tokenAddress ? (
          renderEmptyDashboard()
        ) : (
          <RootNodeDetails 
            nodes={nodes || []}
            isLoading={nodesLoading}
            error={nodesError}
            onRefresh={refreshNodes}
            selectedTokenColor={colorState.contrastingColor}
            chainId={chainId}
            selectedToken={tokenAddress}
            onNodeSelect={handleNodeSelect}
          />
        )}
      </Box>
    </MainLayout>
  );
}