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
import { RootActivityFeed } from '../components/RootActivityFeed';
import { useColorManagement } from '../hooks/useColorManagement';
import { useRootNodes } from '../hooks/useRootNodes';
import { useState, useEffect } from 'react';
import { deployments } from '../config/deployments';
import { ethers } from 'ethers';

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const [selectedToken, setSelectedToken] = useState<string>('');
  
  // Hooks
  const { colorState, cycleColors, setColorState, getContrastColor } = useColorManagement();

  const { user, ready, authenticated, logout, login } = usePrivy();
  const { wallets } = useWallets();
  const userAddress = user?.wallet?.address;

  // Get token from URL or context
  const tokenAddress = router.query.token as string || selectedToken;
  
  // Find supported networks from deployments
  const supportedChainIds = Object.keys(deployments.WillWe);
  
  // Default to a valid chain ID where WillWe is deployed (e.g. Optimism Sepolia)
  const defaultChainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN || '11155420';
  
  // Get chain ID from URL, wallet, or default to a supported chain
  let chainId = router.query.chainId as string || wallets[0]?.chainId?.replace('eip155:', '');
  
  // Validate the chain ID is supported
  const cleanChainId = chainId?.replace('eip155:', '') || '';
  const isValidChain = supportedChainIds.includes(cleanChainId);
  
  // If the current chain is not supported, default to a valid one
  const effectiveChainId = isValidChain ? cleanChainId : defaultChainId;
  
  // Update URL if needed to reflect the correct chain
  useEffect(() => {
    if (ready && !isValidChain && router.isReady) {
      router.replace({
        pathname: router.pathname,
        query: { 
          ...router.query,
          chainId: defaultChainId 
        }
      }, undefined, { shallow: true });
      
      console.log({
        title: "Network Changed",
        description: `Switched to supported network (Chain ID: ${defaultChainId})`,
        status: "info",
        duration: 5000,
      });
    }
  }, [ready]);

  // Fetch nodes data (using the validated chainId)
  const { 
    data: nodes, 
    isLoading: nodesLoading, 
    error: nodesError, 
    refetch: refreshNodes 
  } = useRootNodes(
    effectiveChainId,
    tokenAddress,
    userAddress
  );

  // Handle token selection
  const handleTokenSelect = (tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    // Generate a new color based on the token address
    const newColor = `#${tokenAddress.slice(2, 8)}`; // Use first 6 chars of token address as color
    setColorState({
      contrastingColor: newColor,
      reverseColor: getContrastColor(newColor),
      hoverColor: `${newColor}20`
    });
    router.push({
      pathname: '/dashboard',
      query: { 
        token: tokenAddress,
        chainId: effectiveChainId 
      }
    }, undefined, { shallow: true });
  };

  // Handle node selection
  const handleNodeSelect = (nodeId: string) => {
    router.push(`/nodes/${effectiveChainId}/${nodeId}`);
  };

  // Prepare header props
  const headerProps = {
    userAddress: user?.wallet?.address,
    chainId: effectiveChainId,
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
      <UserActivityFeed 
        userAddress={userAddress || ''} 
        chainId={effectiveChainId} 
      />
    </Box>
  );

  // Display notification when using a different chain than user's wallet
  const renderChainMismatchWarning = () => {
    const walletChainId = wallets[0]?.chainId?.replace('eip155:', '');
    if (walletChainId && walletChainId !== effectiveChainId) {
      return (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          <Text>
            Your wallet is connected to a different network (Chain ID: {walletChainId}). 
            This dashboard is displaying data for Chain ID: {effectiveChainId}.
          </Text>
        </Alert>
      );
    }
    return null;
  };

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


  return (
    <MainLayout 
      headerProps={headerProps} 
      rootToken={tokenAddress}
      onTokenSelect={(tokenAddress) => {
        // Generate a new color based on the token address
        const newColor = `#${tokenAddress.slice(2, 8)}`; // Use first 6 chars of token address as color
        setColorState({
          contrastingColor: newColor,
          reverseColor: getContrastColor(newColor),
          hoverColor: `${newColor}20`
        });
      }}
    >
      <Box flex={1} overflow="auto" bg="gray.50" p={6}>
        {renderChainMismatchWarning()}
        
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
                chainId={effectiveChainId}
                selectedToken={tokenAddress}
                onNodeSelect={headerProps.onNodeSelect}
              />
            </GridItem>
            <GridItem>
              <RootActivityFeed 
                tokenAddress={tokenAddress}
                chainId={effectiveChainId}
                showDebug={process.env.NODE_ENV === 'development'}
                selectedTokenColor={colorState.contrastingColor}
              />
            </GridItem>
          </Grid>
        )}
      </Box>
    </MainLayout>
  );
}