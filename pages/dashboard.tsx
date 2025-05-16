// File: ./pages/dashboard.tsx

import { useRouter } from 'next/router';
import { useAppKit } from '@/hooks/useAppKit';
import { 
  Box, 
  Text, 
  Spinner, 
  Alert, 
  AlertIcon, 
  useToast,
  Grid,
  GridItem,
  Button
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
import TokenBalance from '../components/TokenBalance';

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [rootTokenSymbol, setRootTokenSymbol] = useState<string>('PSC');
  
  // Hooks
  const { colorState, cycleColors, setColorState, getContrastColor } = useColorManagement();
  const { user } = useAppKit();
  const userAddress = user?.wallet?.address;

  // Get token from URL or context
  const tokenAddress = router.query.token as string || selectedToken;
  
  // Set initial color based on token address
  useEffect(() => {
    if (tokenAddress) {
      const newColor = `#${tokenAddress.slice(2, 8)}`;
      setColorState({
        contrastingColor: newColor,
        reverseColor: getContrastColor(newColor),
        hoverColor: `${newColor}20`
      });
    }
  }, [tokenAddress, setColorState, getContrastColor]);

  // Find supported networks from deployments
  const supportedChainIds = Object.keys(deployments.WillWe);
  
  // Default to Base chain ID
  const defaultChainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN || '8453';
  
  // Get chain ID from URL or default to a supported chain
  let chainId = router.query.chainId as string;
  
  // Validate the chain ID is supported
  const cleanChainId = chainId?.replace('eip155:', '') || '';
  const isValidChain = supportedChainIds.includes(cleanChainId);
  
  // If the current chain is not supported, default to a valid one
  const effectiveChainId = isValidChain ? cleanChainId : defaultChainId;
  
  // Update URL if needed to reflect the correct chain
  useEffect(() => {
    if (router.isReady) {
      // If user is on an unsupported network, switch to default
      if (!isValidChain) {
        router.replace({
          pathname: router.pathname,
          query: { 
            ...router.query,
            chainId: defaultChainId 
          }
        }, undefined, { shallow: true });
      }
    }
  }, [isValidChain, router, defaultChainId, effectiveChainId]);

  // Handle network switch
  const handleSwitchNetwork = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await (window.ethereum as any).request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${Number(defaultChainId).toString(16)}` }],
        });
        toast({
          title: "Network Switched",
          description: `Successfully switched to Chain ID: ${defaultChainId}`,
          status: "success",
          duration: 5000,
        });
      } else {
        throw new Error('No Ethereum provider found');
      }
    } catch (error) {
      toast({
        title: "Network Switch Failed",
        description: error instanceof Error ? error.message : "Failed to switch network",
        status: "error",
        duration: 5000,
      });
    }
  };

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
    isTransacting: false,
    contrastingColor: colorState.contrastingColor,
    reverseColor: colorState.reverseColor,
    cycleColors,
    onNodeSelect: (nodeId: string) => {
      handleNodeSelect(nodeId);
    },
    selectedTokenColor: colorState.contrastingColor
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

  // Display notification when using an unsupported network
  const renderChainMismatchWarning = () => {
    if (!isValidChain) {
      return (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          <Box flex="1">
            <Text>
              Your wallet is connected to an unsupported network. 
              Please switch to a supported network to continue.
            </Text>
            <Button
              size="sm"
              colorScheme="purple"
              onClick={handleSwitchNetwork}
              mt={2}
            >
              Switch Network
            </Button>
          </Box>
        </Alert>
      );
    }
    return null;
  };

  // Loading state
  if (!user.isAuthenticated || nodesLoading) {
    return (
      <MainLayout headerProps={headerProps}>
        <Box className="flex flex-col items-center justify-center min-h-screen">
          <Spinner size="xl" color={colorState.contrastingColor} />
          <Text mt={4}>Loading dashboard...</Text>
        </Box>
      </MainLayout>
    );
  }

  // Error state
  if (nodesError) {
    return (
      <MainLayout headerProps={headerProps}>
        <Box className="flex flex-col items-center justify-center min-h-screen">
          <Alert status="error" mb={4}>
            <AlertIcon />
            <Text>Error loading nodes: {nodesError.message}</Text>
          </Alert>
        </Box>
      </MainLayout>
    );
  }

  // Main dashboard content
  return (
    <MainLayout headerProps={headerProps}>
      {/* Token Balances at the top */}
      <Box mb={6}>
        {/* TODO: Replace with real balances from user context or API */}
        {/* Example usage: <TokenBalance balanceItem={...} isSelected={false} contrastingColor={colorState.contrastingColor} reverseColor={colorState.reverseColor} /> */}
      </Box>
      <Box className="flex flex-col mx-auto w-full p-1">
        {renderChainMismatchWarning()}
        
        {nodes && nodes.length > 0 ? (
          <Grid templateColumns="repeat(1, 1fr)" gap={6}>
            <GridItem>
              <RootNodeDetails
                nodes={nodes}
                isLoading={false}
                error={null}
                onRefresh={refreshNodes}
                selectedTokenColor={colorState.contrastingColor}
                chainId={effectiveChainId}
                selectedToken={tokenAddress}
                onNodeSelect={handleNodeSelect}
                tokenSymbol={rootTokenSymbol}
              />
            </GridItem>
            <GridItem>
              <RootActivityFeed 
                chainId={effectiveChainId}
                tokenAddress={tokenAddress}
                showDebug={process.env.NODE_ENV === 'development'}
                selectedTokenColor={colorState.contrastingColor}
              />
            </GridItem>
          </Grid>
        ) : (
          renderEmptyDashboard()
        )}
      </Box>
    </MainLayout>
  );
}