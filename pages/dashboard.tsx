// File: ./pages/dashboard.tsx

import { useRouter } from 'next/router';
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { 
  Box, 
  Text, 
  Spinner, 
  Alert, 
  AlertIcon, 
  useToast,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { MainLayout } from '../components/Layout/MainLayout';
import { RootNodeDetails } from '../components/RootNodeDetails';
import { UserActivityFeed } from '../components/UserActivityFeed';
import { useColorManagement } from '../hooks/useColorManagement';
import { useRootNodes } from '../hooks/useRootNodes';
import { useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const [selectedToken, setSelectedToken] = useState<string>('');
  
  // Hooks
  const { colorState, cycleColors } = useColorManagement();

  const { user, ready, authenticated, logout, login } = usePrivy();
  const { wallets } = useWallets();
  const userAddress = user?.wallet?.address;

  // Get token from URL or context
  const tokenAddress = router.query.token as string || selectedToken;
  
  // Add proper null checks and default chainId
  const defaultChainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN || '1';
  const chainId = router.query.chainId as string || wallets[0]?.chainId || defaultChainId;
  const cleanChainId = chainId.replace('eip155:', '');

  // Fetch nodes data
  const { 
    data: nodes, 
    isLoading: nodesLoading, 
    error: nodesError, 
    refetch: refreshNodes 
  } = useRootNodes(
    cleanChainId,
    tokenAddress,
    user?.wallet?.address || ''
  );

  // Handle token selection
  const handleTokenSelect = (tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    router.push({
      pathname: '/dashboard',
      query: { token: tokenAddress }
    }, undefined, { shallow: true });
  };

  // Handle node selection
  const handleNodeSelect = (nodeId: string) => {
    router.push(`/nodes/${cleanChainId}/${nodeId}`);
  };

  // Prepare header props
  const headerProps = {
    userAddress: user?.wallet?.address || null,
    chainId: cleanChainId,
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
    <Box className="flex flex-col mx-auto w-full p-1">
      {/* <Box className="w-full bg-white rounded-lg shadow-sm p-8 border border-gray-100">
        <Text className="text-2xl font-semibold mb-6 text-center">
          Welcome to WillWe
        </Text>
        <Text className="text-gray-600 text-center mb-8">
          Select a token from above to explore its value network
        </Text>
        
      </Box> */}

        <UserActivityFeed userAddress={userAddress} chainId={cleanChainId} tokenAddress={tokenAddress} />

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
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            <GridItem>
              <RootNodeDetails 
                nodes={nodes || []}
                isLoading={nodesLoading}
                error={nodesError}
                onRefresh={refreshNodes}
                selectedTokenColor={colorState.contrastingColor}
                chainId={cleanChainId}
                selectedToken={tokenAddress}
                onNodeSelect={headerProps.onNodeSelect}
              />
            </GridItem>
            <GridItem>
              <UserActivityFeed 
                userAddress={user?.wallet?.address}
                selectedTokenColor={colorState.contrastingColor}
              />
            </GridItem>
          </Grid>
        )}
      </Box>
    </MainLayout>
  );
}